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
  watch: true,
};

/** @type {esbuild.BuildOptions} */
const build = {
  ...base,
  logLevel: "info",
  minify: true,
};

const configs = {
  watch,
  build,
};

esbuild.build(configs[process.argv[2]]).catch(() => process.exit(1));
