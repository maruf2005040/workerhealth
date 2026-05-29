#!/usr/bin/env node
/**
 * CLI tool for managing admin users
 * Usage:
 *   node manage-admins.js list
 *   node manage-admins.js add <id> <password>
 *   node manage-admins.js update <id> <password>
 *   node manage-admins.js delete <id>
 */

const API_BASE = process.env.ADMIN_API_URL || 'http://localhost:8787';
const API_KEY = process.env.ADMIN_API_KEY;

async function makeRequest(method, endpoint, body = null) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        'X-Admin-Key': API_KEY
    };

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

async function listAdmins() {
    const result = await makeRequest('GET', '/api/admin/users');
    console.log('📋 Admin Users:');
    if (result.users && result.users.length > 0) {
        result.users.forEach(user => {
            console.log(`  - ${user.id} (Created: ${user.created_at || 'N/A'})`);
        });
    } else {
        console.log('  No admin users found');
    }
}

async function addAdmin(id, password) {
    if (!id || !password) {
        console.error('❌ Usage: node manage-admins.js add <id> <password>');
        process.exit(1);
    }
    const result = await makeRequest('POST', '/api/admin/users', { id, password });
    console.log('✅ Admin created:', result.message);
    console.log('   ID:', result.id);
}

async function updateAdmin(id, password) {
    if (!id || !password) {
        console.error('❌ Usage: node manage-admins.js update <id> <password>');
        process.exit(1);
    }
    const result = await makeRequest('PUT', `/api/admin/users/${id}`, { password });
    console.log('✅ Admin updated:', result.message);
}

async function deleteAdmin(id) {
    if (!id) {
        console.error('❌ Usage: node manage-admins.js delete <id>');
        process.exit(1);
    }
    if (!confirm(`Are you sure you want to delete admin "${id}"?`)) {
        console.log('❌ Deletion cancelled');
        process.exit(0);
    }
    const result = await makeRequest('DELETE', `/api/admin/users/${id}`);
    console.log('✅ Admin deleted:', result.message);
}

// Main
const args = process.argv.slice(2);
const command = args[0];

if (!command) {
    console.log('❌ Usage: node manage-admins.js <command> [args]');
    console.log('');
    console.log('Commands:');
    console.log('  list              List all admin users');
    console.log('  add <id> <pass>   Create new admin user');
    console.log('  update <id> <pass> Update admin password');
    console.log('  delete <id>       Delete admin user');
    console.log('');
    console.log('Environment Variables:');
    console.log('  ADMIN_API_URL     Base URL (default: http://localhost:8787)');
    console.log('  ADMIN_API_KEY     Admin API key');
    process.exit(1);
}

switch (command) {
    case 'list':
        listAdmins();
        break;
    case 'add':
        addAdmin(args[1], args[2]);
        break;
    case 'update':
        updateAdmin(args[1], args[2]);
        break;
    case 'delete':
        deleteAdmin(args[1]);
        break;
    default:
        console.error('❌ Unknown command:', command);
        process.exit(1);
}