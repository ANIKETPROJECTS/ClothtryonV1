import { build as viteBuild } from "vite";
import { rm, cp, mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist/public");

async function buildNetlify() {
  await rm(path.resolve(rootDir, "dist"), { recursive: true, force: true });

  console.log("Building frontend for Netlify...");
  await viteBuild({
    build: {
      outDir: distDir,
    },
  });

  console.log("Copying static assets...");
  const attachedAssetsPath = path.resolve(rootDir, "attached_assets");
  if (existsSync(attachedAssetsPath)) {
    await mkdir(path.resolve(distDir, "attached_assets"), { recursive: true });
    await cp(attachedAssetsPath, path.resolve(distDir, "attached_assets"), { recursive: true });
  }

  console.log("Creating _redirects file...");
  const redirects = `/api/*  /.netlify/functions/api/:splat  200
/*  /index.html  200`;
  await writeFile(path.resolve(distDir, "_redirects"), redirects);

  console.log("Netlify build complete!");
}

buildNetlify().catch((err) => {
  console.error(err);
  process.exit(1);
});
