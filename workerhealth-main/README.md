# Construction Manager - Ready for Cloudflare Pages

## What's Fixed in v3.0

- **Admin credentials removed from frontend code** - No more hardcoded admin ID/password in JS files
- **Server-side admin authentication** - New `/api/auth` endpoint validates credentials against Turso `admins` table
- **Worker data saving fixed** - `save()` now properly awaits API response and returns success/failure
- **Admins stored in dedicated table** - Separate `admins` table in Turso, not in the JSON blob
- **Security** - Admin credentials never sent to the browser; all validation happens server-side

## Deployment Steps

### 1. Create Turso Database
```bash
turso auth login
turso db create construction-manager
turso db show construction-manager --url
turso db tokens create construction-manager
```

### 2. Initialize Database Schema
```bash
turso db shell construction-manager
```

Paste the contents of `schema.sql` (or copy below):

```sql
CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO admins (id, password, created_at)
VALUES ('2005040', 'maruf1234', datetime('now'));

INSERT OR IGNORE INTO app_state (id, data, updated_at)
VALUES (1, '{"workers":[],"sortOption":"new"}', datetime('now'));
```

Then: `.quit`

### 3. Deploy to Cloudflare Pages

```bash
npm install
npx wrangler login
npx wrangler pages deploy ./public --project-name construction-manager
```

### 4. Set Environment Variables in Cloudflare Dashboard

Go to: **Workers & Pages** > **Your Project** > **Settings** > **Environment variables**

Add these 4 variables:

| Name | Value | Type |
|------|-------|------|
| TURSO_URL | libsql://your-db-name-your-org.turso.so | Standard |
| TURSO_AUTH_TOKEN | your-token-here | Secret |
| MISTRAL_API_KEY | your-api-key | Secret |
| MISTRAL_MODEL_ID | mistral-large-latest | Standard |

### 5. Redeploy

```bash
npx wrangler pages deploy ./public --project-name construction-manager
```

## Admin Login

- **ID**: 2005040
- **Password**: maruf1234

**IMPORTANT**: Change the default password immediately after first login by updating the `admins` table in Turso!

## Project Structure

```
construction-manager/
├── public/              # Frontend files
│   ├── index.html
│   ├── ai.html
│   ├── css/
│   └── js/
├── functions/api/
│   ├── auth.js          # Server-side admin login (NEW)
│   ├── data.js          # CRUD for app state (NO admin creds)
│   └── ai.js            # Mistral AI proxy
├── schema.sql           # Database initialization script
└── package.json
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth` | POST | Validate admin credentials server-side |
| `/api/data` | GET | Retrieve application state (workers, settings) |
| `/api/data` | POST | Save application state |
| `/api/ai` | POST | Proxy chat requests to Mistral AI |

## Security Architecture

- Admin credentials are stored **only** in the Turso `admins` table
- The `/api/auth` endpoint validates login server-side
- Frontend **never** receives admin passwords
- The `/api/data` endpoint strips any `admins` array from app_state JSON before serving
- Session is maintained via localStorage (role only, no credentials)

## Troubleshooting

**Error: Missing environment variables**
Set them in Cloudflare Dashboard under Settings > Environment variables

**Data not saving**
Verify TURSO_URL and TURSO_AUTH_TOKEN in Cloudflare Dashboard

**Admin login not working**
- Check the `admins` table exists in Turso: `turso db shell construction-manager -c "SELECT * FROM admins;"`
- Verify the /api/auth endpoint is deployed

**AI not working**
Check MISTRAL_API_KEY and MISTRAL_MODEL_ID are set

## Support

- Turso: https://docs.turso.tech
- Cloudflare: https://developers.cloudflare.com/pages/
- Mistral: https://docs.mistral.ai
