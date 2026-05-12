// Flat config — ESLint 9. Three lint targets:
//   1. Browser vanilla JS in `js/`           (no build, no modules)
//   2. Node ES modules in `scripts/`         (utility tasks)
//   3. TypeScript test + config files        (@playwright/test)
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "node_modules/",
      "playwright-report/",
      "test-results/",
      "assets/",
      "dist/",
      ".cache/",
    ],
  },

  // ----- Browser vanilla JS (js/app.js, js/data.js) -----
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        // `data.js` exposes window.PORTFOLIO and a set of `renderXxx`
        // top-level functions referenced from inline `render:` properties.
        // They are looked up by reference inside data.js, not by name from
        // other files, so we don't need to pre-declare each renderer.
        PORTFOLIO: "readonly",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // _ / _esc are intentional helper / placeholder names.
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  // ----- Node ES modules (scripts/*.mjs) -----
  {
    files: ["scripts/**/*.{js,mjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      ...js.configs.recommended.rules,
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "warn",
      "no-console": "off",
    },
  },

  // ----- TypeScript (tests/, playwright.config.ts) -----
  ...tseslint.configs.recommended.map((cfg) => ({
    ...cfg,
    files: ["tests/**/*.ts", "*.ts"],
  })),
  {
    files: ["tests/**/*.ts", "*.ts"],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
