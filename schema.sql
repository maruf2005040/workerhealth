/**
 * Construction Manager - Turso Database Schema
 * 
 * Run this SQL in your Turso database using:
 * turso db shell construction-manager
 * 
 * Then paste and execute the SQL below
 */

-- ========================================
-- MAIN APPLICATION STATE TABLE
-- ========================================
-- This table stores the entire app state as JSON
-- Using a single-row design for simplicity
-- For production with > 10k workers, consider normalization
-- ========================================

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

-- ========================================
-- AUDIT LOG TABLE (Optional - for tracking)
-- ========================================
-- Uncomment if you want to track data changes
-- ========================================

CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    user_id TEXT,
    timestamp TEXT DEFAULT (datetime('now')),
    details TEXT,
    ip_address TEXT
);

-- ========================================
-- ADMINS TABLE (Optional - future enhancement)
-- ========================================
-- For more secure password management
-- Uncomment when ready to migrate from inline JSON
-- ========================================

CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_login TEXT,
    is_active INTEGER DEFAULT 1
);

-- ========================================
-- WORKERS TABLE (Optional - future normalization)
-- ========================================
-- For better performance with large datasets
-- Uncomment when you want to normalize data
-- ========================================

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

-- ========================================
-- REPORTS TABLE (Optional - future normalization)
-- ========================================

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

-- ========================================
-- MESSAGES TABLE (Optional - future normalization)
-- ========================================

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    report_id TEXT NOT NULL,
    sender TEXT,
    content TEXT,
    timestamp TEXT DEFAULT (datetime('now')),
    seen_at TEXT,
    FOREIGN KEY(report_id) REFERENCES reports(id)
);

-- ========================================
-- PAYMENTS TABLE (Optional - future normalization)
-- ========================================

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

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);
CREATE INDEX IF NOT EXISTS idx_workers_created_at ON workers(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_worker_id ON reports(worker_id);
CREATE INDEX IF NOT EXISTS idx_messages_report_id ON messages(report_id);
CREATE INDEX IF NOT EXISTS idx_payments_worker_id ON payments(worker_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these to verify setup is correct:

-- Check app_state table exists and has data:
-- SELECT id, LENGTH(data) as data_size, updated_at FROM app_state;

-- Check default admin can be verified:
-- SELECT json_extract(data, '$.admins[0].id') as admin_id FROM app_state WHERE id = 1;

-- Count total workers in system:
-- SELECT json_array_length(json_extract(data, '$.workers')) as total_workers FROM app_state WHERE id = 1;
