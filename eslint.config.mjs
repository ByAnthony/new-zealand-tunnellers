import path from "node:path";
import { fileURLToPath } from "node:url";

import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import _import from "eslint-plugin-import";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: fixupConfigRules(
      compat.extends(
        "next/core-web-vitals",
        "prettier",
        "eslint:recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:react-hooks/recommended",
      ),
    ),

    plugins: {
      import: fixupPluginRules(_import),
    },

    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },

    ignores: [
      "playwright-report/**",
      "coverage/**",
      "coverage/lcov-report/**",
      ".next/**",
      "node_modules/**",
    ],

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
            {
              pattern: "STYLES",
              group: "unknown",
              position: "after",
            },
          ],

          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },

          "newlines-between": "always",
        },
      ],
    },
  },
]);
