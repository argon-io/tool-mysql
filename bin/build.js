import path from "path";
import { fileURLToPath } from "url";
import { build } from "esbuild";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  await build({
    bundle: true,
    format: "esm",
    minify: true,
    external: ["__STATIC_CONTENT_MANIFEST"],
    conditions: ["worker", "browser"],
    entryPoints: [path.join(__dirname, "..", "src", "index.ts")],
    outdir: path.join(__dirname, "..", "dist"),
    platform: "node",
    plugins: [
      NodeModulesPolyfillPlugin(),
    ],
  });
} catch (e) {
  console.error(e);
  process.exitCode = 1;
}