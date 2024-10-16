// @ts-check
const esbuild = require("esbuild");

/** @type {esbuild.BuildOptions} */
const base = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "out/extension.js",
  platform: "node",
  format: "cjs",
  external: ["vscode"],
};

/** @type {esbuild.BuildOptions} */
const watch = {
  ...base,
  logLevel: "debug",
  sourcemap: true,
};

/** @type {esbuild.BuildOptions} */
const build = {
  ...base,
  logLevel: "info",
  minify: true,
};

async function main() {
  if (process.argv[2] === "watch") {
    let ctx = await esbuild.context(watch);
    ctx.watch();
  } else if (process.argv[2] === "build") {
    await esbuild.build(build);
  }
}

main();
