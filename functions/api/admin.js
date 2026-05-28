/**
 * Cloudflare Pages Function: /api/admin
 * Admin management endpoint - create, update, delete admin users
 * Protected endpoint - requires admin authentication via API key
 */

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
      statements: [{
        sql: sql,
        args: args
      }]
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

/**
 * Verify request has valid admin key
 * Use header: X-Admin-Key with value from ADMIN_API_KEY env var
 */
function verifyAdminKey(request, env) {
  const apiKey = request.headers.get('X-Admin-Key');
  const validKey = env.ADMIN_API_KEY;
  
  if (!validKey) {
    console.warn('ADMIN_API_KEY not configured in Cloudflare environment');
    return false;
  }
  
  return apiKey === validKey;
}

/**
 * GET /api/admin/users
 * List all admin users (protected)
 */
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
    if (result.results && result.results[0] && result.results[0].rows) {
      result.results[0].rows.forEach(row => {
        users.push({
          id: row[0],
          created_at: row[1]
        });
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

/**
 * POST /api/admin/users
 * Create new admin user (protected)
 */
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

    if (!id || !password) {
      return new Response(JSON.stringify({ error: 'Missing id or password' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (id.length < 3) {
      return new Response(JSON.stringify({ error: 'Admin ID must be at least 3 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await ensureTable(context.env);

    // Check if user already exists
    const checkResult = await tursoQuery(context.env, 'SELECT id FROM admin_users WHERE id = ?', [id]);
    if (checkResult.results && checkResult.results[0] && checkResult.results[0].rows && checkResult.results[0].rows.length > 0) {
      return new Response(JSON.stringify({ error: 'Admin user already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create new admin user
    await tursoQuery(
      context.env,
      'INSERT INTO admin_users (id, password) VALUES (?, ?)',
      [id, password]
    );

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

/**
 * PUT /api/admin/users/:id
 * Update admin password (protected)
 */
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

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await ensureTable(context.env);

    await tursoQuery(
      context.env,
      'UPDATE admin_users SET password = ? WHERE id = ?',
      [password, userId]
    );

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

/**
 * DELETE /api/admin/users/:id
 * Delete admin user (protected)
 */
async function handleDeleteUser(context, userId) {
  if (!verifyAdminKey(context.request, context.env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    await ensureTable(context.env);

    // Count existing admins
    const countResult = await tursoQuery(context.env, 'SELECT COUNT(*) as count FROM admin_users');
    const adminCount = countResult.results[0].rows[0][0];

    if (adminCount <= 1) {
      return new Response(JSON.stringify({ error: 'Cannot delete the last admin user' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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

/**
 * Router
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const method = context.request.method;
  const pathParts = url.pathname.split('/').filter(Boolean);

  // /api/admin/users
  if (pathParts.length === 3 && pathParts[1] === 'admin' && pathParts[2] === 'users') {
    if (method === 'GET') return handleGetUsers(context);
    if (method === 'POST') return handleCreateUser(context);
  }

  // /api/admin/users/:id
  if (pathParts.length === 4 && pathParts[1] === 'admin' && pathParts[2] === 'users') {
    const userId = pathParts[3];
    if (method === 'PUT') return handleUpdateUser(context, userId);
    if (method === 'DELETE') return handleDeleteUser(context, userId);
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
