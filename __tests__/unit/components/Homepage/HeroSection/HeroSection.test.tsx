import { render, screen } from "@testing-library/react";

import { HeroSection } from "@/components/HomePage/HeroSection/HeroSection";

describe("HeroSection Component", () => {
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

  test("renders a link to the history section", () => {
    render(<HeroSection />);

    const historyLink = screen.getByRole("link", {
      name: /Discover the history/i,
    });

    expect(historyLink).toHaveAttribute("href", "/#history");
  });

  test("renders a link to the tunnellers' works map", () => {
    render(<HeroSection />);

    const worksMapLink = screen.getByRole("link", {
      name: /Explore the tunnellers' works/i,
    });

    expect(worksMapLink).toHaveAttribute("href", "/history/tunnellers-works");
  });
});
