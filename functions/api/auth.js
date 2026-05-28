/**
 * Cloudflare Pages Function: /api/auth
 * Authenticates admin users against Turso database
 */

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
      statements: [{
        sql: sql,
        args: args
      }]
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

/**
 * POST /api/auth/login
 * Validates admin credentials against Turso database
 */
export async function onRequestPost(context) {
  // Only allow POST
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    await ensureTable(context.env);

    const body = await context.request.json();
    const { id, password } = body;

    if (!id || !password) {
      return new Response(JSON.stringify({ error: 'Missing id or password' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Query Turso for admin user
    const result = await tursoQuery(
      context.env,
      'SELECT id, password FROM admin_users WHERE id = ?',
      [id]
    );

    // Check if user exists and password matches
    if (result.results && result.results[0] && result.results[0].rows && result.results[0].rows.length > 0) {
      const [storedId, storedPassword] = result.results[0].rows[0];
      
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

    // Invalid credentials
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
