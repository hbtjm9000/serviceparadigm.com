#!/usr/bin/env bun
/**
 * Migration script: Create articles table
 * Run once to set up the blogging database schema
 *
 * Usage: bun run scripts/migrate-articles.ts
 */

import { Database } from 'bun:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dbPath = path.join(rootDir, 'variants.db');

if (!fs.existsSync(dbPath)) {
  console.error('❌ Database not found at', dbPath);
  console.error('Run the experiment migration first, or create an empty DB file');
  process.exit(1);
}

console.log(`🔧 Migrating database at ${dbPath}...`);

const db = new Database(dbPath, { readwrite: true });
db.run('PRAGMA journal_mode = WAL');

const existingTables = db.query(
  `SELECT name FROM sqlite_master WHERE type='table'`
).all().map((t: any) => t.name);

if (existingTables.includes('articles')) {
  console.log('⚠️  Table articles already exists — skipping');
} else {
  console.log('📦 Creating articles table...');
  db.run(`
    CREATE TABLE articles (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      slug              TEXT NOT NULL UNIQUE,
      title             TEXT NOT NULL,
      excerpt           TEXT,
      body              TEXT,
      category          TEXT,
      image_url         TEXT,
      author_id         TEXT NOT NULL DEFAULT 'hal',
      read_time_minutes INTEGER DEFAULT 5,
      status            TEXT NOT NULL DEFAULT 'draft'
                          CHECK(status IN ('draft', 'published', 'archived')),
      published_at      TEXT,
      created_at        TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run('CREATE INDEX idx_articles_status ON articles(status)');
  db.run('CREATE INDEX idx_articles_slug ON articles(slug)');
  db.run(
    'CREATE INDEX idx_articles_published ON articles(published_at) WHERE status = \'published\''
  );

  console.log('✅ Created articles table with indexes');
}

// Seed demo article if table is empty
const count = db.query('SELECT COUNT(*) AS c FROM articles').get() as any;
if (count.c === 0) {
  console.log('📝 Seeding demo article...');
  db.run(`
    INSERT INTO articles (slug, title, excerpt, body, category, image_url, author_id,
                          read_time_minutes, status, published_at)
    VALUES (
      'welcome-to-paradigm-insights',
      'Welcome to Paradigm Insights',
      'Technical briefs, white papers, and strategic analysis from the Paradigm research team.',
      '## Welcome\n\nThis is your first article. Edit or delete it via the CMS admin panel.\n\n---\n\n### What to expect\n\n- Deep dives into cloud architecture and systems engineering\n- Security protocol analysis and zero-trust implementation guides\n- AI strategy and adoption frameworks for Caribbean enterprises\n- Event recaps and industry analysis',
      'General',
      '/images/cloud-engineering.jpg',
      'hal',
      3,
      'published',
      datetime('now')
    )
  `);
  console.log('✅ Demo article seeded');
} else {
  console.log(`⏭️  ${count.c} articles already exist — skipping seed`);
}

const tables = db.query(
  `SELECT name FROM sqlite_master WHERE type='table'`
).all();
console.log('📋 All tables:', tables.map((t: any) => t.name).join(', '));

db.close();
console.log('🔒 Database connection closed');
console.log('✅ Migration completed successfully');
