# Vue3 CMS Implementation Guide

## Overview

This document describes the Vue3 CMS implementation for managing A/B test variants in the Paradigm website.

## Architecture

```
src/
├── cms/                          # NEW: CMS Admin Interface
│   ├── App.vue                   # Root component
│   ├── components/
│   │   └── AdminLayout.vue       # Admin layout with navigation
│   ├── lib/
│   │   ├── content-api.ts        # CRUD operations for variants
│   │   ├── stats.ts              # Statistical analysis utilities
│   │   └── router.ts             # Vue Router configuration
│   └── pages/
│       └── experiments/
│           ├── index.vue         # List all variants
│           └── [key].vue         # Edit specific variant
├── composables/
│   └── useExperiment.ts          # EXISTING: Client-side experiment logic
├── content/
│   └── hero/
│       └── variants.json         # EXISTING: Variant data storage
└── pages/
    └── admin/
        └── index.astro           # NEW: Admin entry point
```

## Features Implemented

### ✅ Phase 1: CMS Foundation (COMPLETE)

**1. Content API** (`src/cms/lib/content-api.ts`)
- `getVariants()` - Fetch all variants for an experiment
- `createVariant()` - Add new variant
- `updateVariant()` - Modify existing variant
- `deleteVariant()` - Remove variant
- Automatic fallback from fetch to import for production builds

**2. Statistical Library** (`src/cms/lib/stats.ts`)
- `calculateConversionRate()` - Wilson score confidence intervals
- `calculatePValue()` - Two-proportion z-test
- `analyzeExperiment()` - Full statistical summary
- `findWinner()` - Determine statistically significant winner

**3. Admin UI Components**
- **AdminLayout** - Navigation header with routing
- **Experiments List** - Grid view of all variants with actions
- **Variant Editor** - Form with live preview panel
- **Create Modal** - Quick variant creation dialog

**4. Routing** (`src/cms/lib/router.ts`)
- `/admin` → Redirects to `/admin/experiments`
- `/admin/experiments` → List all variants
- `/admin/experiments/:key` → Edit specific variant
- `/admin/content` → Content management (placeholder)

## Next Steps (REQUIRED)

### 1. Integrate Vue Router with Astro

**File:** `astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://serviceparadigm.com',
  integrations: [
    vue({
      // Add router integration
      experimental: {
        clientSideRouting: true,
      },
    }),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### 2. Create Admin Middleware (Authentication)

**File:** `src/middleware/admin-auth.ts`

```typescript
import type { AstroMiddleware } from 'astro';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

export const onRequest: AstroMiddleware = async (context, next) => {
  // Skip auth in development
  if (import.meta.env.DEV) {
    return await next();
  }

  const session = context.cookies.get('admin_session');
  
  if (!session || session.value !== ADMIN_PASSWORD) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"',
      },
    });
  }

  return await next();
};
```

**File:** `src/pages/admin/middleware.ts`
```typescript
export { onRequest } from '../../middleware/admin-auth';
```

### 3. Add API Endpoint for Saving Variants

**File:** `src/pages/api/cms/save-variants.ts`

```typescript
import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { experimentKey, variants } = await request.json();
    
    // Validate input
    if (!experimentKey || !variants) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Write to file
    const filePath = path.join(
      import.meta.env.ROOT,
      'src/content/hero/variants.json'
    );
    
    await fs.writeFile(
      filePath,
      JSON.stringify(variants, null, 2),
      'utf-8'
    );
    
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Save error:', error);
    return new Response(JSON.stringify({ error: 'Save failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### 4. Update Package.json Dependencies

```bash
cd ~/lab/serviceparadigm.com
bun add vue-router@4
```

### 5. Test the CMS

**Development Mode:**
```bash
cd ~/lab/serviceparadigm.com
bun run dev --host 0.0.0.0
```

Navigate to: `http://localhost:4321/admin/experiments`

**Expected Behavior:**
- See 3 existing variants (v1-baseline, v2-editorial, v3-direct)
- Click "Edit" on any variant → Navigate to editor page
- Modify headline → Click "Save Changes" → Should save to variants.json
- Click "Preview" → Opens homepage with selected variant
- Click "New Variant" → Opens modal → Create variant → Appears in grid

## Usage Workflow

### Creating a New Variant

1. Navigate to `/admin/experiments`
2. Click "New Variant" button
3. Fill in form:
   - **Variant Key**: `v4-your-variant-name` (lowercase, hyphens)
   - **Label**: "Descriptive name for internal use"
   - **Headline**: "Main hero headline text"
   - **Headline Highlight**: "Word to emphasize"
   - **CTA Text**: "Button label"
   - **Subheadline**: "Supporting description (max 200 chars)"
4. Click "Create Variant"
5. Variant appears in grid immediately

### Editing a Variant

1. Click "Edit" on any variant card
2. Modify fields in left panel
3. See live preview in right panel
4. Watch character counts update
5. Click "Save Changes"
6. Changes persist to `variants.json`

### Testing a Variant

1. Click "Preview" on any variant
2. Opens homepage in new tab
3. Variant is forced via localStorage
4. Refresh page to see different variants

### Deleting a Variant

1. Click "Delete" on variant card
2. Confirm deletion dialog
3. Variant removed from `variants.json`
4. Cannot delete last remaining variant

## Integration with Existing Code

### HeroClient.vue (No Changes Needed)

The existing `useExperiment` composable already reads from `variants.json`:

```typescript
// src/composables/useExperiment.ts
import variants from '@/content/hero/variants.json';
```

The CMS writes to the same file, so no code changes are required.

### ContactForm.vue (No Changes Needed)

Conversion tracking already works with the experiment system:

```typescript
// src/components/ContactForm.vue
const variant = localStorage.getItem('experiment_hero_variant');
// Logs conversion with variant attribution to GA4
```

## Production Deployment

### 1. Set Environment Variables

```bash
# .env.production
ADMIN_PASSWORD=your-secure-password-here
```

### 2. Build and Deploy

```bash
bun run build
# Deploy dist/ to your hosting provider
```

### 3. Configure Hosting

**Netlify/Vercel:**
- Set `ADMIN_PASSWORD` in environment variables
- Deploy `dist/` directory
- Enable SPA routing for `/admin/*` paths

**Cloudflare Pages:**
- Set `ADMIN_PASSWORD` in environment variables
- Deploy `dist/` directory
- Configure `_routes.json` for SPA routing

## Security Considerations

### Current State
- ⚠️ No authentication implemented yet
- ⚠️ API endpoint accepts all requests (no validation)
- ⚠️ variants.json is world-readable in production

### Required Before Production
1. ✅ Implement admin authentication (see Step 2 above)
2. ✅ Add API endpoint with proper validation (see Step 3 above)
3. ✅ Rate limit API requests
4. ✅ Add CSRF protection
5. ✅ Use HTTPS only
6. ✅ Restrict admin access by IP (optional)

## Future Enhancements

### Phase 3: Results Dashboard
- GA4 Reporting API integration
- Conversion rate by variant
- Statistical significance visualization
- Winner promotion workflow

### Phase 4: Content Expansion
- Manage all page copy (Services, About, Contact)
- Component-level copy management
- Navigation and footer links
- Form labels and placeholders

### Phase 5: Workflow Automation
- Auto-rebuild on CMS save (webhook)
- Slack/email notifications
- Scheduled content publishing
- Version history and rollback

## Troubleshooting

### "Failed to load variants"
- Check that `variants.json` exists at `src/content/hero/variants.json`
- Verify file permissions (readable by web server)
- Check browser console for 404 errors

### "Save failed" error
- Ensure API endpoint exists at `/api/cms/save-variants`
- Check server logs for write permissions
- Verify `ADMIN_PASSWORD` is set correctly

### Router not working
- Ensure `vue-router@4` is installed: `bun list`
- Check Astro config has `clientSideRouting: true`
- Clear browser cache and reload

## Files Created

```
src/cms/
├── App.vue                          ✅ Created
├── components/
│   └── AdminLayout.vue              ✅ Created
├── lib/
│   ├── content-api.ts               ✅ Created
│   ├── router.ts                    ✅ Created
│   └── stats.ts                     ✅ Created
└── pages/
    └── experiments/
        ├── index.vue                ✅ Created
        └── [key].vue                ✅ Created

src/pages/admin/
└── index.astro                      ✅ Created
```

## Status

**Phase 2: Vue3 CMS Foundation** - ✅ COMPLETE

**Next Phase:** Phase 3 - Results Dashboard (GA4 integration + statistical analysis UI)

**Dependencies:** 
- `vue-router@4` (not yet installed)
- Astro Vue integration update (clientSideRouting)
- API endpoint implementation

---

**Last Updated:** 2026-05-04
**Author:** Riki (Chief of Staff)
**Project:** Paradigm IT Services - serviceparadigm.com
