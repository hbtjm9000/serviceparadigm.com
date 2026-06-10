# GA4 Service Account - Access Issues Diagnosed

## Diagnostic Results (Just Run)

```
Service Account: serviceparadigm-ga4@extreme-tribute-394420.iam.gserviceaccount.com
Property ID: 535898995
```

### Issues Found:

| Test | Result | Meaning |
|------|--------|---------|
| List Properties | ❌ API not enabled | Analytics Admin API disabled in GCP |
| Real-time Data | ❌ Insufficient permissions | Service account not granted GA4 access |
| Report Data | ❌ Insufficient permissions | Same as above |
| GA4 Tag Check | ✅ In code (not deployed) | Tag is in BaseLayout.astro, site not live |

---

## Required Actions

### 1. Enable Analytics Admin API (Google Cloud Console)

**URL:** https://console.cloud.google.com/apis/api/analyticsadmin.googleapis.com/overview?project=extreme-tribute-394420

**Steps:**
1. Go to the URL above (opens project `extreme-tribute-394420`)
2. Click **ENABLE** button
3. Wait 1-2 minutes for propagation

---

### 2. Grant Service Account Access to GA4 Property

**The GA4 Admin UI blocks adding service accounts directly.** Use this workaround:

**Option A: Grant via Google Cloud Console (Recommended)**

1. Go to: https://console.cloud.google.com/iam-admin/iam?project=extreme-tribute-394420
2. Click **+ GRANT ACCESS**
3. Enter: `serviceparadigm-ga4@extreme-tribute-394420.iam.gserviceaccount.com`
4. Select role: **Analytics Data API User** or **Viewer**
5. Click **SAVE**

**Option B: Grant via GA4 Property Settings (If Option A doesn't work)**

1. Go to: https://analytics.google.com/analytics/web/?#/property/535898995/admin/account/access
2. Click **+ Add users**
3. Enter the service account email
4. Select **Viewer** role
5. **Important:** Check "Include Google Marketing Platform" if available
6. Click **Add**

---

### 3. Verify Access (After 5-15 minutes)

```bash
cd ~/lab/serviceparadigm.com
bun run src/cms/lib/ga4-diagnose.ts
```

**Expected output:**
```
Test 1: Listing GA4 properties...
  Accessible properties:
    - properties/535898995 (ID: 535898995)
      Display name: serviceparadigm.com

Test 2: Checking real-time data...
  Real-time active users: X

Test 3: Checking for any report data (last 90 days)...
  Sessions (90 days): XXXX
```

---

## Why the GA4 Admin UI Blocks Service Accounts

Google's GA4 Admin UI is designed for human users and validates emails against Google Account formats. Service accounts (`@...iam.gserviceaccount.com`) fail this validation.

**The workaround:** Grant access at the **Google Cloud IAM level** (Option A above), not the GA4 Admin UI level.

---

## GA4 Tag Status

The gtag.js snippet **is installed** in `src/layouts/BaseLayout.astro`:
```astro
<!-- Line 40-46 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-SLDE3K52MY"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-SLDE3K52MY');
</script>
```

**Not showing on curl test because:**
- Site not deployed to production yet, OR
- Tag fires on client-side only (not in SSR HTML)

Once deployed, GA4 will start collecting data within 24-48 hours.

---

## Summary

| Step | Action | Location |
|------|--------|----------|
| 1 | Enable Analytics Admin API | Google Cloud Console |
| 2 | Grant IAM access to service account | Google Cloud IAM OR GA4 Admin |
| 3 | Wait 5-15 minutes | - |
| 4 | Run diagnose script | Terminal |
| 5 | Deploy site (for data collection) | Your hosting platform |

---

**Once diagnostics pass**, I'll:
- Set up daily sync cron job
- Integrate GA4 data into Results Dashboard
- Add conversion tracking validation
