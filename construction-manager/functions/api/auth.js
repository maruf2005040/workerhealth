/**
 * Cloudflare Pages Function: /api/auth/login
 * Secure admin authentication with input validation
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
        throw new Error('Database credentials not configured in Cloudflare');
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
        throw new Error(`Turso API error: ${response.status} - ${error}`);
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
        console.log('Table creation info:', e.message);
    }
}

function validateCredentials(id, password) {
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
    
    // Check for potentially dangerous characters
    if (/[\s'"\\;]/.test(id) || /[\s'"\\;]/.test(password)) {
        return { valid: false, error: 'Invalid characters in credentials' };
    }
    
    return { valid: true };
}

export async function onRequestPost(context) {
    if (context.request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json', 'Allow': 'POST' }
        });
    }

    try {
        await ensureTable(context.env);

        const body = await context.request.json();
        const { id, password } = body;

        // Validate input
        const validation = validateCredentials(id, password);
        if (!validation.valid) {
            return new Response(JSON.stringify({ error: validation.error }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Parameterized query - PREVENTS SQL INJECTION
        const result = await tursoQuery(
            context.env,
            'SELECT id, password FROM admin_users WHERE id = ?',
            [id]
        );

        if (result.results?.[0]?.rows?.[0]) {
            const [storedId, storedPassword] = result.results[0].rows[0];
            
            // SECURITY NOTE: In production, use bcrypt.compare()
            // This is a temporary solution - passwords should be hashed
            if (storedPassword === password) {
                return new Response(JSON.stringify({ 
                    success: true, 
                    message: 'Login successful',
                    admin: { id: storedId, role: 'admin' }
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Rate limiting would go here in production
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Auth error:', error.message);
        return new Response(JSON.stringify({ error: 'Authentication failed: ' + error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}