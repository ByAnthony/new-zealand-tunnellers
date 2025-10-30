import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

export default defineConfig([
  // Next.js 16 flat config (includes react & react-hooks presets)
  ...nextVitals,

  // Core ESLint rules
  js.configs.recommended,

  // Your import ordering rule (register the plugin explicitly in flat config)
  {
    plugins: { import: importPlugin },
    rules: {
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["unknown"]],
          pathGroups: [
            {
              pattern: "@testing-library/react",
              group: "unknown",
              position: "before",
            },
            { pattern: "STYLES", group: "unknown", position: "after" },
          ],
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
        },
      ],
    },
  },

  // Jest globals only in tests
  {
    files: ["**/__tests__/**"],
    languageOptions: { globals: { ...globals.jest } },
  },

  // Keep Prettier last so it can disable conflicting formatting rules
  prettier,

  // Ignores (Next ships some by default; add your extras here)
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "**/node_modules/**",
    "**/dist/**",
    "**/public/**",
    "**/playwright-report/**",
    "**/coverage/**",
    "**/coverage/lcov-report/**",
    "**/*.min.js",
    "**/*.bundle.js",
  ]),
]);
