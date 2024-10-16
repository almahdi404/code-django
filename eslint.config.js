// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const globals = require("globals");

module.exports = tseslint.config(
  {
    ignores: ["**/out/*", "**/dist/*", "**/build/*"],
  },
  eslint.configs.recommended,
  {
    files: ["**/*.ts"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.eslintRecommended.rules,
      ...tseslint.configs.recommended.at(-1)?.rules,
      ...tseslint.configs.recommendedTypeChecked.at(-1)?.rules,
      "@typescript-eslint/naming-convention": "warn",
      "no-throw-literal": "warn",
      eqeqeq: "warn",
    },
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
        project: true,
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ["*.config.js", "scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.commonjs,
        ...globals.node,
      },
    },
  }
);
