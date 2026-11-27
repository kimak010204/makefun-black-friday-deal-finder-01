// Entry program for the Black Friday deal finder.
// Copies app/ and screenshots/ from this repository into the output directory
// and writes output/dossier.json with the vendored dossier builder.
//
// Standard library only. Deterministic: same input files, same output bytes.
// Reads no clock, makes no network request, and reads no environment variable
// except MAKEFUN_OUTPUT_DIR.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const rootDir = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });
cpSync(join(rootDir, "app"), join(outputDir, "app"), { recursive: true });

const screenshotsDir = join(rootDir, "screenshots");
if (existsSync(screenshotsDir)) {
  cpSync(screenshotsDir, join(outputDir, "screenshots"), { recursive: true });
}

writeFileSync(
  join(outputDir, "dossier.json"),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
    app_path_max_bytes: 1000,
  }),
);
