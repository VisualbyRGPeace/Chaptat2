import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base path is set for GitHub Pages: https://<user>.github.io/<repo>/
// Change "chap-tat" below to your actual repository name before deploying.
export default defineConfig({
  plugins: [react()],
  base: "/chap-tat/",
  build: {
    outDir: "dist",
  },
});
