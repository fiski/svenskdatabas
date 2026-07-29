import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // For custom domain deployment
  build: {
    // flag-icons ships ~540 country flags. With Vite's default 4 kB inline
    // limit, 400 of them were base64-inlined into the render-blocking CSS
    // bundle (441 kB, of which ~380 kB was flags the site never shows).
    // Nothing in src/ imports images, so disabling inlining only affects
    // flag-icons: each flag becomes a cached file, fetched only when shown.
    assetsInlineLimit: 0,
  },
})
