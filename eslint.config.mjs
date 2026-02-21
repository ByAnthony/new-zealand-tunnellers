import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  js.configs.recommended,

  // TypeScript / TSX support (so files are actually linted)
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },

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
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // Import ordering
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
            {
              pattern: "**/*.module.{css,scss,sass}",
              group: "unknown",
              position: "after",
            },
          ],
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  // Jest globals only in tests
  {
    files: [
      "**/__tests__/**",
      "**/*.test.{js,jsx,ts,tsx}",
      "**/*.spec.{js,jsx,ts,tsx}",
      "**/jest.setup.{js,ts}",
      "**/setupTests.{js,ts}",
    ],
    languageOptions: { globals: { ...globals.jest } },
  },

  prettier,

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
