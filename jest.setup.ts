import "@testing-library/jest-dom";
import React from "react";

// Mock next-intl so useTranslations returns actual English strings in tests
jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const messages = require("./messages/en.json");
    const nsMessages =
      (messages as Record<string, Record<string, string>>)[namespace] || {};
    return (key: string, values?: Record<string, string | number>) => {
      let text = nsMessages[key] ?? `${namespace}.${key}`;
      if (values) {
        Object.entries(values).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    };
  },
  useLocale: () => "en",
}));

// Mock Next.js Image component to ensure consistent snapshots across environments
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // Use object destructuring with rest syntax to omit `priority` and `quality`
    // eslint-disable-next-line no-unused-vars
    const { priority, quality, ...imgProps } = props;

    return React.createElement("img", imgProps);
  },
}));
