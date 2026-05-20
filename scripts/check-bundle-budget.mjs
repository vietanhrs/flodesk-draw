import { readFileSync } from "node:fs";

const analysisPath = "dist/bundle-analysis.json";

const budgets = [
  { name: "vendor-grain", maxBytes: 420_000 },
  { name: "vendor-react", maxBytes: 300_000 },
  { name: "vendor", maxBytes: 50_000 },
  { name: "Editor", maxBytes: 75_000 },
  { name: "Templates", maxBytes: 22_000 },
  { name: "flodeskFile", maxBytes: 10_000 },
  { name: "index", maxBytes: 8_000 },
];

const totalBudget = {
  js: 900_000,
  css: 20_000,
};

const formatBytes = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;

const readAnalysis = () => {
  try {
    return JSON.parse(readFileSync(analysisPath, "utf8"));
  } catch (error) {
    throw new Error(
      `Could not read ${analysisPath}. Run ANALYZE_BUNDLE=1 bun run build first. ${String(
        error
      )}`
    );
  }
};

const findChunk = (chunks, name) => chunks.find((chunk) => chunk.name === name);

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const analysis = readAnalysis();
const chunks = Array.isArray(analysis.chunks) ? analysis.chunks : [];
const assets = Array.isArray(analysis.assets) ? analysis.assets : [];

for (const budget of budgets) {
  const chunk = findChunk(chunks, budget.name);
  if (!chunk) {
    fail(`Missing expected bundle chunk: ${budget.name}`);
    continue;
  }
  if (chunk.bytes > budget.maxBytes) {
    fail(
      `${budget.name} is ${formatBytes(chunk.bytes)}, over budget ${formatBytes(
        budget.maxBytes
      )}`
    );
  }
}

const totalJsBytes = chunks.reduce((sum, chunk) => sum + chunk.bytes, 0);
const totalCssBytes = assets
  .filter((asset) => asset.fileName.endsWith(".css"))
  .reduce((sum, asset) => sum + asset.bytes, 0);

if (totalJsBytes > totalBudget.js) {
  fail(
    `Total JS is ${formatBytes(totalJsBytes)}, over budget ${formatBytes(
      totalBudget.js
    )}`
  );
}

if (totalCssBytes > totalBudget.css) {
  fail(
    `Total CSS is ${formatBytes(totalCssBytes)}, over budget ${formatBytes(
      totalBudget.css
    )}`
  );
}

if (process.exitCode) {
  process.exit();
}

console.log("Bundle budget check passed.");
console.log(`Total JS: ${formatBytes(totalJsBytes)}`);
console.log(`Total CSS: ${formatBytes(totalCssBytes)}`);
