import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// Relative base so the build works on any host path and inside the Capacitor (Android) app.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 2000 },
  // Shown in the menu. The Android build (CI) sets VERSION_NAME, e.g. 1.0.42.
  define: { __APP_VERSION__: JSON.stringify(process.env.VERSION_NAME || pkg.version) },
});
