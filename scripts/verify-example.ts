import { spawnSync } from "node:child_process";

const result = spawnSync("tsx", ["src/cli/index.ts", "verify", "examples/tech-sharing/output/index.html"], {
  stdio: "inherit"
});

process.exit(result.status ?? 1);
