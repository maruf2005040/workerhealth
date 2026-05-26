# Construction Manager - Turso Cloud Storage Edition (v2.1 - Fixed)

## What Changed from the Original

| Feature | Before (v1) | Now (v2) |
|---------|-------------|----------|
| Storage | Local `data.db` JSON file | Turso Cloud Database |
| Backend | Node.js `server.js` | Cloudflare Pages Functions |
| Hosting | Local/VPS server | Cloudflare Pages (Edge) |
| Scalability | Single machine | Global edge network |
| Data persistence | File system (lost on redeploy) | Cloud database (persistent) |

## Quick Deploy to Cloudflare

### Step 1: Create a Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login to Turso
turso auth login

# Create a database
turso db create construction-manager

# Get your database URL
turso db show construction-manager --url

# Create an auth token
turso db tokens create construction-manager
```

### Step 2: Initialize the Database

```bash
# Connect to your database
turso db shell construction-manager

# Copy and paste the entire contents of schema.sql here
# Then type: .quit
```

Or use the quick SQL:

```sql
CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO app_state (id, data, updated_at)
VALUES (1, '{"workers":[],"sortOption":"new","admins":[{"id":"2005040","password":"maruf1234"}]}', datetime('now'));
```

### Step 3: Import Existing Data (Optional)

If you have existing data from the local `data.db` file:

```bash
# Set environment variables
export TURSO_URL="libsql://construction-manager-your-org.turso.so"
export TURSO_AUTH_TOKEN="your-token-here"

# Run the migration script
node scripts/migrate-data.js /path/to/your/data.db
```

Or manually via Turso shell:

```bash
turso db shell construction-manager
UPDATE app_state SET data = '<paste your JSON here>', updated_at = datetime('now') WHERE id = 1;
```

### Step 4: Deploy to Cloudflare Pages

```bash
# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Deploy
npx wrangler pages deploy ./public --project-name construction-manager
```

### Step 5: Set Environment Variables

In the Cloudflare Dashboard:
1. Go to **Workers & Pages** > **construction-manager**
2. Click **Settings** > **Environment variables**
3. Add standard variables:
   - `TURSO_URL` = `libsql://construction-manager-your-org.turso.so`
   - `MISTRAL_MODEL_ID` = `mistral-large-latest`
4. Add secrets (mark as **Encrypted**):
   - `TURSO_AUTH_TOKEN` = `your-auth-token-here`
   - `MISTRAL_API_KEY` = `your-mistral-api-key-here`

### Step 6: Redeploy with Functions

After setting environment variables, redeploy:

```bash
npx wrangler pages deploy ./public --project-name construction-manager
```

## Local Development

```bash
# Install dependencies
npm install

# Create .dev.vars with your Turso credentials
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your actual Turso URL and token

# Run locally
npm run dev
```

## Project Structure

```
construction-manager/
├── functions/               # Cloudflare Pages Functions (API)
│   └── api/
│       ├── data.js          # GET/POST /api/data - Turso connection
│       └── ai.js            # POST /api/ai - Mistral AI integration
├── public/                  # Static frontend files
│   ├── index.html           # Main app entry
│   ├── ai.html              # AI assistant page
│   ├── css/
│   │   ├── style.css        # App styles
│   │   └── logo.png         # App logo
│   └── js/
│       ├── script.js        # Bundled app (primary)
│       ├── app.js           # Modular entry
│       ├── router.js        # Hash-based router
│       ├── components/
│       │   └── UI.js        # UI components
│       ├── context/
│       │   └── AppContext.js # State management
│       ├── pages/
│       │   ├── Home.js
│       │   ├── AdminLogin.js
│       │   ├── AdminDashboard.js
│       │   └── WorkerResults.js
│       └── utils/
│           ├── date.js
│           ├── icons.js
│           └── math.js
├── scripts/
│   └── migrate-data.js     # Data migration helper
├── schema.sql              # Complete SQL schema for Turso
├── wrangler.toml           # Cloudflare Pages config
├── package.json            # Dependencies
├── .dev.vars.example       # Local env template
└── README.md               # This file
```

## Default Admin Credentials

After first deployment, log in with:
- **Admin ID**: `2005040`
- **Password**: `maruf1234`

**⚠️ IMPORTANT**: Change these credentials immediately after first login by updating the database!

## Turso Database SQL Reference

### Complete Schema

See `schema.sql` for the complete SQL. The file includes:
- **Main table** (required): Single `app_state` table with JSON blob
- **Audit log** (optional): Track all changes and user actions
- **Admin/Worker/Reports** (optional): Future data normalization

### Quick Setup

Run the entire `schema.sql` file in your Turso database:

```bash
turso db shell construction-manager
# Then paste all contents of schema.sql and press Enter
# Type .quit to exit
```

### Main Tables:
- **app_state** (required): Single row storing entire app state as JSON
- **audit_log** (optional): Track changes and user actions
- **admins** (optional): Better credential management (future)
- **workers/reports/messages/payments** (optional): Future normalization for > 10k workers

## Data Persistence

✅ **Data Saving Verified**:
- All worker records are saved to Turso database
- Messages, reports, and payments are persisted
- Changes sync automatically via `/api/data` endpoint
- Fallback to default state if database unavailable

### Save Events:
1. Worker login - Creates new worker record
2. Report submission - Saves full report data
3. Messages/chat - Saves worker-admin conversations
4. Payment processing - Saves payment records
5. Worker scoring - Saves fitness metrics
6. Data changes - Auto-saved to Turso

## Admin Features

✅ Fully functional admin system:
- View all worker reports
- Send/receive messages with workers
- AI assistant for data analysis
- Payment management
- Worker performance tracking
- Data export (PDF reports)

## Troubleshooting

### "Missing TURSO_URL or TURSO_AUTH_TOKEN" Error

1. Make sure you've created the Turso database:
   ```bash
   turso db create construction-manager
   turso db tokens create construction-manager
   turso db show construction-manager --url
   ```

2. Set environment variables in Cloudflare Dashboard:
   - Go to **Workers & Pages** > **construction-manager** > **Settings** > **Environment variables**
   - Add `TURSO_URL` and `TURSO_AUTH_TOKEN` (mark token as **Encrypted**)
   - Redeploy: `npx wrangler pages deploy ./public`

### Data Not Saving

1. Check Turso auth token is valid:
   ```bash
   turso db tokens list construction-manager
   ```

2. Verify database was initialized with schema:
   ```bash
   turso db shell construction-manager
   SELECT COUNT(*) FROM app_state;
   .quit
   ```

3. Check Cloudflare Pages logs for errors in dashboard

### Can't Connect to Turso

1. Verify database URL format: `libsql://your-db-name-your-org.turso.so`
2. Check token hasn't expired: `turso db tokens show <token_name>`
3. Ensure database is in same region as Cloudflare deployment

### Admin Login Not Working

1. Verify app_state table has admin record:
   ```bash
   turso db shell construction-manager
   SELECT json_extract(data, '$.admins') FROM app_state WHERE id = 1;
   .quit
   ```

2. If empty, update manually:
   ```bash
   turso db shell construction-manager
   UPDATE app_state SET data = '{"workers":[],"sortOption":"new","admins":[{"id":"2005040","password":"maruf1234"}]}' WHERE id = 1;
   .quit
   ```

## API Endpoints

### GET /api/data
Retrieves full application state from Turso database

**Response**:
```json
{
  "workers": [...],
  "sortOption": "new",
  "admins": [...]
}
```

### POST /api/data
Saves full application state to Turso database

**Request**:
```json
{
  "workers": [...],
  "sortOption": "new",
  "admins": [...]
}
```

### POST /api/ai
Proxies requests to Mistral AI for construction intelligence

**Request**:
```json
{
  "message": "Your construction question here"
}
```

**Response**:
```json
{
  "reply": "AI response here"
}
```

## Performance & Security

### For Production:
1. **Change default admin credentials** immediately
2. **Use HTTPS only** - Cloudflare provides free SSL/TLS
3. **Environment variables** - Use encrypted secrets for tokens
4. **Data encryption** - Turso provides built-in encryption
5. **Backups** - Set up Turso backups: `turso db backups create construction-manager`
6. **Monitoring** - Check Cloudflare analytics regularly

### Scaling (> 10,000 workers):
1. Migrate to normalized schema (separate tables)
2. Set up read replicas
3. Add database indexing (see schema.sql)
4. Implement API rate limiting

## Changes in v2.1

- ✅ Fixed: Removed hardcoded credentials from source code
- ✅ Added: `.dev.vars.example` template for local development
- ✅ Added: Complete `schema.sql` with optional tables
- ✅ Added: Better troubleshooting documentation
- ✅ Verified: Data persistence working correctly
- ✅ Verified: Admin login system functioning
- ✅ Verified: Cloudflare Pages deployment ready

## Deployment Checklist

Before going live:

- [ ] 1. Create Turso database and get credentials
- [ ] 2. Initialize database with schema.sql
- [ ] 3. Create Cloudflare Pages project
- [ ] 4. Set environment variables in dashboard
- [ ] 5. Deploy: `npm run deploy`
- [ ] 6. Test admin login (2005040 / maruf1234)
- [ ] 7. Create test worker and verify data persists
- [ ] 8. Change default admin password
- [ ] 9. Test PDF export
- [ ] 10. Test AI assistant

## Support & Documentation

- Turso Docs: https://docs.turso.tech
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Mistral AI: https://docs.mistral.ai
- SQLite/libSQL: https://sqlite.org/docs.html
