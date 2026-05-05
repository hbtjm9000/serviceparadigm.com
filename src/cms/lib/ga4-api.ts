/**
 * GA4 Reporting API Integration
 * 
 * Fetches conversion events from Google Analytics 4 and syncs with experiment_results table.
 * 
 * Usage:
 *   bun run src/cms/lib/ga4-sync.ts --experiment=hero --days=7
 * 
 * Environment:
 *   GA4_PROPERTY_ID - GA4 Property ID (e.g., "394420")
 *   GA4_CREDENTIALS_PATH - Path to service account JSON (default: ./ga4-credentials.json)
 */

import { google } from 'googleapis';
import { join } from 'path';
import { readFileSync } from 'fs';

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '394420';
const CREDENTIALS_PATH = process.env.GA4_CREDENTIALS_PATH || 
  join(import.meta.dir, 'ga4-credentials.json');

/**
 * Initialize GA4 Analytics Data API client
 */
async function getGA4Client() {
  const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf-8'));
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });

  const analyticsData = google.analyticsdata({
    version: 'v1beta',
    auth,
  });

  return analyticsData;
}

/**
 * Fetch conversion events for a specific experiment variant
 * 
 * @param experimentKey - Experiment key (e.g., 'hero')
 * @param variantKey - Variant key (e.g., 'v1-baseline', 'v2-editorial')
 * @param days - Number of days to look back
 */
async function fetchConversions(
  experimentKey: string,
  variantKey: string,
  days: number = 7
) {
  const analyticsData = await getGA4Client();
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const endDate = new Date();

  // GA4 event name mapping
  const eventName = experimentKey === 'hero' ? 'form_submitted' : 'newsletter_submitted';
  
  try {
    const response = await analyticsData.properties.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [
          {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          },
        ],
        dimensions: [
          { name: 'date' },
          { name: 'customEvent:variant_id' }, // Custom parameter from gtag
        ],
        metrics: [
          { name: 'eventCount' },
          { name: 'totalUsers' },
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: {
              matchType: 'EXACT',
              value: eventName,
            },
          },
        },
      },
    });

    // Filter results for specific variant
    const rows = response.data.rows || [];
    const variantRows = rows.filter(
      row => row.dimensionValues?.[1]?.value === variantKey
    );

    const totalConversions = variantRows.reduce(
      (sum, row) => sum + (parseInt(row.metricValues?.[0]?.value || '0')),
      0
    );

    const totalUsers = variantRows.reduce(
      (sum, row) => sum + (parseInt(row.metricValues?.[1]?.value || '0')),
      0
    );

    return {
      experiment: experimentKey,
      variant: variantKey,
      conversions: totalConversions,
      users: totalUsers,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  } catch (error: any) {
    console.error('Error fetching GA4 data:', error.message);
    throw error;
  }
}

/**
 * Fetch exposure/impression data from GA4
 * 
 * @param experimentKey - Experiment key
 * @param variantKey - Variant key
 * @param days - Number of days to look back
 */
async function fetchExposures(
  experimentKey: string,
  variantKey: string,
  days: number = 7
) {
  const analyticsData = await getGA4Client();
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const endDate = new Date();

  try {
    const response = await analyticsData.properties.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [
          {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          },
        ],
        dimensions: [
          { name: 'date' },
          { name: 'customEvent:variant_id' },
        ],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'sessions' },
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'customEvent:variant_id',
            stringFilter: {
              matchType: 'EXACT',
              value: variantKey,
            },
          },
        },
      },
    });

    const rows = response.data.rows || [];
    
    const totalExposures = rows.reduce(
      (sum, row) => sum + (parseInt(row.metricValues?.[0]?.value || '0')),
      0
    );

    const totalSessions = rows.reduce(
      (sum, row) => sum + (parseInt(row.metricValues?.[1]?.value || '0')),
      0
    );

    return {
      experiment: experimentKey,
      variant: variantKey,
      exposures: totalExposures,
      sessions: totalSessions,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  } catch (error: any) {
    console.error('Error fetching exposures:', error.message);
    throw error;
  }
}

/**
 * Sync GA4 data with experiment_results table
 * 
 * @param experimentKey - Experiment key
 * @param days - Number of days to look back
 */
export async function syncGA4Data(
  experimentKey: string = 'hero',
  days: number = 7
) {
  const variants = ['v1-baseline', 'v2-editorial', 'v3-direct'];
  const results = [];

  console.log(`Syncing GA4 data for experiment "${experimentKey}" (${days} days)...`);

  for (const variant of variants) {
    try {
      const [exposures, conversions] = await Promise.all([
        fetchExposures(experimentKey, variant, days),
        fetchConversions(experimentKey, variant, days),
      ]);

      const result = {
        experiment_key: experimentKey,
        variant_key: variant,
        exposures: exposures.exposures,
        conversions: conversions.conversions,
        start_date: exposures.startDate,
        end_date: exposures.endDate,
        synced_at: new Date().toISOString(),
      };

      results.push(result);
      console.log(`  ${variant}: ${exposures.exposures} exposures, ${conversions.conversions} conversions`);
    } catch (error: any) {
      console.error(`  Error syncing ${variant}:`, error.message);
    }
  }

  return results;
}

/**
 * CLI entry point
 */
if (import.meta.main) {
  const args = process.argv.slice(2);
  const experimentArg = args.find(a => a.startsWith('--experiment='));
  const daysArg = args.find(a => a.startsWith('--days='));

  const experiment = experimentArg?.split('=')[1] || 'hero';
  const days = parseInt(daysArg?.split('=')[1] || '7');

  syncGA4Data(experiment, days)
    .then(results => {
      console.log('\nSync complete:', JSON.stringify(results, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('Sync failed:', error);
      process.exit(1);
    });
}
