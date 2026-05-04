import type { APIRoute } from 'astro';
import { Database } from 'bun:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Read body as text first, then parse
    const text = await request.text();
    console.log('[CMS] Received request body:', text.substring(0, 200));
    
    if (!text || text.trim() === '') {
      return new Response(JSON.stringify({ error: 'Empty request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON',
        message: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const { experimentKey, variants } = data;
    
    // Validate input
    if (!experimentKey || !variants) {
      return new Response(JSON.stringify({ error: 'Invalid input: missing experimentKey or variants' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (typeof variants !== 'object' || variants === null) {
      return new Response(JSON.stringify({ error: 'Variants must be an object' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get paths
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const rootDir = path.resolve(__dirname, '../../../..');
    const dbPath = path.join(rootDir, 'variants.db');
    const jsonPath = path.join(rootDir, 'src/content/hero/variants.json');

    // Open database
    const db = new Database(dbPath, { readwrite: true });
    
    // Begin transaction
    db.run('BEGIN');

    try {
      // Log audit entries for existing variants being modified
      for (const [variantKey, variantData] of Object.entries(variants)) {
        const existing = db.query(`
          SELECT * FROM variants 
          WHERE experiment_key = ? AND variant_key = ?
        `).get(experimentKey, variantKey);

        if (existing) {
          // Update existing
          db.run(`
            UPDATE variants SET
              label = ?,
              headline = ?,
              headline_highlight = ?,
              cta_text = ?,
              subheadline = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE experiment_key = ? AND variant_key = ?
          `, [
            (variantData as any).label,
            (variantData as any).headline,
            (variantData as any).headline_highlight,
            (variantData as any).cta_text,
            (variantData as any).subheadline,
            experimentKey,
            variantKey
          ]);

          // Audit log
          db.run(`
            INSERT INTO audit_log (experiment_key, action, variant_key, old_value, new_value)
            VALUES (?, 'UPDATE', ?, ?, ?)
          `, [
            experimentKey,
            variantKey,
            JSON.stringify(existing),
            JSON.stringify(variantData)
          ]);
        } else {
          // Insert new
          db.run(`
            INSERT INTO variants (experiment_key, variant_key, label, headline, headline_highlight, cta_text, subheadline)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            experimentKey,
            variantKey,
            (variantData as any).label,
            (variantData as any).headline,
            (variantData as any).headline_highlight,
            (variantData as any).cta_text,
            (variantData as any).subheadline
          ]);

          // Audit log
          db.run(`
            INSERT INTO audit_log (experiment_key, action, variant_key, new_value)
            VALUES (?, 'CREATE', ?, ?)
          `, [
            experimentKey,
            variantKey,
            JSON.stringify(variantData)
          ]);
        }
      }

      db.run('COMMIT');
      console.log(`[CMS] Saved ${Object.keys(variants).length} variants to database`);
      
      // Sync to JSON file (inline to avoid import issues)
      const syncVariants = () => {
        const variants = db.query(`
          SELECT variant_key, label, headline, headline_highlight, cta_text, subheadline
          FROM variants
          WHERE experiment_key = 'hero'
          ORDER BY variant_key
        `).all();

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

        fs.writeFileSync(jsonPath, JSON.stringify(variantsObj, null, 2), 'utf-8');
        console.log(`[CMS] Synced ${variants.length} variants to ${jsonPath}`);
      };
      
      syncVariants();
      db.close();
      
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Variants saved successfully',
        count: Object.keys(variants).length,
      }));
    } catch (dbError) {
      db.run('ROLLBACK');
      throw dbError;
    }
  } catch (error) {
    console.error('[CMS] Save error:', error);
    return new Response(JSON.stringify({ 
      error: 'Save failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// GET endpoint to fetch variants (alternative to direct JSON fetch)
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const experimentKey = url.searchParams.get('experiment') || 'hero';
    
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const rootDir = path.resolve(__dirname, '../../../..');
    const dbPath = path.join(rootDir, 'variants.db');

    const db = new Database(dbPath, { readonly: true });
    
    const variants = db.query(`
      SELECT variant_key, label, headline, headline_highlight, cta_text, subheadline
      FROM variants
      WHERE experiment_key = ?
    `).all(experimentKey);
    
    db.close();
    
    // Convert to object format
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
    
    return new Response(JSON.stringify(variantsObj), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[CMS] Fetch error:', error);
    return new Response(JSON.stringify({ 
      error: 'Fetch failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
