/**
 * Cloudflare Pages Function: /api/auth
 * Server-side admin login validation against Turso database
 * Admin credentials are NEVER sent to the frontend.
 */

/**
 * Call Turso HTTP API directly using fetch
 * Uses environment variables from Cloudflare
 */
async function tursoQuery(env, sql, args = []) {
  const TURSO_URL = env.TURSO_URL;
  const TURSO_AUTH_TOKEN = env.TURSO_AUTH_TOKEN;

  if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
    console.error('Missing TURSO_URL or TURSO_AUTH_TOKEN in Cloudflare environment');
    throw new Error('Database credentials not configured');
  }

  const apiUrl = TURSO_URL.replace('libsql://', 'https://') + '/v2/query';

  try {
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
  } catch (e) {
    console.error('Turso query error:', e.message);
    throw e;
  }
}

/**
 * Ensure admins table exists
 */
async function ensureAdminsTable(env) {
  try {
    await tursoQuery(env, `
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Seed default admin if none exist
    const countResult = await tursoQuery(env, 'SELECT COUNT(*) as cnt FROM admins');
    const count = countResult.results?.[0]?.rows?.[0]?.[0] ?? 0;

    if (count === 0) {
      await tursoQuery(env, `
        INSERT INTO admins (id, password, created_at)
        VALUES ('2005040', 'maruf1234', datetime('now'))
      `);
      console.log('Default admin seeded');
    }
  } catch (e) {
    console.log('Admins table creation/seeding info:', e.message);
  }
}

/**
 * POST /api/auth - Validate admin credentials server-side
 *
 * Request body: { id: "admin_id", password: "admin_password" }
 * Response: { success: true, adminId: "..." } or { success: false, error: "..." }
 */
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { id, password } = body;

    if (!id || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Admin ID and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ensure the admins table exists
    await ensureAdminsTable(context.env);

    // Query the admins table for matching credentials
    const result = await tursoQuery(context.env,
      'SELECT id FROM admins WHERE id = ? AND password = ?',
      [id, password]
    );

    // Parse Turso response
    const rows = result.results?.[0]?.rows ?? [];

    if (rows.length > 0) {
      // Valid credentials
      return new Response(JSON.stringify({ success: true, adminId: id }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
    } else {
      // Invalid credentials
      return new Response(JSON.stringify({ success: false, error: 'Invalid admin ID or password' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
    }

  } catch (error) {
    console.error('POST /api/auth error:', error.message);
    return new Response(JSON.stringify({ success: false, error: 'Authentication service error: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
