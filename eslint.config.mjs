import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import globals from "globals";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/out/**",
      "**/public/**",
      "**/playwright-report/**",
      "**/coverage/**",
      "**/coverage/lcov-report/**",
      "**/*.min.js",
      "**/*.bundle.js",
    ],
  },
  // Jest globals for tests only
  {
    files: ["**/__tests__/**"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  // Core ESLint (flat)
  js.configs.recommended,
  {
    extends: fixupConfigRules(
      compat.extends(
        "next/core-web-vitals",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:react-hooks/recommended",
      ),
    ),
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
  prettier,
]);
