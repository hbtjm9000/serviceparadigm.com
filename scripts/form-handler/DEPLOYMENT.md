# Google Apps Script Deployment Guide

## Quick Deploy (5 minutes)

### Step 1: Open Google Apps Script
1. Go to https://script.google.com
2. Click **"New Project"** (or open existing "Paradigm Contact Form" project)

### Step 2: Paste Code
1. Delete any existing code in `Code.gs`
2. Copy the entire contents of `scripts/form-handler/Code.gs`
3. Paste into the Google Apps Script editor
4. Click **"Save"** (Ctrl/Cmd + S)
5. Name the project: "Paradigm Contact Form Handler"

### Step 3: Set Script Properties
1. In the left sidebar, click **"Project Settings"** (gear icon)
2. Scroll to **"Script Properties"**
3. Click **"Add Script Property"**
4. Add:
   - Property: `NOTIFY_EMAIL`
   - Value: `hal@paradigm.com.jm`
5. Click **"Save"**

### Step 4: Create Spreadsheet (Optional but Recommended)
1. Go to https://sheets.google.com
2. Create new spreadsheet: "Paradigm Website Inquiries"
3. Rename Sheet1 to: `Inquiries`
4. Add headers in row 1:
   - A1: `Timestamp`
   - B1: `Name`
   - C1: `Email`
   - D1: `Company`
   - E1: `Service`
   - F1: `Message`
5. Copy the spreadsheet ID from the URL (between `/d/` and `/edit`)
6. In Apps Script editor, add this line at top of Code.gs:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```
7. Update `logToSheet()` function:
   ```javascript
   function logToSheet(data) {
     const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
     const sheet = ss.getSheetByName('Inquiries');
     // ... rest of function
   }
   ```

### Step 5: Deploy as Web App
1. In Apps Script editor, click **"Deploy"** → **"New deployment"**
2. Click gear icon next to "Select type" → **"Web app"**
3. Configure:
   - **Description**: "Contact Form Handler v1"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** (critical!)
4. Click **"Deploy"**
5. Authorize when prompted:
   - Click **"Review permissions"**
   - Select your Google account
   - Click **"Advanced"** → **"Go to [Project Name] (unsafe)"**
   - Click **"Allow"**
6. **Copy the Web App URL** (starts with `https://script.google.com/macros/s/.../exec`)

### Step 6: Test the Endpoint
```bash
curl -L -X POST "YOUR_NEW_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","message":"Test message"}'
```

**Expected response:**
```json
{"success":true,"message":"Thank you for your inquiry. We'll be in touch within 24 hours."}
```

### Step 7: Update ContactForm.vue
1. Open: `src/components/ContactForm.vue`
2. Find line 142:
   ```typescript
   const FORM_ENDPOINT = 'https://script.google.com/macros/s/.../exec';
   ```
3. Replace with your new Web App URL
4. Save and commit

## Troubleshooting

### "Sorry, unable to open the file at present" (404)
- **Cause**: Deployment URL is wrong or expired
- **Fix**: Redeploy (Step 5) and ensure you copied the full URL

### "Something went wrong" (500)
- **Cause**: Script properties not set or GmailApp authorization failed
- **Fix**: 
  1. Check Script Properties (Step 3)
  2. Run the `test()` function in Apps Script editor to trigger authorization
  3. Check **Executions** tab for error details

### Form submits but no email received
- **Cause**: NOTIFY_EMAIL property not set or Gmail quota exceeded
- **Fix**: 
  1. Verify Script Properties (Step 3)
  2. Check your Gmail quota (100 emails/day for free accounts)
  3. Check **Executions** tab for errors

### CORS errors in browser console
- **Cause**: Web app not deployed with "Anyone" access
- **Fix**: Redeploy with **Who has access: Anyone** (Step 5.3)

## Security Notes

- **Script Properties** are encrypted and only accessible by your script
- **GmailApp.sendEmail()** counts against your daily Gmail quota (100/day free, 1,500/day Workspace)
- **Web App URL** is public but has no authentication - consider adding reCAPTCHA for production
- **Spreadsheet** should be shared only with your Google account

## Monitoring

### View Form Submissions
1. **Spreadsheet**: Real-time log of all submissions
2. **Gmail**: Email notifications for each submission
3. **Apps Script Executions**: https://script.google.com/home/executions
   - Filter by project name
   - View success/failure status
   - Check error messages

### Set Up Alerts
1. In Apps Script editor, click **"Triggers"** (clock icon)
2. Click **"Add Trigger"**
3. Configure:
   - Function: `doPost`
   - Deployment: **Head**
   - Event type: **On error**
   - Notify: **Email immediately**
4. Click **"Save"**

---

**Script Source:** `scripts/form-handler/Code.gs`
**Last Updated:** 2026-05-04
**Status:** ✅ Code verified, awaiting deployment
