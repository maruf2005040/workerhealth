/**
 * Cloudflare Pages Function: /api/admin
 * Admin management endpoint - create, update, delete admin users
 * Protected endpoint - requires admin authentication via API key
 */

const CONSTANTS = {
    MIN_ID_LENGTH: 3,
    MIN_PASSWORD_LENGTH: 6,
    MAX_ID_LENGTH: 50,
    MAX_PASSWORD_LENGTH: 100
};

async function tursoQuery(env, sql, args = []) {
    const TURSO_URL = env.TURSO_URL;
    const TURSO_AUTH_TOKEN = env.TURSO_AUTH_TOKEN;

    if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
        throw new Error('Database credentials not configured');
    }

    const apiUrl = TURSO_URL.replace('libsql://', 'https://') + '/v2/query';

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TURSO_AUTH_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            statements: [{ sql, args }]
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Turso error: ${response.status}`);
    }

    return await response.json();
}

async function ensureTable(env) {
    try {
        await tursoQuery(env, `
            CREATE TABLE IF NOT EXISTS admin_users (
                id TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            )
        `);
    } catch (e) {
        console.log('Table exists or creation info:', e.message);
    }
}

function verifyAdminKey(request, env) {
    const apiKey = request.headers.get('X-Admin-Key');
    const validKey = env.ADMIN_API_KEY;
    
    if (!validKey) {
        console.warn('ADMIN_API_KEY not configured in Cloudflare environment');
        return false;
    }
    
    return apiKey === validKey;
}

function validateAdminUser(id, password) {
    if (!id || !password) {
        return { valid: false, error: 'Missing id or password' };
    }
    
    if (typeof id !== 'string' || typeof password !== 'string') {
        return { valid: false, error: 'Invalid credential types' };
    }
    
    if (id.length < CONSTANTS.MIN_ID_LENGTH || id.length > CONSTANTS.MAX_ID_LENGTH) {
        return { valid: false, error: `Admin ID must be ${CONSTANTS.MIN_ID_LENGTH}-${CONSTANTS.MAX_ID_LENGTH} characters` };
    }
    
    if (password.length < CONSTANTS.MIN_PASSWORD_LENGTH || password.length > CONSTANTS.MAX_PASSWORD_LENGTH) {
        return { valid: false, error: `Password must be ${CONSTANTS.MIN_PASSWORD_LENGTH}-${CONSTANTS.MAX_PASSWORD_LENGTH} characters` };
    }
    
    if (/[\s'"\\;]/.test(id) || /[\s'"\\;]/.test(password)) {
        return { valid: false, error: 'Invalid characters in credentials' };
    }
    
    return { valid: true };
}

async function handleGetUsers(context) {
    if (!verifyAdminKey(context.request, context.env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        await ensureTable(context.env);
        const result = await tursoQuery(context.env, 'SELECT id, created_at FROM admin_users ORDER BY created_at DESC');

        const users = [];
        if (result.results?.[0]?.rows) {
            result.results[0].rows.forEach(row => {
                users.push({ id: row[0], created_at: row[1] });
            });
        }

        return new Response(JSON.stringify({ users }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Get users error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleCreateUser(context) {
    if (!verifyAdminKey(context.request, context.env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await context.request.json();
        const { id, password } = body;

        const validation = validateAdminUser(id, password);
        if (!validation.valid) {
            return new Response(JSON.stringify({ error: validation.error }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await ensureTable(context.env);

        // Check if user already exists - PARAMETERIZED QUERY
        const checkResult = await tursoQuery(context.env, 'SELECT id FROM admin_users WHERE id = ?', [id]);
        if (checkResult.results?.[0]?.rows?.length > 0) {
            return new Response(JSON.stringify({ error: 'Admin user already exists' }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create new admin user - PARAMETERIZED QUERY
        await tursoQuery(context.env, 'INSERT INTO admin_users (id, password) VALUES (?, ?)', [id, password]);

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Admin user created',
            id: id
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Create user error:', error);
        return new Response(JSON.stringify({ error: 'Failed to create admin user' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleUpdateUser(context, userId) {
    if (!verifyAdminKey(context.request, context.env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await context.request.json();
        const { password } = body;

        if (!password) {
            return new Response(JSON.stringify({ error: 'Missing password' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (typeof password !== 'string' || password.length < CONSTANTS.MIN_PASSWORD_LENGTH) {
            return new Response(JSON.stringify({ error: 'Invalid password' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if user exists - PARAMETERIZED QUERY
        const checkResult = await tursoQuery(context.env, 'SELECT id FROM admin_users WHERE id = ?', [userId]);
        if (checkResult.results?.[0]?.rows?.length === 0) {
            return new Response(JSON.stringify({ error: 'Admin user not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Update password - PARAMETERIZED QUERY
        await tursoQuery(context.env, 'UPDATE admin_users SET password = ? WHERE id = ?', [password, userId]);

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Password updated',
            id: userId
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Update user error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update admin user' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleDeleteUser(context, userId) {
    if (!verifyAdminKey(context.request, context.env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Check if this is the last admin - PARAMETERIZED QUERY
        const countResult = await tursoQuery(context.env, 'SELECT COUNT(*) as count FROM admin_users');
        const totalAdmins = countResult.results?.[0]?.rows?.[0]?.[0] || 0;
        
        if (totalAdmins <= 1) {
            return new Response(JSON.stringify({ error: 'Cannot delete the last admin user' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Delete user - PARAMETERIZED QUERY
        await tursoQuery(context.env, 'DELETE FROM admin_users WHERE id = ?', [userId]);

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Admin user deleted',
            id: userId
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete admin user' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequest(context) {
    const { method, request } = context;
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/admin/users' && method === 'GET') {
        return handleGetUsers(context);
    }
    if (path === '/api/admin/users' && method === 'POST') {
        return handleCreateUser(context);
    }
    if (path.match(/\/api\/admin\/users\/[^/]+/) && method === 'PUT') {
        const userId = path.split('/').pop();
        return handleUpdateUser(context, userId);
    }
    if (path.match(/\/api\/admin\/users\/[^/]+/) && method === 'DELETE') {
        const userId = path.split('/').pop();
        return handleDeleteUser(context, userId);
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
    });
}