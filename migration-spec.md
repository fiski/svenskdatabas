# Cloudflare Pages Migration Specification

## Overview

This document outlines the migration plan from GitHub Pages to Cloudflare Pages for the Svensk Databas project (brandsfrom.se).

## Previous Attempt Context

The repository shows a previous migration attempt (Dec 9, 2025) that encountered "build issues" and was reverted. The attempt included:
- Disabling GitHub Actions workflow
- Adding Node.js version specification (`.node-version` with "20")
- Adding `_redirects` file for HashRouter support
- Cloudflare Web Analytics placeholder

**Good news**: Some useful files from that attempt still exist (`.node-version`, `public/_redirects`).

## Current Assessment

### ✅ What's Already Correct

1. **Node.js Version Configuration**: `.node-version` file with "20" is the correct approach
2. **Build Settings**: `npm run build` → `dist` directory is correct
3. **_redirects File**: Existing `public/_redirects` with `/* /index.html 200` is perfect for SPA routing
4. **General Process**: Git integration, build configuration, and deployment flow were accurate

### 🔄 Updates & Clarifications Needed

#### 1. Custom Domain Setup for Apex Domain (Important!)

Since `brandsfrom.se` is an **apex domain** (not a subdomain), the documentation specifies:

**Requirements:**
- Must add the site as a **Cloudflare zone**
- Must **configure nameservers** to point to Cloudflare

**Steps:**
1. Add `brandsfrom.se` to Cloudflare as a zone (if not already)
2. Update domain registrar to use Cloudflare nameservers
3. Once DNS is managed by Cloudflare, add custom domain in Pages project:
   - Go to **Workers & Pages** → Your project → **Custom domains** → **Setup a custom domain**

**Alternative for Subdomain:**
- If using `www.brandsfrom.se` instead, can use CNAME directly without nameserver changes

#### 2. Deployment Method Options

**Option A: Git Integration** (Recommended)
- Connect GitHub repo directly in Cloudflare dashboard
- Automatic deployments on push to `main`
- Preview deployments for all other branches
- Branch aliases: `<branch>.<project>.pages.dev`

**Option B: Direct Upload with GitHub Actions**
- Keep building in GitHub Actions
- Use Wrangler to upload built assets: `wrangler pages deploy dist`
- Requires `CLOUDFLARE_API_TOKEN` secret

**Option C: Direct Upload via Wrangler CLI**
- Manual deployments: `wrangler pages deploy dist --project-name=svenskdatabas`

#### 3. Build Image & Node.js Defaults

Current Cloudflare defaults:
- **Build Image v2** (default): Node.js 22.16.0
- Your `.node-version` specifies "20" ✓
- This will override the default correctly

#### 4. Framework Preset

During setup, select:
- **Framework preset**: "None" (since using custom Vite setup)
- Or manually configure: Build command + Build directory

#### 5. GitHub Actions Workflow

If keeping GitHub Actions with Direct Upload:

```yaml
- name: Deploy to Cloudflare Pages
  uses: cloudflare/pages-action@v1
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    projectName: svenskdatabas
    directory: dist
    gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

## Migration Checklist

### Prerequisites
- [ ] Ensure `brandsfrom.se` is added to Cloudflare as a zone (for apex domain)
- [ ] Confirm nameservers point to Cloudflare

### Setup
- [x] `.node-version` exists with "20"
- [x] `public/_redirects` exists with SPA redirect rule
- [ ] Choose deployment method (Git integration vs Direct Upload)

### If Using Git Integration (Recommended):
1. [ ] Connect GitHub repo in Cloudflare dashboard (**Workers & Pages** → **Create application** → **Pages** → **Connect to Git**)
2. [ ] Select repository: `svenskdatabas`
3. [ ] Configure build settings:
   - **Project name**: `svenskdatabas` (or custom name)
   - **Production branch**: `main`
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. [ ] Click **Save and Deploy**
5. [ ] Wait for first deployment to complete
6. [ ] Disable GitHub Actions workflow (rename `.github/workflows/deploy.yml` to `.github/workflows/deploy.yml.backup`)
7. [ ] Add custom domain `brandsfrom.se` in Pages settings (**Custom domains** → **Setup a custom domain**)
8. [ ] Verify DNS records in Cloudflare DNS dashboard

### If Using Direct Upload + GitHub Actions:
1. [ ] Create Cloudflare Pages project via dashboard or CLI
2. [ ] Get Cloudflare API token (**My Profile** → **API Tokens** → **Create Token**)
3. [ ] Get Cloudflare Account ID (from Pages project URL or dashboard)
4. [ ] Add `CLOUDFLARE_API_TOKEN` to GitHub repository secrets
5. [ ] Add `CLOUDFLARE_ACCOUNT_ID` to GitHub repository secrets
6. [ ] Update `.github/workflows/deploy.yml` to use `cloudflare/pages-action@v1`
7. [ ] Add custom domain `brandsfrom.se` in Pages settings
8. [ ] Push changes to trigger deployment

### Cleanup
- [ ] Remove `public/CNAME` file (GitHub Pages specific)
- [ ] Remove `CNAME` file from root directory (if exists)
- [ ] Test deployment on `<project>.pages.dev`
- [ ] Verify custom domain `brandsfrom.se` resolves correctly
- [ ] Check that all routes work (especially with HashRouter)
- [ ] Verify About page loads correctly at `/#/om`

## Key Difference from Previous Attempt

The "build issues" from your previous attempt (commit 8b1bcfe → d95f642) likely occurred because:
- The Git integration was not used (just disabled GitHub Actions)
- No Cloudflare project was actually created/configured
- The changes were only local (workflow disabled, redirects added)

**Solution**: This time, actually create the Cloudflare Pages project via dashboard or Wrangler CLI before disabling GitHub Actions.

## Build Configuration Reference

### Current Build Settings
```json
{
  "buildCommand": "npm run build",
  "buildOutputDirectory": "dist",
  "nodeVersion": "20",
  "framework": "vite"
}
```

### Files Already in Place
- `.node-version`: Specifies Node.js 20
- `public/_redirects`: SPA routing (`/* /index.html 200`)
- `vite.config.ts`: Base path set to `/` (correct for root deployment)
- `package.json`: Build script defined as `tsc -b && vite build`

### Files to Remove
- `public/CNAME`: GitHub Pages specific (contains `brandsfrom.se`)
- `CNAME` (root): Duplicate of above

## Advantages of Cloudflare Pages

- **Faster Global CDN**: Better edge network performance
- **Better DDoS Protection**: Enterprise-grade security
- **Built-in Analytics**: Cloudflare Web Analytics available
- **Unlimited Bandwidth**: No bandwidth caps
- **Edge Functions Support**: Pages Functions for serverless logic
- **Better Performance Metrics**: Real-time deployment monitoring
- **Preview Deployments**: Automatic preview URLs for all branches
- **Branch Aliases**: `<branch>.<project>.pages.dev` for testing

## Rollback Plan

If migration fails or issues occur:

1. Re-enable GitHub Actions workflow (rename `.github/workflows/deploy.yml.backup` back to `.github/workflows/deploy.yml`)
2. Restore `public/CNAME` file with `brandsfrom.se`
3. Update DNS back to GitHub Pages if changed
4. Push changes to trigger GitHub Pages deployment

## Post-Migration Verification

- [ ] Homepage loads at `https://brandsfrom.se`
- [ ] About page loads at `https://brandsfrom.se/#/om`
- [ ] Search functionality works
- [ ] Table sorting works
- [ ] All 25 brands display correctly
- [ ] Email copy functionality works on About page
- [ ] Mobile responsiveness maintained
- [ ] Custom fonts load correctly
- [ ] No console errors in browser DevTools

## Support & Documentation

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **Git Integration Guide**: https://developers.cloudflare.com/pages/get-started/git-integration
- **Custom Domains**: https://developers.cloudflare.com/pages/configuration/custom-domains
- **Build Configuration**: https://developers.cloudflare.com/pages/configuration/build-configuration
- **Redirects**: https://developers.cloudflare.com/pages/configuration/redirects

---

**Created**: December 9, 2025
**Status**: Ready for implementation
**Recommended Approach**: Git Integration (Option A)
