import { render, screen } from "@testing-library/react";

import { KiwisDigTunnelsToo } from "@/components/HomePage/KiwisDigTunnelsToo/KiwisDigTunnelsToo";

describe("KiwisDigTunnelsToo", () => {
  test("matches the snapshot", () => {
    const { asFragment } = render(<KiwisDigTunnelsToo />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the section heading", () => {
    render(<KiwisDigTunnelsToo />);
    expect(
      screen.getByRole("heading", { name: "The long story", level: 2 }),
    ).toBeInTheDocument();
  });

  test("renders the book card title, badge and author", () => {
    render(<KiwisDigTunnelsToo />);
    expect(screen.getByText("Kiwis Dig Tunnels Too")).toBeInTheDocument();
    expect(screen.getByText("Anthony Byledbal")).toBeInTheDocument();
  });

  test("renders a link to the book", () => {
    render(<KiwisDigTunnelsToo />);
    const startReadingLink = screen.getByRole("link", {
      name: /Start reading/i,
    });

    expect(startReadingLink).toHaveAttribute("href", "/kiwis-dig-tunnels-too/");
  });
});
