#!/usr/bin/env bun
/**
 * Standalone API server for CMS operations
 * Runs alongside Astro dev server to handle POST requests with body parsing
 * 
 * Usage: bun run scripts/api-server.ts
 * Port: 4322 (one above Astro's 4321)
 */

import { Database } from 'bun:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 4322;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dbPath = path.join(rootDir, 'variants.db');
const jsonPath = path.join(rootDir, 'src/content/hero/variants.json');
const statsPath = path.join(rootDir, 'src/cms/lib/stats.ts');

// Initialize database if not exists
if (!fs.existsSync(dbPath)) {
  console.log('📦 Database not found, initializing...');
  const initDb = new Database(dbPath);
  initDb.run('PRAGMA journal_mode = WAL');
  initDb.run(`
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
  initDb.run(`CREATE INDEX IF NOT EXISTS idx_experiment ON variants(experiment_key)`);
  initDb.run(`
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
  initDb.close();
  console.log('✅ Database initialized');
}

function syncVariants(db: Database) {
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
  console.log(`📄 Synced ${variants.length} variants to JSON`);
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // GET /variants?experiment=hero
    if (url.pathname === '/variants' && req.method === 'GET') {
      const experimentKey = url.searchParams.get('experiment') || 'hero';
      
      try {
        const db = new Database(dbPath, { readonly: true });
        const variants = db.query(`
          SELECT variant_key, label, headline, headline_highlight, cta_text, subheadline
          FROM variants
          WHERE experiment_key = ?
        `).all(experimentKey);
        db.close();

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

        return new Response(JSON.stringify(variantsObj), { headers: corsHeaders });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Fetch failed', message: String(error) }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // POST /variants
    if (url.pathname === '/variants' && req.method === 'POST') {
      try {
        const text = await req.text();
        console.log('[API] Received:', text.substring(0, 200));

        if (!text || text.trim() === '') {
          return new Response(JSON.stringify({ error: 'Empty request body' }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        const { experimentKey, variants } = JSON.parse(text);

        if (!experimentKey || !variants) {
          return new Response(JSON.stringify({ error: 'Invalid input' }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        const db = new Database(dbPath, { readwrite: true });
        db.run('BEGIN');

        try {
          for (const [variantKey, variantData] of Object.entries(variants)) {
            const v = variantData as any;
            const existing = db.query(`
              SELECT * FROM variants 
              WHERE experiment_key = ? AND variant_key = ?
            `).get(experimentKey, variantKey);

            if (existing) {
              db.run(`
                UPDATE variants SET
                  label = ?, headline = ?, headline_highlight = ?,
                  cta_text = ?, subheadline = ?, updated_at = CURRENT_TIMESTAMP
                WHERE experiment_key = ? AND variant_key = ?
              `, [v.label, v.headline, v.headline_highlight, v.cta_text, v.subheadline, experimentKey, variantKey]);

              db.run(`
                INSERT INTO audit_log (experiment_key, action, variant_key, old_value, new_value)
                VALUES (?, 'UPDATE', ?, ?, ?)
              `, [experimentKey, variantKey, JSON.stringify(existing), JSON.stringify(variantData)]);
            } else {
              db.run(`
                INSERT INTO variants (experiment_key, variant_key, label, headline, headline_highlight, cta_text, subheadline)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `, [experimentKey, variantKey, v.label, v.headline, v.headline_highlight, v.cta_text, v.subheadline]);

              db.run(`
                INSERT INTO audit_log (experiment_key, action, variant_key, new_value)
                VALUES (?, 'CREATE', ?, ?)
              `, [experimentKey, variantKey, JSON.stringify(variantData)]);
            }
          }

          db.run('COMMIT');
          syncVariants(db);
          db.close();

          return new Response(JSON.stringify({
            success: true,
            message: 'Variants saved successfully',
            count: Object.keys(variants).length,
          }), { headers: corsHeaders });
        } catch (dbError) {
          db.run('ROLLBACK');
          throw dbError;
        }
      } catch (error) {
        console.error('[API] Error:', error);
        return new Response(JSON.stringify({ error: 'Save failed', message: String(error) }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // DELETE /variants/:key
    if (url.pathname.startsWith('/variants/') && req.method === 'DELETE') {
      const variantKey = decodeURIComponent(url.pathname.split('/').pop() || '');
      const experimentKey = url.searchParams.get('experiment') || 'hero';

      try {
        const db = new Database(dbPath, { readwrite: true });
        
        const existing = db.query(`
          SELECT * FROM variants 
          WHERE experiment_key = ? AND variant_key = ?
        `).get(experimentKey, variantKey);

        if (!existing) {
          db.close();
          return new Response(JSON.stringify({ error: 'Variant not found' }), {
            status: 404,
            headers: corsHeaders,
          });
        }

        db.run(`DELETE FROM variants WHERE experiment_key = ? AND variant_key = ?`, [experimentKey, variantKey]);
        
        db.run(`
          INSERT INTO audit_log (experiment_key, action, variant_key, old_value)
          VALUES (?, 'DELETE', ?, ?)
        `, [experimentKey, variantKey, JSON.stringify(existing)]);

        syncVariants(db);
        db.close();

        return new Response(JSON.stringify({ success: true, message: 'Variant deleted' }), {
          headers: corsHeaders,
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Delete failed', message: String(error) }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // GET /results?experiment=hero&days=30
    if (url.pathname === '/results' && req.method === 'GET') {
      const experimentKey = url.searchParams.get('experiment') || 'hero';
      const days = parseInt(url.searchParams.get('days') || '30', 10);
      
      try {
        const db = new Database(dbPath, { readonly: true });
        
        // Get aggregated results for the date range
        const results = db.query(`
          SELECT 
            variant_key,
            SUM(exposures) as total_exposures,
            SUM(conversions) as total_conversions,
            COUNT(DISTINCT date) as days_tracked
          FROM experiment_results
          WHERE experiment_key = ? AND date >= date('now', '-' || ? || ' days')
          GROUP BY variant_key
          ORDER BY variant_key
        `).all(experimentKey, days);
        
        db.close();
        
        return new Response(JSON.stringify({
          experiment: experimentKey,
          days: days,
          results: results.map(r => ({
            variantKey: r.variant_key,
            exposures: r.total_exposures || 0,
            conversions: r.total_conversions || 0,
            daysTracked: r.days_tracked || 0
          }))
        }), { headers: corsHeaders });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Fetch failed', message: String(error) }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // POST /results - Record exposures/conversions
    if (url.pathname === '/results' && req.method === 'POST') {
      try {
        const text = await req.text();
        const { experimentKey, variantKey, date, exposures, conversions, eventType, eventData } = JSON.parse(text);

        if (!experimentKey || !variantKey) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        const db = new Database(dbPath, { readwrite: true });
        
        // If eventType is provided, log individual event
        if (eventType) {
          db.run(`
            INSERT INTO experiment_events (experiment_key, variant_key, event_type, event_data)
            VALUES (?, ?, ?, ?)
          `, [experimentKey, variantKey, eventType, eventData ? JSON.stringify(eventData) : null]);
        }

        // Upsert daily aggregates
        const recordDate = date || new Date().toISOString().split('T')[0];
        
        // Check if record exists
        const existing = db.query(`
          SELECT * FROM experiment_results
          WHERE experiment_key = ? AND variant_key = ? AND date = ?
        `).get(experimentKey, variantKey, recordDate);

        if (existing) {
          db.run(`
            UPDATE experiment_results SET
              exposures = exposures + COALESCE(?, 0),
              conversions = conversions + COALESCE(?, 0),
              updated_at = CURRENT_TIMESTAMP
            WHERE experiment_key = ? AND variant_key = ? AND date = ?
          `, [exposures || 0, conversions || 0, experimentKey, variantKey, recordDate]);
        } else {
          db.run(`
            INSERT INTO experiment_results (experiment_key, variant_key, date, exposures, conversions)
            VALUES (?, ?, ?, COALESCE(?, 0), COALESCE(?, 0))
          `, [experimentKey, variantKey, recordDate, exposures || 0, conversions || 0]);
        }

        db.close();

        return new Response(JSON.stringify({
          success: true,
          message: 'Results recorded successfully'
        }), { headers: corsHeaders });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Save failed', message: String(error) }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // GET /analysis?experiment=hero&days=30
    if (url.pathname === '/analysis' && req.method === 'GET') {
      const experimentKey = url.searchParams.get('experiment') || 'hero';
      const days = parseInt(url.searchParams.get('days') || '30', 10);
      
      try {
        const db = new Database(dbPath, { readonly: true });
        
        // Get aggregated results
        const results = db.query(`
          SELECT 
            variant_key,
            SUM(exposures) as total_exposures,
            SUM(conversions) as total_conversions
          FROM experiment_results
          WHERE experiment_key = ? AND date >= date('now', '-' || ? || ' days')
          GROUP BY variant_key
          ORDER BY variant_key
        `).all(experimentKey, days);
        
        db.close();

        // Calculate statistics using the same logic as stats.ts
        const controlKey = 'v1-baseline';
        const control = results.find(r => r.variant_key === controlKey);
        
        if (!control) {
          return new Response(JSON.stringify({ error: 'Control variant not found' }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        const analysis = results.map(variant => {
          const exposures = variant.total_exposures || 0;
          const conversions = variant.total_conversions || 0;
          const rate = exposures > 0 ? conversions / exposures : 0;
          
          // Wilson score interval
          const z = 1.96;
          const denominator = 1 + z * z / exposures;
          const centre = (rate + z * z / (2 * exposures)) / denominator;
          const margin = (z / denominator) * Math.sqrt((rate * (1 - rate)) / exposures + z * z / (4 * exposures * exposures));
          const ci = [Math.max(0, centre - margin), Math.min(1, centre + margin)];
          
          let pValue: number | undefined;
          let isSignificant: boolean | undefined;
          let relativeImprovement: number | undefined;
          
          if (variant.variant_key !== controlKey) {
            // Two-proportion z-test
            const p1 = control.total_conversions / control.total_exposures;
            const p2 = rate;
            const pPool = (control.total_conversions + conversions) / (control.total_exposures + exposures);
            
            if (pPool > 0 && pPool < 1) {
              const se = Math.sqrt(pPool * (1 - pPool) * (1 / control.total_exposures + 1 / exposures));
              if (se > 0) {
                const zStat = (p2 - p1) / se;
                // Two-tailed p-value approximation
                pValue = 2 * (1 - normalCDF(Math.abs(zStat)));
                isSignificant = pValue < 0.05;
              }
            }
            
            const controlRate = control.total_conversions / control.total_exposures;
            relativeImprovement = controlRate > 0 ? ((rate - controlRate) / controlRate) * 100 : 0;
          }
          
          return {
            variantKey: variant.variant_key,
            exposures,
            conversions,
            conversionRate: rate,
            confidenceInterval: ci,
            pValue,
            isSignificant,
            relativeImprovement: relativeImprovement ? Math.round(relativeImprovement * 100) / 100 : undefined
          };
        });

        // Find winner
        const baseline = analysis.find(r => !r.pValue);
        const significantVariants = analysis.filter(
          r => r.pValue !== undefined && r.pValue < 0.05 && r.conversionRate > (baseline?.conversionRate || 0)
        );
        
        let winner: string | null = null;
        let winnerConfidence = 0;
        
        if (significantVariants.length > 0) {
          const best = significantVariants.reduce((a, b) => (a.pValue! < b.pValue!) ? a : b);
          winner = best.variantKey;
          winnerConfidence = Math.round((1 - best.pValue!) * 100) / 100;
        }

        return new Response(JSON.stringify({
          experiment: experimentKey,
          days: days,
          analysis,
          winner,
          winnerConfidence,
          controlKey
        }), { headers: corsHeaders });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Analysis failed', message: String(error) }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // POST /promote - Promote a variant to be the new default
    if (url.pathname === '/promote' && req.method === 'POST') {
      try {
        const text = await req.text();
        const { experimentKey, winnerKey } = JSON.parse(text);

        if (!experimentKey || !winnerKey) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        const db = new Database(dbPath, { readwrite: true });
        
        // Verify the variant exists
        const variant = db.query(`
          SELECT * FROM variants
          WHERE experiment_key = ? AND variant_key = ?
        `).get(experimentKey, winnerKey);

        if (!variant) {
          db.close();
          return new Response(JSON.stringify({ error: 'Variant not found' }), {
            status: 404,
            headers: corsHeaders,
          });
        }

        // Log the promotion in audit log
        db.run(`
          INSERT INTO audit_log (experiment_key, action, variant_key, new_value)
          VALUES (?, 'PROMOTE', ?, ?)
        `, [experimentKey, winnerKey, JSON.stringify({ promoted_to_default: true })]);

        db.close();

        // Sync to JSON (already done by syncVariants, but we need to reload)
        // The winner is now the de facto default - the frontend will use this variant key as control

        return new Response(JSON.stringify({
          success: true,
          message: `Variant ${winnerKey} promoted to default`,
          winnerKey
        }), { headers: corsHeaders });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Promotion failed', message: String(error) }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // Helper function for normal CDF (copied from stats.ts)
    function normalCDF(x: number): number {
      const t = 1 / (1 + 0.2316419 * Math.abs(x));
      const d = 0.3989423 * Math.exp(-x * x / 2);
      const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
      return x > 0 ? 1 - prob : prob;
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: corsHeaders,
    });
  },
});

console.log(`🚀 CMS API server running on http://localhost:${PORT}`);
console.log(`   GET  /variants?experiment=hero     - Fetch variants`);
console.log(`   POST /variants                     - Save variants`);
console.log(`   DELETE /variants/:key              - Delete variant`);
console.log(`   GET  /results?experiment=hero      - Fetch experiment results`);
console.log(`   POST /results                      - Record exposures/conversions`);
console.log(`   GET  /analysis?experiment=hero     - Get statistical analysis`);
console.log(`   POST /promote                      - Promote winning variant`);
