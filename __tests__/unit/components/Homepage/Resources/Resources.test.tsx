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

  test("renders the book card title, badge and author", () => {
    render(<Resources />);
    expect(
      screen.getByRole("heading", { name: "Kiwis Dig Tunnels Too", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Book")).toBeInTheDocument();
    expect(screen.getByText("Anthony Byledbal")).toBeInTheDocument();
  });

  test("renders the map card title and badge", () => {
    render(<Resources />);
    expect(
      screen.getByRole("heading", { name: "Tunnellers\u2019 Works", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Map")).toBeInTheDocument();
  });

  test("card links point to correct paths for English locale", () => {
    mockUseLocale.mockReturnValue("en");
    render(<Resources />);
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/maps/tunnellers-works");
    expect(links[1]).toHaveAttribute("href", "/books/kiwis-dig-tunnels-too");
  });

  test("card links point to correct paths for French locale", () => {
    mockUseLocale.mockReturnValue("fr");
    render(<Resources />);
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/fr/maps/tunnellers-works");
    expect(links[1]).toHaveAttribute("href", "/fr/books/kiwis-dig-tunnels-too");
  });
});
