# Cloudflare Pages Setup Guide

This guide walks you through setting up Cloudflare Pages for the `cloudflare-migration` branch.

## ✅ Code Changes Complete

The following files are ready in this branch:
- `.node-version` → Specifies Node.js 20
- `public/_redirects` → **Removed** (not needed for HashRouter)
- `vite.config.ts` → Base path set to `/`
- `public/CNAME` → **Removed** (GitHub Pages specific)
- `CNAME` (root) → **Removed** (GitHub Pages specific)

## 🚀 Next Steps: Cloudflare Dashboard Setup

### Step 1: Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Click **Create application**
4. Select **Pages** tab
5. Click **Connect to Git**

### Step 2: Connect GitHub Repository

1. Click **Connect GitHub** (authorize if first time)
2. Select repository: **svenskdatabas**
3. Click **Begin setup**

### Step 3: Configure Build Settings

Enter the following configuration:

- **Project name**: `svenskdatabas` (or your preferred name)
- **Production branch**: `main`
- **Framework preset**: `None` (or select manually)
- **Build command**: `npm run build`
- **Build output directory**: `dist`

**Important**: Do NOT configure any environment variables at this stage.

### Step 4: Save and Deploy

1. Click **Save and Deploy**
2. Wait for the first deployment to complete (typically 2-3 minutes)
3. You'll get a preview URL: `https://cloudflare-migration.svenskdatabas.pages.dev`

### Step 5: Test on Preview URL

Visit your preview URL and verify:
- [ ] Homepage loads correctly
- [ ] Search functionality works
- [ ] Table sorting works
- [ ] All 25 brands display
- [ ] About page loads at `/#/om`
- [ ] Email copy functionality works
- [ ] No console errors in DevTools
- [ ] Mobile responsiveness works
- [ ] Fonts load correctly

## 🧪 Testing Phase

While testing on the preview URL:
- **Live site (`brandsfrom.se`)**: Still runs on GitHub Pages ✅
- **GitHub Actions**: Still enabled ✅
- **No DNS changes**: Your production domain is untouched ✅

## ✅ If Testing Successful

When you're satisfied with the preview deployment:

1. **Merge to main**:
   ```bash
   git checkout main
   git merge cloudflare-migration
   git push origin main
   ```

2. **Wait for main branch deployment** in Cloudflare (automatic)

3. **Disable GitHub Actions**:
   ```bash
   git mv .github/workflows/deploy.yml .github/workflows/deploy.yml.backup
   git commit -m "Disable GitHub Actions (migrated to Cloudflare Pages)"
   git push origin main
   ```

4. **Add Custom Domain** (only if nameservers already point to Cloudflare):
   - In Cloudflare Pages project → **Custom domains**
   - Click **Set up a custom domain**
   - Enter `brandsfrom.se`
   - Follow DNS configuration prompts

## 🔧 Custom Domain Setup (Apex Domain)

Since `brandsfrom.se` is an apex domain, you need:

1. **Add domain to Cloudflare**:
   - Go to Cloudflare Dashboard → **Websites**
   - Click **Add a site**
   - Enter `brandsfrom.se`
   - Choose Free plan
   - Follow nameserver setup instructions

2. **Update nameservers at your domain registrar**:
   - Copy the Cloudflare nameservers (e.g., `ns1.cloudflare.com`, `ns2.cloudflare.com`)
   - Log in to your domain registrar
   - Update nameservers to Cloudflare's nameservers
   - Wait for DNS propagation (can take 24-48 hours)

3. **Verify DNS propagation**:
   ```bash
   nslookup brandsfrom.se
   ```

4. **Then add custom domain** in Pages project (see step 4 above)

## ❌ If Issues Occur

If you encounter problems during testing:

1. **Don't panic** - your live site is still on GitHub Pages
2. **Check Cloudflare Pages logs** for build errors
3. **Review the build output** in Cloudflare dashboard
4. **Delete the Cloudflare project** if needed (no impact on live site)
5. **Ask for help** or consult [migration-spec.md](./migration-spec.md)

## 📋 Rollback Plan

To rollback if needed:

1. Switch back to main: `git checkout main`
2. Delete the migration branch: `git branch -D cloudflare-migration`
3. Delete Cloudflare Pages project via dashboard
4. Continue using GitHub Pages as before

## 📚 Additional Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Git Integration Guide](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Custom Domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Build Configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)

---

**Branch**: `cloudflare-migration`
**Status**: Ready for Cloudflare setup
**Next**: Follow steps 1-5 above to create Cloudflare Pages project
