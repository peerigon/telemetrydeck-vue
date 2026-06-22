import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const cacheDir = mkdtempSync(join(tmpdir(), "telemetrydeck-vue-npm-cache-"));
let output;

try {
  output = execFileSync(
    "npm",
    ["pack", "--dry-run", "--ignore-scripts", "--json", "--cache", cacheDir],
    { encoding: "utf8" },
  );
} finally {
  rmSync(cacheDir, { recursive: true, force: true });
}

const [packResult] = JSON.parse(output);
const packedFiles = new Set(packResult.files.map((file) => file.path));
const requiredFiles = [
  "dist/index.mjs",
  "dist/index.cjs",
  "dist/types/index.d.ts",
];
const missingFiles = requiredFiles.filter((file) => !packedFiles.has(file));

if (missingFiles.length > 0) {
  console.error(
    `Missing required files from package tarball: ${missingFiles.join(", ")}`,
  );
  process.exit(1);
}

console.log(
  `Package tarball includes required files: ${requiredFiles.join(", ")}`,
);
