#!/usr/bin/env bun
/**
 * Initialize SQLite database for CMS variant storage
 * Creates tables and sets up the variants.db file
 */

import { Database } from 'bun:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'variants.db');

console.log(`📦 Initializing database at ${dbPath}...`);

const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.run('PRAGMA journal_mode = WAL');

// Create variants table
db.run(`
  CREATE TABLE IF NOT EXISTS variants (
    experiment_key TEXT NOT NULL,
    variant_key TEXT NOT NULL,
    label TEXT NOT NULL,
    headline TEXT NOT NULL,
    headline_highlight TEXT,
    cta_text TEXT NOT NULL,
    subheadline TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (experiment_key, variant_key)
  )
`);

// Create index for faster lookups
db.run(`
  CREATE INDEX IF NOT EXISTS idx_experiment ON variants(experiment_key)
`);

// Create audit log table
db.run(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_key TEXT NOT NULL,
    action TEXT NOT NULL,
    variant_key TEXT,
    old_value TEXT,
    new_value TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create experiment_results table for tracking variant performance
db.run(`
  CREATE TABLE IF NOT EXISTS experiment_results (
    experiment_key TEXT NOT NULL,
    variant_key TEXT NOT NULL,
    date DATE NOT NULL,
    exposures INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (experiment_key, variant_key, date)
  )
`);

// Create index for faster date-range queries
db.run(`
  CREATE INDEX IF NOT EXISTS idx_results_experiment_date ON experiment_results(experiment_key, date)
`);

// Create experiment_events table for individual event tracking (optional detailed logging)
db.run(`
  CREATE TABLE IF NOT EXISTS experiment_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_key TEXT NOT NULL,
    variant_key TEXT NOT NULL,
    event_type TEXT NOT NULL,  -- 'exposure' or 'conversion'
    event_data TEXT,           -- JSON blob for additional context (user agent, referrer, etc.)
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create index for faster event queries
db.run(`
  CREATE INDEX IF NOT EXISTS idx_events_experiment ON experiment_events(experiment_key, variant_key, event_type)
`);

console.log('✅ Database initialized successfully');

// Verify tables exist
const tables = db.query("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('📋 Tables:', tables.map(t => t.name).join(', '));

db.close();
console.log('🔒 Database connection closed');
