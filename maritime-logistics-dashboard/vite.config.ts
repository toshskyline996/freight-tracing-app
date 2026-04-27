import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      // ws is a Node-only dep used by ais-proxy — not needed in browser build
      external: ["ws"],
    },
  },
});
