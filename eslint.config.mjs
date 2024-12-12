import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginAstro from 'eslint-plugin-astro';


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.node }},
  ...eslintPluginAstro.configs.recommended,
  ...tseslint.configs.recommended,
];