import "@testing-library/jest-dom";
import React from "react";

import { makeMessagesTranslator } from "./test-utils/getMessageFromMessages";

jest.mock("next-intl", () => ({
  useTranslations: jest.fn(makeMessagesTranslator("en")),
  useLocale: jest.fn(() => "en"),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) =>
    React.createElement(
      "a",
      {
        ...props,
        href:
          typeof href === "string"
            ? href
            : `${href.pathname ?? ""}${href.query ? `?${new URLSearchParams(href.query).toString()}` : ""}${href.hash ?? ""}`,
      },
      children,
    ),
}));

// Mock Next.js Image component to ensure consistent snapshots across environments
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { priority: _priority, quality: _quality, ...imgProps } = props;

    return React.createElement("img", imgProps);
  },
}));
