import "@testing-library/jest-dom";
import React from "react";

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
