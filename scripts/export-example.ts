import { spawnSync } from "node:child_process";

const result = spawnSync("tsx", ["src/cli/index.ts", "export", "examples/tech-sharing/output/index.html", "--format", "pdf"], {
  stdio: "inherit"
});

process.exit(result.status ?? 1);
