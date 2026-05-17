import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "./src"),
      "@test": path.resolve(__dirname, "./test"),
    },
    mainFields: ["module", "browser", "main", "jsnext:main"],
  },
  plugins: [react()],
  test: {
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
