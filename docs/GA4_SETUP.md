# GA4 Reporting API Integration Setup

## Overview

This integration syncs conversion data from Google Analytics 4 (GA4) to the experiment_results table for automated A/B test tracking.

## Credentials

- **Service Account:** `serviceparadigm-ga4@extreme-tribute-394420.iam.gserviceaccount.com`
- **Project:** `extreme-tribute-394420`
- **Credentials File:** `src/cms/lib/ga4-credentials.json` (gitignored)

## Required Setup in Google Analytics

### Step 1: Verify Property ID

The Property ID is: **535898995**

This corresponds to the GA4 property for serviceparadigm.com with measurement ID `G-SLDE3K52MY`.

### Step 2: Grant Service Account Access

1. In GA4 Admin, go to **Property Access Management**
2. Click **+ Add** (top right) → **Add users**
3. Enter: `serviceparadigm-ga4@extreme-tribute-394420.iam.gserviceaccount.com`
4. Select role: **Viewer** (read-only access is sufficient)
5. Click **Add**

### Step 3: Update `.env`

The `.env` file has been updated with the Property ID:

```bash
GA4_PROPERTY_ID=535898995
GA4_CREDENTIALS_PATH=/home/hbtjm/lab/serviceparadigm.com/src/cms/lib/ga4-credentials.json
```

## Testing

### Validate Connection

```bash
cd ~/lab/serviceparadigm.com
bun run src/cms/lib/ga4-api.ts --experiment=hero --days=7
```

Expected output:
```
Syncing GA4 data for experiment "hero" (7 days)...
  v1-baseline: 150 exposures, 8 conversions
  v2-editorial: 200 exposures, 25 conversions
  v3-direct: 140 exposures, 9 conversions

Sync complete: [...]
```

### Troubleshooting

| Error | Solution |
|-------|----------|
| `User does not have sufficient permissions` | Complete Step 2 above - grant service account access |
| `Property not found` | Verify GA4_PROPERTY_ID in `.env` matches the numeric ID from Step 1 |
| `API not enabled` | Enable Analytics Data API in Google Cloud Console |

## Manual Sync

Run manual sync:

```bash
bun run src/cms/lib/ga4-api.ts --experiment=hero --days=30
```

## Automated Daily Sync (Future)

Add to crontab or systemd timer:

```bash
# Daily at 6 AM Jamaica time
0 6 * * * cd ~/lab/serviceparadigm.com && bun run src/cms/lib/ga4-api.ts --experiment=hero --days=1
```

## Custom Event Parameters

The integration expects these custom event parameters in GA4:

- `variant_id` - The variant key (e.g., `v1-baseline`, `v2-editorial`)
- Sent via gtag with conversion events:

```javascript
gtag('event', 'form_submitted', {
  variant_id: 'v2-editorial',
  experiment_key: 'hero'
});
```

This is already implemented in `ContactForm.vue` and `Newsletter.vue`.

## Files

- `src/cms/lib/ga4-api.ts` - GA4 sync module
- `src/cms/lib/ga4-credentials.json` - Service account credentials (gitignored)
- `.env` - Environment variables

## Next Steps

1. Complete GA4 setup steps above
2. Test sync with `bun run src/cms/lib/ga4-api.ts`
3. Set up automated daily cron job
4. Add sync results to Results Dashboard UI
