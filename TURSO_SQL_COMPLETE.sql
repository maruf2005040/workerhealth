/**
 * ============================================================================
 * Construction Manager - Complete Turso SQL Setup
 * ============================================================================
 * 
 * COPY THIS ENTIRE FILE AND PASTE INTO: turso db shell construction-manager
 * 
 * This file contains:
 * 1. Required tables (app_state) - MUST RUN
 * 2. Optional tables for future enhancement
 * 3. Indexes for performance
 * 4. Verification queries
 * 
 * ============================================================================
 */

-- ============================================================================
-- REQUIRED: Main Application State Table
-- ============================================================================
-- This is the ONLY table required for v2.1 to work
-- Stores entire app state (workers, messages, payments) as JSON in one row
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
);

-- Initialize with default data structure
INSERT OR IGNORE INTO app_state (id, data, updated_at, created_at)
VALUES (
    1,
    '{"workers":[],"sortOption":"new","admins":[{"id":"2005040","password":"maruf1234"}]}',
    datetime('now'),
    datetime('now')
);

-- ============================================================================
-- OPTIONAL: Audit Log Table (for tracking all changes)
-- ============================================================================
-- Use this to track who changed what and when
-- Useful for compliance and debugging
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    user_id TEXT,
    timestamp TEXT DEFAULT (datetime('now')),
    details TEXT,
    ip_address TEXT
);

-- ============================================================================
-- OPTIONAL: Admin Management Table (future password security enhancement)
-- ============================================================================
-- Use this when ready to migrate from JSON-based admin storage
-- Allows proper password hashing instead of plain text
-- ============================================================================

CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_login TEXT,
    is_active INTEGER DEFAULT 1
);

-- ============================================================================
-- OPTIONAL: Workers Table (for data normalization with 10k+ workers)
-- ============================================================================
-- Use this when performance requires normalization from JSON blob
-- Allows faster queries and better indexing
-- ============================================================================

CREATE TABLE IF NOT EXISTS workers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dob TEXT,
    email TEXT,
    phone TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_active TEXT
);

-- ============================================================================
-- OPTIONAL: Reports Table (for data normalization)
-- ============================================================================

CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL,
    report_date TEXT,
    location TEXT,
    supervisor TEXT,
    efficiency_rating REAL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(worker_id) REFERENCES workers(id)
);

-- ============================================================================
-- OPTIONAL: Messages Table (for data normalization)
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    report_id TEXT NOT NULL,
    sender TEXT,
    content TEXT,
    timestamp TEXT DEFAULT (datetime('now')),
    seen_at TEXT,
    FOREIGN KEY(report_id) REFERENCES reports(id)
);

-- ============================================================================
-- OPTIONAL: Payments Table (for data normalization)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL,
    amount REAL,
    currency TEXT DEFAULT 'USD',
    payment_date TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(worker_id) REFERENCES workers(id)
);

-- ============================================================================
-- PERFORMANCE: Indexes (optional but recommended)
-- ============================================================================
-- Add these after reaching 1000+ workers for better performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);
CREATE INDEX IF NOT EXISTS idx_workers_created_at ON workers(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_worker_id ON reports(worker_id);
CREATE INDEX IF NOT EXISTS idx_messages_report_id ON messages(report_id);
CREATE INDEX IF NOT EXISTS idx_payments_worker_id ON payments(worker_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify everything is set up correctly
-- ============================================================================

-- 1. Verify app_state table exists and has data
-- SELECT id, LENGTH(data) as data_size, updated_at FROM app_state;

-- 2. Check default admin can be verified
-- SELECT json_extract(data, '$.admins[0].id') as admin_id FROM app_state WHERE id = 1;

-- 3. Count total workers in system
-- SELECT json_array_length(json_extract(data, '$.workers')) as total_workers FROM app_state WHERE id = 1;

-- 4. See last update timestamp
-- SELECT updated_at FROM app_state WHERE id = 1;

-- 5. View entire state (for debugging)
-- SELECT data FROM app_state WHERE id = 1;

-- ============================================================================
-- EXAMPLE: Manual Data Updates
-- ============================================================================

-- To manually add a new admin (replace app_state with new data):
-- UPDATE app_state SET data = '{"workers":[],"sortOption":"new","admins":[{"id":"2005040","password":"maruf1234"},{"id":"new-admin","password":"password"}]}' WHERE id = 1;

-- To clear all data and start fresh:
-- UPDATE app_state SET data = '{"workers":[],"sortOption":"new","admins":[{"id":"2005040","password":"maruf1234"}]}' WHERE id = 1;

-- To add audit log entry (for security):
-- INSERT INTO audit_log (action, user_id, details) VALUES ('admin_login', '2005040', 'Successful login');

-- ============================================================================
-- BACKUP REMINDER
-- ============================================================================
-- Always backup before making changes:
-- turso db backups create construction-manager
--
-- To restore a backup:
-- turso db restore construction-manager --backup <backup-id>
-- ============================================================================
