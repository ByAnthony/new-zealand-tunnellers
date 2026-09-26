import { fireEvent, render, screen } from "@testing-library/react";

import { KiwisDigTunnelsToo } from "@/components/HomePage/KiwisDigTunnelsToo/KiwisDigTunnelsToo";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("KiwisDigTunnelsToo", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

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

  test("navigates to the book when the start reading button is clicked", () => {
    render(<KiwisDigTunnelsToo />);
    const startReadingButton = screen.getByRole("button", {
      name: /Start reading/i,
    });

    fireEvent.click(startReadingButton);

    expect(mockPush).toHaveBeenCalledWith("/kiwis-dig-tunnels-too/");
  });
});
