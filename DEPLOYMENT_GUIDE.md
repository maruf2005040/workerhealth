# Construction Manager - Complete Deployment Guide v2.1

## 📋 Pre-Deployment Checklist

- [ ] Turso account created (https://turso.tech)
- [ ] Cloudflare account created (https://cloudflare.com)
- [ ] Mistral AI account created (https://mistral.ai)
- [ ] Node.js 16+ installed
- [ ] Git installed
- [ ] Turso CLI installed

---

## 🚀 DEPLOYMENT STEPS (30 minutes)

### PHASE 1: Turso Database Setup (5 minutes)

#### 1.1 Install Turso CLI
```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso --version  # Verify installation
```

#### 1.2 Login to Turso
```bash
turso auth login
# Browser will open - login with your Turso account
```

#### 1.3 Create Database
```bash
turso db create construction-manager
```

Output should show:
```
Database created successfully.
  Name: construction-manager
  ID: <id>
  Organization: <org>
```

#### 1.4 Get Database URL
```bash
turso db show construction-manager --url
```

Save this URL. Example:
```
libsql://construction-manager-your-org.turso.so
```

#### 1.5 Create Auth Token
```bash
turso db tokens create construction-manager
```

Save this token. It looks like:
```
eyJhbGciOiJFZENTQSIsInR5cCI6IkpXVCJ9...
```

#### 1.6 Initialize Database Schema
```bash
turso db shell construction-manager
```

Then copy/paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO app_state (id, data, updated_at, created_at)
VALUES (
    1,
    '{"workers":[],"sortOption":"new","admins":[{"id":"2005040","password":"maruf1234"}]}',
    datetime('now'),
    datetime('now')
);
```

Then type:
```
.quit
```

Verify:
```bash
turso db shell construction-manager
SELECT id, json_array_length(json_extract(data, '$.workers')) as workers FROM app_state;
.quit
```

Should return: `1 | 0` (1 row, 0 workers initially)

---

### PHASE 2: Cloudflare Setup (10 minutes)

#### 2.1 Create Cloudflare Account
- Go to https://cloudflare.com
- Sign up / Login
- Add your domain or use a temporary subdomain

#### 2.2 Install Wrangler CLI
```bash
npm install -g wrangler@latest
wrangler --version  # Verify
```

#### 2.3 Login to Cloudflare
```bash
wrangler login
# Browser will open - authorize Cloudflare CLI
```

#### 2.4 Prepare Project
```bash
# Clone or extract this project
cd construction-manager-fixed
npm install
```

#### 2.5 Create .dev.vars for Local Testing (Optional)
```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars`:
```
TURSO_URL=libsql://construction-manager-your-org.turso.so
TURSO_AUTH_TOKEN=eyJhbGciOi...
MISTRAL_API_KEY=your-mistral-key
MISTRAL_MODEL_ID=mistral-large-latest
```

#### 2.6 Test Locally (Optional)
```bash
npm run dev
# App should run on http://localhost:8787
# Try admin login: 2005040 / maruf1234
```

Press Ctrl+C to stop.

---

### PHASE 3: Set Cloudflare Environment Variables (5 minutes)

#### 3.1 Deploy Initial Version
```bash
npx wrangler pages deploy ./public --project-name construction-manager
```

This creates the Pages project.

#### 3.2 Set Environment Variables

**Option A: Via Cloudflare Dashboard (Easier)**

1. Go to https://dash.cloudflare.com
2. Click **Workers & Pages**
3. Find your project: **construction-manager**
4. Click **Settings**
5. Click **Environment variables**
6. Click **Add variable**

Add these variables:

| Name | Value | Type |
|------|-------|------|
| TURSO_URL | libsql://construction-manager-your-org.turso.so | Standard |
| MISTRAL_MODEL_ID | mistral-large-latest | Standard |
| TURSO_AUTH_TOKEN | eyJhbGciOi... | Secret (encrypted) ✅ |
| MISTRAL_API_KEY | paste-your-key | Secret (encrypted) ✅ |

**Option B: Via CLI**

```bash
npx wrangler pages secret put TURSO_AUTH_TOKEN
# Paste your token, press Enter

npx wrangler pages secret put MISTRAL_API_KEY
# Paste your Mistral API key, press Enter

npx wrangler pages deploy ./public --project-name construction-manager
```

#### 3.3 Deploy with Functions
```bash
npx wrangler pages deploy ./public --project-name construction-manager
```

This redeploys and includes the API functions with your environment variables.

---

### PHASE 4: Verification (5 minutes)

#### 4.1 Check Deployment Status
Go to https://dash.cloudflare.com > Workers & Pages > construction-manager

Look for:
- ✅ Deployments status: "SUCCESS"
- ✅ Latest deployment shows your functions

#### 4.2 Test the App
1. Click the **Domains** tab
2. Click your deployment URL (like `construction-manager-xxx.pages.dev`)
3. You should see the app homepage

#### 4.3 Test Admin Login
1. Click **Admin Login** button
2. Enter:
   - Admin ID: `2005040`
   - Password: `maruf1234`
3. Should see Admin Dashboard with "No Data Yet" message

#### 4.4 Test Data Persistence
1. Create a test worker:
   - Go to Worker Login
   - Fill in details
   - Submit report
2. Log back in and verify worker appears
3. Close browser completely, reopen
4. Log in again - worker data should still be there ✅

#### 4.5 Check Logs
```bash
# View recent deployment logs
npx wrangler pages deployment list --project-name construction-manager
```

---

## 🔒 POST-DEPLOYMENT SECURITY STEPS

### IMMEDIATELY:

#### 1. Change Admin Password
1. Log in as admin: `2005040 / maruf1234`
2. Go to Admin Dashboard
3. In browser console, update admin record:
   ```javascript
   // Change password in state
   AppContext.state.admins[0].password = 'your-new-secure-password';
   AppContext.save();
   ```
4. Then in Turso SQL:
   ```bash
   turso db shell construction-manager
   UPDATE app_state SET data = '{"workers":[],"sortOption":"new","admins":[{"id":"2005040","password":"your-new-secure-password"}]}' WHERE id = 1;
   .quit
   ```

#### 2. Verify Secrets Are Encrypted
1. Go to Cloudflare Dashboard
2. Workers & Pages > construction-manager > Settings > Environment variables
3. Confirm `TURSO_AUTH_TOKEN` and `MISTRAL_API_KEY` show as **Secrets** (not visible in UI)

#### 3. Enable Cloudflare DDoS Protection
1. Add your domain to Cloudflare
2. Enable protection in Security settings

---

## 📊 MONITORING & MAINTENANCE

### Weekly:
- Check Cloudflare Analytics dashboard
- Review error logs: `npx wrangler tail --project-name construction-manager`

### Monthly:
- Backup Turso database: `turso db backups create construction-manager`
- Check database size: `turso db show construction-manager`
- Review admin access logs

### Quarterly:
- Rotate auth tokens: `turso db tokens revoke <old-token>`
- Update dependencies: `npm update`

---

## 🆘 TROUBLESHOOTING

### Deployment Fails: "Unauthorized"
```bash
# Re-authenticate
wrangler logout
wrangler login
npx wrangler pages deploy ./public --project-name construction-manager
```

### "Cannot read app_state" Error
**Solution**: Database schema not initialized
```bash
turso db shell construction-manager
CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO app_state (id, data, updated_at)
VALUES (1, '{"workers":[],"sortOption":"new","admins":[{"id":"2005040","password":"maruf1234"}]}', datetime('now'));
.quit
```

### "Missing TURSO_AUTH_TOKEN" on Cloudflare
**Solution**: Environment variables not set
1. Go to Cloudflare Dashboard
2. Workers & Pages > construction-manager > Settings
3. Add environment variables (see Phase 3.2)
4. Redeploy: `npx wrangler pages deploy ./public`

### Admin Login Not Working
**Solution**: Check database has admin record
```bash
turso db shell construction-manager
SELECT json_extract(data, '$.admins[0].id') as id FROM app_state;
.quit
```

If returns NULL, update:
```bash
turso db shell construction-manager
UPDATE app_state SET data = '{"workers":[],"sortOption":"new","admins":[{"id":"2005040","password":"maruf1234"}]}' WHERE id = 1;
.quit
```

### Data Not Saving to Database
**Solution**: Check token validity
```bash
turso db tokens list construction-manager
# Token should show "valid" status

# If expired, create new token
turso db tokens create construction-manager
```

Then update in Cloudflare Dashboard and redeploy.

### Performance Issues with Many Workers
**Solution**: Migrate to normalized schema
Contact support or see `schema.sql` for optional normalized tables.

---

## 📈 SCALING TO PRODUCTION

### Current Capacity:
- ✅ Up to 5,000-10,000 workers
- ✅ Unlimited messages/reports
- ✅ Global edge network via Cloudflare

### When Scaling > 10,000 workers:

1. **Migrate to Normalized Schema**
   ```bash
   # Create separate tables (see schema.sql)
   # Migrate data from JSON blob
   ```

2. **Add Database Indexing**
   ```bash
   # Add indexes for performance (in schema.sql)
   ```

3. **Set Up Read Replicas**
   ```bash
   turso db replicate construction-manager us-east-1
   ```

4. **Implement API Rate Limiting**
   - Add to Cloudflare Pages function
   - Or use Cloudflare Rate Limiting Rules

---

## 📞 SUPPORT

- **Turso Issues**: https://discord.gg/turso
- **Cloudflare Issues**: https://community.cloudflare.com
- **Mistral AI Issues**: https://discord.gg/mistralai
- **SQLite/libSQL**: https://discord.gg/libsql

---

## ✅ FINAL CHECKLIST

- [ ] Turso database created and initialized
- [ ] Cloudflare Pages project created
- [ ] Environment variables set (TURSO_URL, TURSO_AUTH_TOKEN, MISTRAL_API_KEY)
- [ ] Deployed to Cloudflare: `npx wrangler pages deploy`
- [ ] Admin login works (2005040 / maruf1234)
- [ ] Created test worker and verified data persists
- [ ] Changed admin password to secure value
- [ ] Verified TURSO_AUTH_TOKEN is marked as Secret (encrypted)
- [ ] Tested AI chat functionality
- [ ] App is live and accessible

**🎉 Congratulations! Your Construction Manager is now deployed!**

---

Generated for v2.1 - Fixed & Ready for Production
