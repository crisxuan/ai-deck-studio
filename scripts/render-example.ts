import { spawnSync } from "node:child_process";

const result = spawnSync("tsx", ["src/cli/index.ts", "render", "examples/tech-sharing/deck.json"], {
  stdio: "inherit"
});

process.exit(result.status ?? 1);
