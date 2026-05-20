import { mkdir, readFile, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const HOST = "127.0.0.1";
const PORT = 4174;
const BASE_URL = `http://${HOST}:${PORT}`;
const REPORT_DIR = ".lighthouse";
const KiB = 1024;

const CI_RUNNER_NOTE =
  "Note: CI Lighthouse scores are calibrated for GitHub Actions runners. " +
  "Those runners have weaker and more variable CPU than local machines or " +
  "the hosted Cloudflare Workers app, so the mobile performance score is a " +
  "CI regression baseline, not a production performance rating.";

const routes = [
  {
    name: "template-gallery-desktop",
    path: "/templates",
    formFactor: "desktop",
    minimumScores: {
      performance: 0.85,
      accessibility: 0.9,
      "best-practices": 0.9,
      seo: 0.9,
    },
    maximumMetrics: {
      "largest-contentful-paint": 2_500,
      "cumulative-layout-shift": 0.1,
      "total-blocking-time": 300,
      "speed-index": 3_000,
      "total-byte-weight": 950 * KiB,
    },
  },
  {
    name: "template-gallery-mobile",
    path: "/templates",
    formFactor: "mobile",
    // The hosted app scores higher in Lighthouse. GitHub Actions runners are
    // CPU-constrained and noisy, so this score budget protects against CI
    // regressions while the metric budgets below keep concrete Web Vitals and
    // resource-size constraints in place.
    minimumScores: {
      performance: 0.55,
      accessibility: 0.9,
      "best-practices": 0.9,
      seo: 0.9,
    },
    maximumMetrics: {
      "largest-contentful-paint": 5_500,
      "cumulative-layout-shift": 0.1,
      "total-blocking-time": 500,
      "speed-index": 5_500,
      "total-byte-weight": 950 * KiB,
    },
  },
  {
    name: "blank-editor-desktop",
    path: "/editor",
    formFactor: "desktop",
    minimumScores: {
      performance: 0.8,
      accessibility: 0.9,
      "best-practices": 0.9,
      seo: 0.85,
    },
    maximumMetrics: {
      "largest-contentful-paint": 3_000,
      "cumulative-layout-shift": 0.1,
      "total-blocking-time": 350,
      "speed-index": 3_500,
      "total-byte-weight": 1_050 * KiB,
    },
  },
  {
    name: "template-editor-desktop",
    path: "/templates/bold-sale-announcement",
    formFactor: "desktop",
    minimumScores: {
      performance: 0.8,
      accessibility: 0.9,
      "best-practices": 0.9,
      seo: 0.85,
    },
    maximumMetrics: {
      "largest-contentful-paint": 3_000,
      "cumulative-layout-shift": 0.1,
      "total-blocking-time": 350,
      "speed-index": 3_500,
      "total-byte-weight": 1_050 * KiB,
    },
  },
];

const run = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.stdio ?? "pipe",
      env: { ...process.env, ...options.env },
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(
          new Error(
            `${command} ${args.join(" ")} exited with ${code}\n${stdout}\n${stderr}`
          )
        );
      }
    });
  });

const waitForServer = async () => {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE_URL}/templates`);
      if (response.ok) return;
    } catch {
      // Keep polling until Vite preview finishes binding.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${BASE_URL}`);
};

const score = (lhr, category) => lhr.categories[category]?.score ?? 0;

const metricValue = (lhr, auditId) => lhr.audits[auditId]?.numericValue ?? 0;

const assertRoute = (route, lhr) => {
  const failures = [];

  for (const [category, minimum] of Object.entries(route.minimumScores)) {
    const actual = score(lhr, category);
    if (actual < minimum) {
      failures.push(
        `${category} score ${actual.toFixed(2)} is below ${minimum.toFixed(2)}`
      );
    }
  }

  for (const [auditId, maximum] of Object.entries(route.maximumMetrics)) {
    const actual = metricValue(lhr, auditId);
    if (actual > maximum) {
      failures.push(
        `${auditId} ${Math.round(actual)} exceeds ${Math.round(maximum)}`
      );
    }
  }

  return failures;
};

const auditRoute = async (route) => {
  const reportPath = path.join(REPORT_DIR, `${route.name}.json`);
  const flags = [
    `${BASE_URL}${route.path}`,
    "--quiet",
    "--output=json",
    `--output-path=${reportPath}`,
    "--only-categories=performance,accessibility,best-practices,seo",
    "--throttling-method=simulate",
    "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
  ];

  if (route.formFactor === "desktop") {
    flags.push("--preset=desktop");
  }

  await run("lighthouse", flags);
  const lhr = JSON.parse(await readFile(reportPath, "utf8"));
  const failures = assertRoute(route, lhr);

  return {
    route,
    scores: Object.fromEntries(
      Object.keys(route.minimumScores).map((category) => [
        category,
        score(lhr, category),
      ])
    ),
    metrics: Object.fromEntries(
      Object.keys(route.maximumMetrics).map((auditId) => [
        auditId,
        metricValue(lhr, auditId),
      ])
    ),
    failures,
  };
};

const main = async () => {
  await rm(REPORT_DIR, { force: true, recursive: true });
  await mkdir(REPORT_DIR, { recursive: true });

  const preview = spawn(
    "bunx",
    ["vite", "preview", "--host", HOST, "--port", String(PORT)],
    {
      stdio: "ignore",
      env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
    }
  );

  try {
    console.log(CI_RUNNER_NOTE);
    await waitForServer();
    const results = [];

    for (const route of routes) {
      results.push(await auditRoute(route));
    }

    for (const result of results) {
      const scoreText = Object.entries(result.scores)
        .map(([category, value]) => `${category}=${value.toFixed(2)}`)
        .join(", ");
      console.log(`${result.route.name}: ${scoreText}`);
    }

    const failures = results.flatMap((result) =>
      result.failures.map((failure) => `${result.route.name}: ${failure}`)
    );

    if (failures.length > 0) {
      throw new Error(
        `Lighthouse quality gate failed:\n${failures.join("\n")}`
      );
    }

    console.log("Lighthouse quality gate passed.");
  } finally {
    preview.kill("SIGTERM");
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
