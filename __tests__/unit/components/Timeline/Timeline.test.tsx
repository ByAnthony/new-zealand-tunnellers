import { render, screen } from "@testing-library/react";
import { findElementWithText } from "__tests__/unit/utils/findElementWithText";
import { mockTunnellerProfile } from "__tests__/unit/utils/mocks/mockTunneller";

import { Timeline } from "@/components/Timeline/Timeline";

jest.useFakeTimers().setSystemTime(new Date("2023-05-04"));

describe("Timeline", () => {
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
    expect(tunnellerLink).toHaveAttribute("href", "/tunnellers/1");

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
        /URL: www.nztunnellers.com\/tunnellers\/1\/wwi-timeline/,
      ),
    ).toBeInTheDocument();
  });
});
