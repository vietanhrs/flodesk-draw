import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";
import type { Plugin } from "vite";
import { configDefaults, defineConfig } from "vitest/config";

const ANALYZE_BUNDLE = process.env.ANALYZE_BUNDLE === "1";

interface BundleAsset {
  type: "asset";
  fileName: string;
  source: string | Uint8Array;
}

interface BundleModuleInfo {
  renderedLength?: number;
  removedExports?: readonly string[];
}

interface BundleChunk {
  type: "chunk";
  fileName: string;
  name: string;
  isEntry: boolean;
  isDynamicEntry: boolean;
  imports: string[];
  dynamicImports: string[];
  code: string;
  modules: Record<string, BundleModuleInfo>;
}

type BundleEntry = BundleAsset | BundleChunk | { type: string };

const manualChunks = (id: string) => {
  const normalized = id.replaceAll("\\", "/");
  if (!normalized.includes("node_modules")) return undefined;

  if (
    /node_modules\/(?:react|react-dom|scheduler|react-router|react-router-dom)\//.test(
      normalized
    )
  ) {
    return "vendor-react";
  }

  if (
    normalized.includes("node_modules/@flodesk/grain") ||
    normalized.includes("node_modules/@emotion/") ||
    normalized.includes("node_modules/@floating-ui/") ||
    normalized.includes("node_modules/@headlessui/")
  ) {
    return "vendor-grain";
  }

  return "vendor";
};

const isBundleAsset = (entry: BundleEntry): entry is BundleAsset =>
  entry.type === "asset";

const isBundleChunk = (entry: BundleEntry): entry is BundleChunk =>
  entry.type === "chunk";

const assetByteLength = (asset: BundleAsset) =>
  typeof asset.source === "string"
    ? Buffer.byteLength(asset.source, "utf8")
    : asset.source.byteLength;

const bundleAnalysisPlugin = (): Plugin => ({
  name: "flodesk-bundle-analysis",
  apply: "build",
  generateBundle(_options, bundle) {
    if (!ANALYZE_BUNDLE) return;

    const entries = Object.values(bundle) as BundleEntry[];

    const chunks = entries
      .filter(isBundleChunk)
      .map((chunk) => ({
        fileName: chunk.fileName,
        name: chunk.name,
        isEntry: chunk.isEntry,
        isDynamicEntry: chunk.isDynamicEntry,
        imports: chunk.imports,
        dynamicImports: chunk.dynamicImports,
        bytes: Buffer.byteLength(chunk.code, "utf8"),
        modules: Object.entries(chunk.modules)
          .map(([id, moduleInfo]) => ({
            id,
            renderedLength: moduleInfo.renderedLength ?? 0,
            removedExports: moduleInfo.removedExports?.length ?? 0,
          }))
          .sort((a, b) => b.renderedLength - a.renderedLength)
          .slice(0, 25),
      }))
      .sort((a, b) => b.bytes - a.bytes);

    const assets = entries
      .filter(isBundleAsset)
      .map((asset) => ({
        fileName: asset.fileName,
        bytes: assetByteLength(asset),
      }))
      .sort((a, b) => b.bytes - a.bytes);

    this.emitFile({
      type: "asset",
      fileName: "bundle-analysis.json",
      source: JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          chunks,
          assets,
        },
        null,
        2
      ),
    });
  },
});

export default defineConfig({
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "./src"),
      "@test": path.resolve(__dirname, "./test"),
    },
    mainFields: ["browser", "module", "jsnext:main", "main"],
  },
  plugins: [react(), cloudflare(), bundleAnalysisPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
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
