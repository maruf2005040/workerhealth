/**
 * Cloudflare Pages Function: /api/data
 * Secure data persistence with input validation
 */

const DEFAULT_STATE = {
    workers: [],
    sortOption: 'new'
};

async function tursoQuery(env, sql, args = []) {
    const TURSO_URL = env.TURSO_URL;
    const TURSO_AUTH_TOKEN = env.TURSO_AUTH_TOKEN;

    if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
        console.error('Missing TURSO_URL or TURSO_AUTH_TOKEN in Cloudflare environment');
        throw new Error('Database credentials not configured in Cloudflare');
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
                statements: [{ sql, args }]
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

function validateStateData(data) {
    if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Invalid data format' };
    }
    
    if (data.workers && !Array.isArray(data.workers)) {
        return { valid: false, error: 'Workers must be an array' };
    }
    
    // Validate each worker
    if (data.workers) {
        for (const worker of data.workers) {
            if (!worker || typeof worker !== 'object') {
                return { valid: false, error: 'Invalid worker data' };
            }
            if (!worker.id || typeof worker.id !== 'string') {
                return { valid: false, error: 'Worker ID is required and must be a string' };
            }
            if (worker.id.length > 100) {
                return { valid: false, error: 'Worker ID too long' };
            }
        }
    }
    
    return { valid: true };
}

export async function onRequestGet(context) {
    try {
        await ensureTable(context.env);

        const result = await tursoQuery(context.env, 'SELECT data FROM app_state WHERE id = 1');

        if (result.results?.[0]?.rows?.[0]?.[0]) {
            const data = result.results[0].rows[0][0];
            return new Response(data, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                }
            });
        }

        return new Response(JSON.stringify(DEFAULT_STATE), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('GET /api/data error:', error.message);
        return new Response(JSON.stringify(DEFAULT_STATE), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    try {
        await ensureTable(context.env);

        const body = await context.request.text();

        // Validate JSON
        let data;
        try {
            data = JSON.parse(body);
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON data' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate data structure
        const validation = validateStateData(data);
        if (!validation.valid) {
            return new Response(JSON.stringify({ error: validation.error }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Sanitize and stringify
        const sanitizedData = JSON.stringify(data);

        // PARAMETERIZED QUERY - PREVENTS SQL INJECTION
        await tursoQuery(
            context.env,
            'INSERT OR REPLACE INTO app_state (id, data, updated_at) VALUES (1, ?, datetime(\'now\'))',
            [sanitizedData]
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