/**
 * Cloudflare Pages Function: /api/data
 * Reads environment variables directly from Cloudflare
 * No wrangler.toml needed!
 *
 * IMPORTANT: Admin credentials are NO LONGER stored in app_state JSON.
 * They are stored in the separate `admins` table and validated via /api/auth.
 */

// Default state when no data exists (NO admins array here!)
const DEFAULT_STATE = {
  workers: [],
  sortOption: 'new'
};

/**
 * Call Turso HTTP API directly using fetch
 * Uses environment variables from Cloudflare
 */
async function tursoQuery(env, sql, args = []) {
  // Get credentials from Cloudflare environment
  const TURSO_URL = env.TURSO_URL;
  const TURSO_AUTH_TOKEN = env.TURSO_AUTH_TOKEN;

  if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
    console.error('Missing TURSO_URL or TURSO_AUTH_TOKEN in Cloudflare environment');
    throw new Error('Database credentials not configured in Cloudflare');
  }

  // Convert libsql:// to https://
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

    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Turso query error:', e.message);
    throw e;
  }
}

/**
 * Ensure app_state table exists
 */
async function ensureTable(env) {
  try {
    await tursoQuery(env, `
      CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
  } catch (e) {
    console.log('Table creation info:', e.message);
  }
}

/**
 * GET /api/data - Retrieve the full application state
 */
export async function onRequestGet(context) {
  try {
    await ensureTable(context.env);

    const result = await tursoQuery(context.env, 'SELECT data FROM app_state WHERE id = 1');

    // Extract data from Turso response
    if (result.results && result.results[0] && result.results[0].rows && result.results[0].rows.length > 0) {
      const data = result.results[0].rows[0][0];

      // Parse and sanitize: remove admins array if it somehow exists in old data
      try {
        const parsed = JSON.parse(data);
        if (parsed.admins) {
          delete parsed.admins;
        }
        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        });
      } catch {
        // If parsing fails, return as-is
        return new Response(data, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        });
      }
    }

    // Return default state if no data
    return new Response(JSON.stringify(DEFAULT_STATE), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('GET /api/data error:', error.message);
    // Fallback: return default state
    return new Response(JSON.stringify(DEFAULT_STATE), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * POST /api/data - Save the full application state
 */
export async function onRequestPost(context) {
  try {
    await ensureTable(context.env);

    const body = await context.request.text();

    // Validate JSON
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Strip admins array if present (admins are stored in the admins table, not here)
    if (parsed.admins) {
      delete parsed.admins;
    }

    const cleanBody = JSON.stringify(parsed);

    // Save to Turso
    await tursoQuery(context.env,
      'INSERT OR REPLACE INTO app_state (id, data, updated_at) VALUES (1, ?, datetime(\'now\'))',
      [cleanBody]
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('POST /api/data error:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to save data: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
