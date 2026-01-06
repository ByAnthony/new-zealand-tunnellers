import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default defineConfig([
  // Core ESLint rules
  js.configs.recommended,

  // React & Next.js rules
  {
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "react/react-in-jsx-scope": "off", // Not needed in React 19
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

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
      // Prevent console statements in production code
      "no-console": ["warn", { allow: ["warn", "error"] }],
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
