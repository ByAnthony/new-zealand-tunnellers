import { act, render, screen } from "@testing-library/react";

import { Tunnellers } from "@/components/HomePage/Tunnellers/Tunnellers";
import * as useWindowDimensionsHook from "@/utils/helpers/useWindowDimensions";

jest.mock("@/utils/helpers/useWindowDimensions");

describe("Tunnellers Component", () => {
  const renderWithMockedDimensions = (width: number, height: number) => {
    (useWindowDimensionsHook.useWindowDimensions as jest.Mock).mockReturnValue({
      width,
      height,
    });

    return render(<Tunnellers />);
  };

  beforeEach(() => {
    (useWindowDimensionsHook.useWindowDimensions as jest.Mock).mockReturnValue({
      width: 1024,
      height: 768,
    });
  });

  test("matches snapshot for mobile viewport", async () => {
    const { asFragment } = renderWithMockedDimensions(500, 800);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    expect(asFragment()).toMatchSnapshot();
  });

  test("matches snapshot for tablet/desktop viewports", async () => {
    const { asFragment } = renderWithMockedDimensions(600, 800);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    expect(asFragment()).toMatchSnapshot();
  });

  test("renders link to all Tunnellers page", () => {
    render(<Tunnellers />);

    const tunnellersLink = screen.getByRole("link", {
      name: "Discover The New Zealand Tunnellers",
    });

    expect(tunnellersLink).toHaveAttribute("href", "/tunnellers/");
  });

  test("renders SVG with text for width <= 512", () => {
    const { container } = renderWithMockedDimensions(500, 800);

    const svgElement = container.querySelector("svg");
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute("viewBox", "0 0 100 125");

    const textElement = container.querySelector("text");
    expect(textElement).toBeInTheDocument();

    const tspanElements = container.querySelectorAll("tspan");
    expect(tspanElements.length).toBe(7);
    expect(tspanElements[0].textContent).toBe("The Kiwis");
    expect(tspanElements[1].textContent).toBe("who");
    expect(tspanElements[2].textContent).toBe("fought");
    expect(tspanElements[3].textContent).toBe("beneath");
    expect(tspanElements[4].textContent).toBe("the no");
    expect(tspanElements[5].textContent).toBe("man’s");
    expect(tspanElements[6].textContent).toBe("land");
  });

  test("renders SVG with text for width > 512", () => {
    const { container } = renderWithMockedDimensions(600, 800);

    const svgElement = container.querySelector("svg");
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute("viewBox", "0 0 100 60");

    const textElement = container.querySelector("text");
    expect(textElement).toBeInTheDocument();

    const tspanElements = container.querySelectorAll("tspan");
    expect(tspanElements.length).toBe(4);
    expect(tspanElements[0].textContent).toBe("The Kiwis");
    expect(tspanElements[1].textContent).toBe("who fought");
    expect(tspanElements[2].textContent).toBe("beneath the");
    expect(tspanElements[3].textContent).toBe("no man’s land");
  });
});
