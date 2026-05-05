/**
 * GA4 Access Diagnostics
 * 
 * Tests what the service account can actually access
 */

import { google } from 'googleapis';
import { join } from 'path';
import { readFileSync } from 'fs';

const CREDENTIALS_PATH = process.env.GA4_CREDENTIALS_PATH || 
  join(import.meta.dir, 'ga4-credentials.json');

async function diagnose() {
  const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf-8'));
  
  console.log('Service Account:');
  console.log(`  Email: ${credentials.client_email}`);
  console.log(`  Project: ${credentials.project_id}`);
  console.log(`  Property ID: ${process.env.GA4_PROPERTY_ID}`);
  console.log();
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });

  // Test 1: List accessible properties
  console.log('Test 1: Listing GA4 properties...');
  try {
    const analyticsadmin = google.analyticsadmin({
      version: 'v1alpha',
      auth,
    });

    const properties = await analyticsadmin.properties.list({});
    console.log('  Accessible properties:');
    if (properties.data.properties?.length) {
      for (const prop of properties.data.properties) {
        console.log(`    - ${prop.name} (ID: ${prop.property})`);
        console.log(`      Display name: ${prop.displayName}`);
      }
    } else {
      console.log('    (none)');
    }
  } catch (error: any) {
    console.log(`  ERROR: ${error.message}`);
  }
  console.log();

  // Test 2: Try to get real-time data (often works with less permissions)
  console.log('Test 2: Checking real-time data...');
  try {
    const analyticsData = google.analyticsdata({
      version: 'v1beta',
      auth,
    });

    const response = await analyticsData.properties.runRealtimeReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      requestBody: {
        metrics: [{ name: 'activeUsers' }],
      },
    });

    console.log('  Real-time active users:', response.data.rows?.[0]?.metricValues?.[0]?.value || '0');
  } catch (error: any) {
    console.log(`  ERROR: ${error.message}`);
  }
  console.log();

  // Test 3: Check if property exists but no data
  console.log('Test 3: Checking for any report data (last 90 days)...');
  try {
    const analyticsData = google.analyticsdata({
      version: 'v1beta',
      auth,
    });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const response = await analyticsData.properties.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [
          {
            startDate: startDate.toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
          },
        ],
        metrics: [{ name: 'sessions' }],
      },
    });

    const sessions = response.data.rows?.[0]?.metricValues?.[0]?.value || '0';
    console.log(`  Sessions (90 days): ${sessions}`);
    
    if (sessions === '0') {
      console.log('  ⚠️  Property accessible but NO DATA found');
      console.log('  This could mean:');
      console.log('    - GA4 tag not installed on site');
      console.log('    - Site has no traffic yet');
      console.log('    - Data processing delay (24-48 hours)');
    }
  } catch (error: any) {
    console.log(`  ERROR: ${error.message}`);
  }
  console.log();

  // Test 4: Check GA4 tag installation
  console.log('Test 4: Checking if GA4 tag is on serviceparadigm.com...');
  try {
    const { exec } = await import('child_process');
    const result = await new Promise<string>((resolve, reject) => {
      exec('curl -s https://serviceparadigm.com | grep -o "G-SLDE3K52MY"', (err, stdout) => {
        if (err) resolve('');
        else resolve(stdout.trim());
      });
    });

    if (result) {
      console.log('  ✅ GA4 tag found on homepage');
    } else {
      console.log('  ⚠️  GA4 tag NOT found on homepage');
      console.log('  Check: src/layouts/BaseLayout.astro has the gtag snippet');
    }
  } catch (error: any) {
    console.log(`  ERROR: ${error.message}`);
  }
}

diagnose();
