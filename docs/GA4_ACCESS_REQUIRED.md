# GA4 Service Account Access - Action Required

## Service Account Details

```
Email: serviceparadigm-ga4@extreme-tribute-394420.iam.gserviceaccount.com
Project: extreme-tribute-394420
Property ID: 535898995
```

## Steps to Grant Access

1. **Go to Google Analytics**
   - URL: https://analytics.google.com/

2. **Select the Correct Property**
   - Make sure you're viewing the property with ID `535898995`
   - This should be the serviceparad.com GA4 property

3. **Open Property Access Management**
   - Click the **Admin** gear icon (bottom left)
   - Under the **Property** column (middle), click **Property Access Management**

4. **Add the Service Account**
   - Click the blue **+ Add** button (top right)
   - Select **Add users**

5. **Enter Service Account Email**
   ```
   serviceparadigm-ga4@extreme-tribute-394420.iam.gserviceaccount.com
   ```

6. **Assign Role**
   - Select **Viewer** role (read-only access is sufficient)
   - Do NOT select "Notify new users by email" (not needed for service accounts)

7. **Click Add**

## Wait for Propagation

Access changes can take 5-15 minutes to propagate through Google's systems.

## Verify Access

After waiting, run this command:

```bash
cd ~/lab/serviceparadigm.com
bun run src/cms/lib/ga4-api.ts --experiment=hero --days=7
```

**Expected output:**
```
Syncing GA4 data for experiment "hero" (7 days)...
  v1-baseline: X exposures, Y conversions
  v2-editorial: X exposures, Y conversions
  v3-direct: X exposures, Y conversions

Sync complete: [...]
```

## Troubleshooting

If you still get "insufficient permissions" after 15 minutes:

1. **Verify the email was entered correctly** (no typos)
2. **Confirm you're on the right property** (ID: 535898995)
3. **Try removing and re-adding** the service account
4. **Check Account-level access** - sometimes property-level isn't enough

---

**Once this works**, I'll set up:
- Daily automated sync (6 AM Jamaica time)
- Dashboard auto-refresh from GA4
- Alert notifications if sync fails
