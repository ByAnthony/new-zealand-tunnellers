import { render, screen } from "@testing-library/react";

import { Resources } from "@/components/HomePage/Resources/Resources";

const mockUseLocale = jest.requireMock("next-intl").useLocale;

describe("Resources", () => {
  test("matches the snapshot", () => {
    const { asFragment } = render(<Resources />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the section heading", () => {
    render(<Resources />);
    expect(
      screen.getByRole("heading", { name: "Resources to Explore", level: 2 }),
    ).toBeInTheDocument();
  });

  test("renders the card title, badge and author", () => {
    render(<Resources />);
    expect(
      screen.getByRole("heading", { name: "Kiwis Dig Tunnels Too", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Book")).toBeInTheDocument();
    expect(screen.getByText("Anthony Byledbal")).toBeInTheDocument();
  });

  test("card link points to the correct path for English locale", () => {
    mockUseLocale.mockReturnValue("en");
    render(<Resources />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/books/kiwis-dig-tunnels-too",
    );
  });

  test("card link points to the correct path for French locale", () => {
    mockUseLocale.mockReturnValue("fr");
    render(<Resources />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/fr/books/kiwis-dig-tunnels-too",
    );
  });
});
