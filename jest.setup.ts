import "@testing-library/jest-dom";
import React from "react";

// Mock Next.js Image component to ensure consistent snapshots across environments
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const imgProps = { ...props };
    delete imgProps.priority;
    delete imgProps.quality;

    return React.createElement("img", imgProps);
  },
}));
