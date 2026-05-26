# Construction Manager - Turso Cloud Storage Edition

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

# Run this SQL:
CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO app_state (id, data, updated_at)
VALUES (1, '{"workers":[],"sortOption":"new","admins":[{"id":"2005040","password":"maruf1234"}]}', datetime('now'));

-- Type .quit to exit
.quit
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
3. Add:
   - `TURSO_URL` = `libsql://construction-manager-your-org.turso.so`
   - `TURSO_AUTH_TOKEN` = `your-auth-token-here` (mark as **Encrypted**)

### Step 6: Redeploy with Functions

After setting environment variables, redeploy to include the API function:

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
│       └── data.js          # GET/POST /api/data - Turso connection
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
├── schema.sql              # SQL to run on Turso manually
├── wrangler.toml           # Cloudflare config
├── package.json            # Dependencies
├── .dev.vars.example       # Local env template
└── .gitignore
```

## Turso Database SQL Reference

See `schema.sql` for the complete SQL including:
- **Simple schema** (recommended): Single `app_state` table with JSON blob
- **Normalized schema** (future use): Separate tables for workers, reports, messages, payments

## Troubleshooting

### "Missing TURSO_URL or TURSO_AUTH_TOKEN" Error
Make sure you've set the environment variables in the Cloudflare Dashboard under Workers & Pages > Your Project > Settings > Environment variables.

### Data Not Saving
Check that your Turso auth token is valid and has write permissions:
```bash
turso db tokens create construction-manager
```

### Can't Connect to Turso
Verify your database URL format: `libsql://your-db-name-your-org.turso.so`
