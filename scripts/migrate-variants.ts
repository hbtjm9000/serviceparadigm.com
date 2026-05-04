#!/usr/bin/env bun
/**
 * Migrate existing variants from JSON to SQLite
 * Run once to populate the database with existing data
 */

import { Database } from 'bun:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dbPath = path.join(rootDir, 'variants.db');
const jsonPath = path.join(rootDir, 'src/content/hero/variants.json');

async function migrate() {
  try {
    // Check if database exists
    if (!fs.existsSync(dbPath)) {
      console.error('❌ Database not found. Run: bun run scripts/init-db.ts');
      process.exit(1);
    }

    // Check if JSON file exists
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ Variants JSON not found at', jsonPath);
      process.exit(1);
    }

    // Read existing variants
    const variantsObj = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const db = new Database(dbPath, { readwrite: true });

    let migrated = 0;
    
    for (const [variantKey, data] of Object.entries(variantsObj)) {
      const variant = data as any;
      
      // Check if already exists
      const existing = db.query(`
        SELECT 1 FROM variants 
        WHERE experiment_key = 'hero' AND variant_key = ?
      `).get(variantKey);

      if (existing) {
        console.log(`⏭️  Skipping ${variantKey} (already exists)`);
        continue;
      }

      // Insert
      db.run(`
        INSERT INTO variants (experiment_key, variant_key, label, headline, headline_highlight, cta_text, subheadline)
        VALUES ('hero', ?, ?, ?, ?, ?, ?)
      `, [
        variantKey,
        variant.label,
        variant.headline,
        variant.headline_highlight,
        variant.cta_text,
        variant.subheadline
      ]);

      migrated++;
      console.log(`✅ Migrated ${variantKey}`);
    }

    db.close();
    console.log(`\n🎉 Migration complete: ${migrated} variants added to database`);
  } catch (error) {
    console.error('❌ Migration failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

migrate();
