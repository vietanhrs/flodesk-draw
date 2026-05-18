import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "./src"),
      "@test": path.resolve(__dirname, "./test"),
    },
    mainFields: ["browser", "module", "jsnext:main", "main"],
  },
  plugins: [react(), cloudflare()],
  test: {
    exclude: [...configDefaults.exclude, "test/e2e/**"],
    globals: true,
    environment: "jsdom",
    setupFiles: "./test/setup.ts",
    server: {
      deps: {
        inline: [/@flodesk\/grain/],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
});
