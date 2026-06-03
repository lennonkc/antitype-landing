import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  // Pin the dev port so scripts/verify-hands.mjs (and the screenshot tooling)
  // hit a known URL; falls back to the next free port if 5174 is taken.
  server: { port: 5174 },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
