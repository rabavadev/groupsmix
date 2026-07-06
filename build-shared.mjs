// Build script to compile shared TypeScript to JavaScript for the leaderboard Worker
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolve paths relative to this script's location (repo root)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tsconfigPath = path.join(__dirname, "apps/leaderboard/tsconfig.json");

console.log("Compiling shared TypeScript to JavaScript for leaderboard Worker...");

try {
  // Resolve tsc from the leaderboard workspace's node_modules
  const tscBin = path.join(__dirname, "apps/leaderboard/node_modules/.bin/tsc");
  execSync(`"${tscBin}" --project "${tsconfigPath}"`, {
    cwd: __dirname,
    stdio: "inherit"
  });
  console.log("✓ All shared TypeScript files compiled successfully");
  console.log("Build complete");
} catch (error) {
  console.error("✗ TypeScript compilation failed:", error.message);
  process.exit(1);
}
