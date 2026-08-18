import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = resolve(projectRoot, "dist");

if (outputDir !== join(projectRoot, "dist")) {
  throw new Error("Refusing to clean an unexpected build directory.");
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const file of ["index.html", "styles.css", "script.js"]) {
  await cp(join(projectRoot, file), join(outputDir, file));
}

await cp(join(projectRoot, "assets"), join(outputDir, "assets"), {
  recursive: true,
});

console.log("Prepared Cloudflare static assets in dist/.");
