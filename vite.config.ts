// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        // Disable in dev so the SW never activates inside the Lovable preview iframe
        devOptions: { enabled: false },
        injectRegister: false, // we register manually with iframe/preview guard
        manifest: false, // we ship our own /public/manifest.webmanifest
        workbox: {
          globPatterns: ["**/*.{js,css,html,png,jpg,jpeg,svg,webp,woff,woff2}"],
          navigateFallback: "/",
          navigateFallbackDenylist: [/^\/api\//, /^\/~/],
        },
      }),
    ],
  },
});
