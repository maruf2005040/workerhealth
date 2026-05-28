#!/usr/bin/env node

/**
 * Admin Management CLI Tool
 * 
 * Usage:
 *   node scripts/manage-admins.js add <id> <password> [api-key]
 *   node scripts/manage-admins.js list [api-key]
 *   node scripts/manage-admins.js delete <id> [api-key]
 *   node scripts/manage-admins.js update <id> <password> [api-key]
 * 
 * Set environment variables:
 *   ADMIN_API_URL=https://your-domain.pages.dev
 *   ADMIN_API_KEY=your-secure-key
 */

const baseUrl = process.env.ADMIN_API_URL || 'http://localhost:8788';
const adminKey = process.env.ADMIN_API_KEY || '';

const args = process.argv.slice(2);
const command = args[0];
const param1 = args[1];
const param2 = args[2];
const apiKeyArg = args[3];
const apiKey = apiKeyArg || adminKey;

if (!apiKey) {
  console.error('❌ ADMIN_API_KEY not provided');
  console.error('Set ADMIN_API_KEY environment variable or pass as 4th argument');
  process.exit(1);
}

async function makeRequest(method, endpoint, body = null) {
  const url = `${baseUrl}/api/admin${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': apiKey
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Error (${response.status}): ${data.error}`);
      return false;
    }

    return data;
  } catch (err) {
    console.error(`❌ Request failed: ${err.message}`);
    return false;
  }
}

async function listAdmins() {
  console.log('📋 Fetching admin users...');
  const result = await makeRequest('GET', '/users');
  
  if (!result) return;

  if (result.users && result.users.length > 0) {
    console.log('\n✅ Admin Users:');
    result.users.forEach((user, index) => {
      const createdDate = new Date(user.created_at).toLocaleString();
      console.log(`  ${index + 1}. ID: ${user.id} | Created: ${createdDate}`);
    });
  } else {
    console.log('No admin users found');
  }
}

async function createAdmin(id, password) {
  if (!id || !password) {
    console.error('❌ Usage: manage-admins.js add <id> <password>');
    process.exit(1);
  }

  console.log(`📝 Creating admin user: ${id}...`);
  const result = await makeRequest('POST', '/users', { id, password });
  
  if (result) {
    console.log(`✅ Admin user created successfully!`);
    console.log(`   ID: ${result.id}`);
  }
}

async function deleteAdmin(id) {
  if (!id) {
    console.error('❌ Usage: manage-admins.js delete <id>');
    process.exit(1);
  }

  console.log(`🗑️  Deleting admin user: ${id}...`);
  const result = await makeRequest('DELETE', `/users/${id}`);
  
  if (result) {
    console.log(`✅ Admin user deleted successfully!`);
  }
}

async function updatePassword(id, password) {
  if (!id || !password) {
    console.error('❌ Usage: manage-admins.js update <id> <password>');
    process.exit(1);
  }

  console.log(`🔐 Updating password for: ${id}...`);
  const result = await makeRequest('PUT', `/users/${id}`, { password });
  
  if (result) {
    console.log(`✅ Password updated successfully!`);
  }
}

async function main() {
  console.log(`🔗 Using API URL: ${baseUrl}\n`);

  switch (command) {
    case 'list':
      await listAdmins();
      break;
    case 'add':
      await createAdmin(param1, param2);
      break;
    case 'delete':
      await deleteAdmin(param1);
      break;
    case 'update':
      await updatePassword(param1, param2);
      break;
    default:
      console.log(`
📚 Admin Management CLI

Usage:
  node scripts/manage-admins.js add <id> <password>
  node scripts/manage-admins.js list
  node scripts/manage-admins.js delete <id>
  node scripts/manage-admins.js update <id> <password>

Examples:
  node scripts/manage-admins.js add john123 securepass
  node scripts/manage-admins.js list
  node scripts/manage-admins.js update john123 newpassword

Environment Variables:
  ADMIN_API_URL     - API endpoint (default: http://localhost:8788)
  ADMIN_API_KEY     - Secure API key for authentication
      `);
  }
}

main();
