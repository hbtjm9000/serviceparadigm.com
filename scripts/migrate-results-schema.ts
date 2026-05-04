#!/usr/bin/env bun
/**
 * Migration script: Add experiment_results and experiment_events tables to existing database
 * Run once to upgrade the database schema
 * 
 * Usage: bun run scripts/migrate-results-schema.ts
 */

import { Database } from 'bun:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'variants.db');

if (!fs.existsSync(dbPath)) {
  console.error('❌ Database not found at', dbPath);
  console.error('Run `bun run scripts/init-db.ts` first to initialize the database');
  process.exit(1);
}

console.log(`🔧 Migrating database at ${dbPath}...`);

const db = new Database(dbPath, { readwrite: true });

// Enable WAL mode if not already
db.run('PRAGMA journal_mode = WAL');

// Check if tables already exist
const existingTables = db.query(`SELECT name FROM sqlite_master WHERE type='table'`).all().map(t => t.name);

if (existingTables.includes('experiment_results')) {
  console.log('⚠️  Table experiment_results already exists - skipping');
} else {
  console.log('📦 Creating experiment_results table...');
  db.run(`
    CREATE TABLE experiment_results (
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
  
  db.run(`
    CREATE INDEX idx_results_experiment_date ON experiment_results(experiment_key, date)
  `);
  console.log('✅ Created experiment_results table');
}

if (existingTables.includes('experiment_events')) {
  console.log('⚠️  Table experiment_events already exists - skipping');
} else {
  console.log('📦 Creating experiment_events table...');
  db.run(`
    CREATE TABLE experiment_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      experiment_key TEXT NOT NULL,
      variant_key TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_data TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE INDEX idx_events_experiment ON experiment_events(experiment_key, variant_key, event_type)
  `);
  console.log('✅ Created experiment_events table');
}

// Verify tables exist
const tables = db.query(`SELECT name FROM sqlite_master WHERE type='table'`).all();
console.log('📋 All tables:', tables.map(t => t.name).join(', '));

db.close();
console.log('🔒 Database connection closed');
console.log('✅ Migration completed successfully');
