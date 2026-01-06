import "@testing-library/jest-dom";
import React from "react";

// Mock Next.js Image component to ensure consistent snapshots across environments
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // Filter out Next.js specific props that don't exist on img elements
    const { priority, quality, ...imgProps } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement("img", imgProps);
  },
}));
