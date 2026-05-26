/**
 * Cloudflare Pages Function: /api/data
 * Handles GET and POST requests for Construction Manager app data
 * Uses Turso (libSQL) as cloud database storage
 */
import { createClient } from '@libsql/client/web';

// Default state when no data exists yet
// Note: Credentials are stored in Turso database, not in code
const DEFAULT_STATE = {
  workers: [],
  sortOption: 'new',
  admins: [] // Load from database
};

/**
 * Create a Turso client instance using environment variables
 */
function getTursoClient(env) {
  if (!env.TURSO_URL || !env.TURSO_AUTH_TOKEN) {
    throw new Error('Missing TURSO_URL or TURSO_AUTH_TOKEN environment variables. Please set them in Cloudflare dashboard or wrangler.toml');
  }
  return createClient({
    url: env.TURSO_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });
}

/**
 * Ensure the app_state table exists
 */
async function ensureTable(client) {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

/**
 * GET /api/data - Retrieve the full application state
 */
export async function onRequestGet(context) {
  try {
    const client = getTursoClient(context.env);
    await ensureTable(client);

    const result = await client.execute('SELECT data FROM app_state WHERE id = 1');

    if (result.rows.length > 0 && result.rows[0].data) {
      return new Response(result.rows[0].data, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
    }

    // No data yet — return default state
    return new Response(JSON.stringify(DEFAULT_STATE), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Turso GET error:', error.message);

    // If Turso connection fails, return default state so the app still works
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
    const client = getTursoClient(context.env);
    await ensureTable(client);

    const body = await context.request.text();

    // Validate that it's valid JSON before saving
    try {
      JSON.parse(body);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await client.execute({
      sql: 'INSERT OR REPLACE INTO app_state (id, data, updated_at) VALUES (1, ?, datetime(\'now\'))',
      args: [body]
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Turso POST error:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to save data: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
