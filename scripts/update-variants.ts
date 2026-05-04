#!/usr/bin/env bun
/**
 * Direct file-based variant updater
 * Usage: bun update-variants.ts '{"experimentKey":"hero","variants":{...}}'
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

async function updateVariants(data: string) {
  try {
    const { experimentKey, variants } = JSON.parse(data);
    
    if (!experimentKey || !variants) {
      console.error('Invalid input: missing experimentKey or variants');
      process.exit(1);
    }
    
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const rootDir = path.resolve(__dirname, '..');
    const filePath = path.join(rootDir, 'src/content/hero/variants.json');
    
    await fs.writeFile(
      filePath,
      JSON.stringify(variants, null, 2),
      'utf-8'
    );
    
    console.log(`✅ Saved ${Object.keys(variants).length} variants to ${filePath}`);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Read from command line argument or stdin
const data = process.argv[2];
if (!data) {
  console.error('Usage: bun update-variants.ts \'{"experimentKey":"hero","variants":{...}}\'');
  process.exit(1);
}

updateVariants(data);
