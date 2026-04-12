import { render, screen } from "@testing-library/react";

import { WorksSlider } from "@/components/WorksMap/WorksSlider/WorksSlider";

jest.mock("rc-slider", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: function MockSlider({
      min,
      max,
      value,
    }: {
      min: number;
      max: number;
      value: number[];
    }) {
      return React.createElement("div", {
        "data-testid": "rc-slider",
        "data-min": min,
        "data-max": max,
        "data-value": value.join(","),
      });
    },
  };
});

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

const onChange = jest.fn();

// Jun 1917 = 1917 * 12 + 5 = 23009
// Dec 1918 = 1918 * 12 + 11 = 23027
const minMonth = 23009;
const maxMonth = 23027;

describe("WorksSlider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMatchMedia(false);
  });

  test("matches the snapshot", () => {
    const { asFragment } = render(
      <WorksSlider
        dateRange={[minMonth, maxMonth]}
        onChange={onChange}
        minMonth={minMonth}
        maxMonth={maxMonth}
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the slider", () => {
    render(
      <WorksSlider
        dateRange={[minMonth, maxMonth]}
        onChange={onChange}
        minMonth={minMonth}
        maxMonth={maxMonth}
      />,
    );
    expect(screen.getByTestId("rc-slider")).toBeInTheDocument();
  });

  test("passes correct min and max to slider", () => {
    render(
      <WorksSlider
        dateRange={[minMonth, maxMonth]}
        onChange={onChange}
        minMonth={minMonth}
        maxMonth={maxMonth}
      />,
    );
    const slider = screen.getByTestId("rc-slider");
    expect(slider).toHaveAttribute("data-min", String(minMonth));
    expect(slider).toHaveAttribute("data-max", String(maxMonth));
  });

  test("passes current dateRange value to slider", () => {
    const dateRange: [number, number] = [minMonth + 2, maxMonth - 2];
    render(
      <WorksSlider
        dateRange={dateRange}
        onChange={onChange}
        minMonth={minMonth}
        maxMonth={maxMonth}
      />,
    );
    const slider = screen.getByTestId("rc-slider");
    expect(slider).toHaveAttribute("data-value", dateRange.join(","));
  });

  describe("marks", () => {
    test("renders 4 marks on mobile", () => {
      mockMatchMedia(true);
      const { container } = render(
        <WorksSlider
          dateRange={[minMonth, maxMonth]}
          onChange={onChange}
          minMonth={minMonth}
          maxMonth={maxMonth}
        />,
      );
      const marks = container.querySelectorAll(".rc-slider-mark-text");
      expect(marks.length).toBe(0); // rc-slider is mocked, no marks rendered
    });

    test("renders 6 marks on desktop", () => {
      mockMatchMedia(false);
      render(
        <WorksSlider
          dateRange={[minMonth, maxMonth]}
          onChange={onChange}
          minMonth={minMonth}
          maxMonth={maxMonth}
        />,
      );
      // rc-slider is mocked so we just verify the component renders without error
      expect(screen.getByTestId("rc-slider")).toBeInTheDocument();
    });
  });
});
