import { render, screen } from "@testing-library/react";

import { Timeline } from "@/components/Timeline/Timeline";
import { findElementWithText } from "@/test-utils/findElementWithText";
import { mockTunnellerProfile } from "@/test-utils/mocks/mockTunneller";

jest.useFakeTimers().setSystemTime(new Date("2023-05-04"));

describe("Timeline", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test("matches the snapshot", () => {
    const { asFragment } = render(
      <Timeline tunneller={mockTunnellerProfile} />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the component correctly", () => {
    render(<Timeline tunneller={mockTunnellerProfile} />);

    const tunnellersLink = screen.getByText("Tunnellers");
    expect(tunnellersLink).toHaveAttribute("href", "/tunnellers");
    const tunnellerLink = screen.getByText("John Smith");
    expect(tunnellerLink).toHaveAttribute(
      "href",
      "/tunnellers/harry-corrin--4_1415",
    );

    const titleLineOne = screen.getByText("World War I");
    expect(titleLineOne).toHaveClass("title-line-1");
    const titleLineTwo = screen.getByText("Timeline");
    expect(titleLineTwo).toHaveClass("title-line-2");

    // Timeline
    expect(
      screen.getByRole("heading", { name: "Year 1915" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Year 1916" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Year 1917" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Year 1918" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Year 1919" }),
    ).toBeInTheDocument();

    // How to cite
    expect(
      screen.getByRole("heading", {
        name: "How to cite this page Copy to clipboard",
      }),
    ).toBeInTheDocument();

    expect(
      findElementWithText("World War I Timeline of John Smith"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Accessed: 4 May 2023/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /URL: www.nztunnellers.com\/tunnellers\/harry-corrin--4_1415\/wwi-timeline/,
      ),
    ).toBeInTheDocument();
  });

  describe("back link", () => {
    test("links to /tunnellers when no return URL is stored", () => {
      render(<Timeline tunneller={mockTunnellerProfile} />);
      expect(screen.getByText("Tunnellers")).toHaveAttribute(
        "href",
        "/tunnellers",
      );
    });

    test("links to stored return URL when available", () => {
      sessionStorage.setItem("roll:view", "list");
      localStorage.setItem(
        "tunnellers:return",
        "/tunnellers?detachment=main-body&page=2",
      );
      render(<Timeline tunneller={mockTunnellerProfile} />);
      expect(screen.getByText("Tunnellers")).toHaveAttribute(
        "href",
        "/tunnellers?detachment=main-body&page=2",
      );
    });

    test("links to map view when it is the stored roll view", () => {
      sessionStorage.setItem("roll:view", "map");

      render(<Timeline tunneller={mockTunnellerProfile} />);

      expect(screen.getByText("Tunnellers")).toHaveAttribute(
        "href",
        "/tunnellers?view=map",
      );
    });
  });
});
