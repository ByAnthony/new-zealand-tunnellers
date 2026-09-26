import { fireEvent, render, screen } from "@testing-library/react";

import { HeroSection } from "@/components/HomePage/HeroSection/HeroSection";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("HeroSection Component", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  test("matches snapshot", () => {
    const { asFragment } = render(<HeroSection />);

    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the full-screen intro without an svg mask", () => {
    render(<HeroSection />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /The Kiwis who fought underground/,
    );
  });

  test("navigates to the history section", () => {
    render(<HeroSection />);

    const historyButton = screen.getByRole("button", {
      name: /Discover the history/i,
    });

    fireEvent.click(historyButton);

    expect(mockPush).toHaveBeenCalledWith("/#history");
  });

  test("navigates to the tunnellers' works map", () => {
    render(<HeroSection />);

    const worksMapButton = screen.getByRole("button", {
      name: /Explore the tunnellers' works/i,
    });

    fireEvent.click(worksMapButton);

    expect(mockPush).toHaveBeenCalledWith("/history/tunnellers-works");
  });
});
