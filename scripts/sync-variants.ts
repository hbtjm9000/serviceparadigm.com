#!/usr/bin/env bun
/**
 * Sync variants from SQLite to JSON file
 * Run this after database updates to keep Astro's file-based reading in sync
 * 
 * Usage: bun run scripts/sync-variants.ts
 */

import { Database } from 'bun:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dbPath = path.join(rootDir, 'variants.db');
const jsonPath = path.join(rootDir, 'src/content/hero/variants.json');

function syncVariants() {
  try {
    if (!fs.existsSync(dbPath)) {
      console.error('❌ Database not found. Run: bun run scripts/init-db.ts');
      process.exit(1);
    }

    const db = new Database(dbPath, { readwrite: true });
    
    // Get all hero variants
    const variants = db.query(`
      SELECT variant_key, label, headline, headline_highlight, cta_text, subheadline
      FROM variants
      WHERE experiment_key = 'hero'
      ORDER BY variant_key
    `).all();

    if (variants.length === 0) {
      console.log('⚠️  No variants found in database');
      db.close();
      return;
    }

    // Convert to the format expected by the CMS
    const variantsObj: Record<string, any> = {};
    for (const v of variants) {
      variantsObj[v.variant_key] = {
        label: v.label,
        headline: v.headline,
        headline_highlight: v.headline_highlight,
        cta_text: v.cta_text,
        subheadline: v.subheadline
      };
    }

    // Write to JSON file
    fs.writeFileSync(jsonPath, JSON.stringify(variantsObj, null, 2), 'utf-8');
    
    console.log(`✅ Synced ${variants.length} variants to ${jsonPath}`);
    db.close();
  } catch (error) {
    console.error('❌ Sync failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// If run directly, sync once
if (import.meta.path === Bun.main) {
  syncVariants();
}

export { syncVariants };
