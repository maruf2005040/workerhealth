# Construction Manager - Ready for Cloudflare Pages

## 🚀 Deployment Steps

### 1. Create Turso Database
```bash
turso auth login
turso db create construction-manager
turso db show construction-manager --url
turso db tokens create construction-manager
```

### 2. Initialize Database Correctly
```bash
turso db shell construction-manager
```

Paste this SQL:
```sql
CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO app_state (id, data, updated_at)
VALUES (1, '{"workers":[],"sortOption":"new","admins":[{"id":"2005040","password":"maruf1234"}]}', datetime('now'));
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
| TURSO_AUTH_TOKEN | your-token-here | Secret ✅ |
| MISTRAL_API_KEY | your-api-key | Secret ✅ |
| MISTRAL_MODEL_ID | mistral-large-latest | Standard |

### 5. Redeploy

```bash
npx wrangler pages deploy ./public --project-name construction-manager
```

## 🔑 Admin Login

- **ID**: 2005040
- **Password**: maruf1234

Change immediately after first login!

## 📁 Project Structure

```
construction-manager/
├── public/              # Frontend files
│   ├── index.html
│   ├── ai.html
│   ├── css/
│   └── js/
├── functions/api/
│   ├── data.js         # Reads env vars directly ✓
│   └── ai.js           # Reads env vars directly ✓
└── package.json
```

## ✨ What Changed

- ✅ Removed wrangler.toml dependency
- ✅ Reads all variables directly from Cloudflare
- ✅ Uses Turso HTTP API
- ✅ No SDK bundling issues
- ✅ Simpler deployment

## 🆘 Troubleshooting

**Error: Missing environment variables**
→ Set them in Cloudflare Dashboard under Settings > Environment variables

**Data not saving**
→ Verify TURSO_URL and TURSO_AUTH_TOKEN in Cloudflare Dashboard

**AI not working**
→ Check MISTRAL_API_KEY and MISTRAL_MODEL_ID are set

## 📞 Support

- Turso: https://docs.turso.tech
- Cloudflare: https://developers.cloudflare.com/pages/
- Mistral: https://docs.mistral.ai
