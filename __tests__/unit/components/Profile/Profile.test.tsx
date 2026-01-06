import { render, screen } from "@testing-library/react";

import { Profile } from "@/components/Profile/Profile";
import { findElementWithText } from "__tests__/unit/utils/findElementWithText";
import { mockTunnellerProfile } from "__tests__/unit/utils/mocks/mockTunneller";

jest.useFakeTimers().setSystemTime(new Date("2023-05-04"));

describe("Profile", () => {
  test("matches the snapshot", () => {
    const { asFragment } = render(<Profile tunneller={mockTunnellerProfile} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the component correctly", () => {
    render(<Profile tunneller={mockTunnellerProfile} />);

    const tunnellersLink = screen.getByText("Tunnellers");
    expect(tunnellersLink).toHaveAttribute("href", "/tunnellers");

    const titleLineOne = screen.getByText("John");
    expect(titleLineOne).toHaveClass("forename");
    const titleLineTwo = screen.getByText("Smith");
    expect(titleLineTwo).toHaveClass("surname");
    const titleLineThree = screen.getByText("1886-1966");
    expect(titleLineThree).toHaveClass("title-line-3");

    const images = screen.getAllByRole("img");
    expect(images[0]).toHaveAttribute("alt", "Portrait of John Smith");
    expect(images[0]).toHaveAttribute(
      "src",
      "/images/roll/tunnellers/1/1234.jpg",
    );

    // Summary
    expect(screen.getByText("Unit")).toBeInTheDocument();
    expect(screen.getByText(/Main Body/)).toBeInTheDocument();

    expect(screen.getByText(/(Section No.2)/)).toBeInTheDocument();

    expect(screen.getByText("Rank")).toBeInTheDocument();
    expect(screen.getByText("Sapper")).toBeInTheDocument();

    expect(screen.getByText("Serial")).toBeInTheDocument();
    expect(screen.getByText("1/1000")).toBeInTheDocument();

    // About
    expect(screen.getByRole("heading", { name: "About" })).toBeInTheDocument();

    expect(screen.getByText("Born in New Zealand")).toBeInTheDocument();
    expect(screen.getByText("18 December 1886")).toBeInTheDocument();

    expect(screen.getByText("Parents")).toBeInTheDocument();
    expect(screen.getByText("Mother")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Father")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();

    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Occupation")).toBeInTheDocument();
    expect(screen.getByText("Goldminer")).toBeInTheDocument();
    expect(screen.getByText("Employer")).toBeInTheDocument();
    expect(screen.getByText("Goldmining Company")).toBeInTheDocument();

    // Army Experience
    expect(
      screen.getByRole("heading", { name: "Army Experience" }),
    ).toBeInTheDocument();
    expect(screen.getByText("NZ Infantry")).toBeInTheDocument();
    expect(screen.getByText("12 months in New Zealand")).toBeInTheDocument();

    const timeline = screen.getByRole("link", {
      name: "Open the World War I timeline",
    });
    expect(timeline).toHaveAttribute("href", "/tunnellers/1/wwi-timeline");
    expect(screen.getByText("World War I (1914-1918)")).toBeInTheDocument();
    expect(screen.getByText("New Zealand Tunnellers")).toBeInTheDocument();

    expect(images[1]).toHaveAttribute("alt", "British War Medal ribbon");
    expect(images[1]).toHaveAttribute(
      "src",
      "/images/roll/medals/british-war-medal.png",
    );
    expect(screen.getByText("British War Medal")).toBeInTheDocument();

    expect(images[2]).toHaveAttribute("alt", "Victory Medal ribbon");
    expect(images[2]).toHaveAttribute(
      "src",
      "/images/roll/medals/victory-medal.png",
    );
    expect(screen.getByText("Victory Medal")).toBeInTheDocument();

    // Death details
    expect(screen.getByText("Died at the age of 89")).toBeInTheDocument();
    expect(screen.getByText("13 October 1926")).toBeInTheDocument();

    // Sources
    expect(
      screen.getByRole("heading", { name: "Sources" }),
    ).toBeInTheDocument();

    expect(
      findElementWithText("Auckland War Memorial Museum Tāmaki Paenga Hira:"),
    ).toBeInTheDocument();
    const awmm = screen.getByRole("link", {
      name: "Online Cenotaph He Toa Taumata Rau",
    });
    expect(awmm).toHaveAttribute(
      "href",
      "https://www.mockurl.co.nz/online-cenotaph/B2874930",
    );

    expect(
      screen.getByText(
        /New Zealand Archives Te Rua Mahara o te Kāwanatanga, AABK 18805 W5530 39\/0022386,/,
      ),
    ).toBeInTheDocument();
    const nzarchives = screen.getByRole("link", {
      name: "Military Personnel File",
    });
    expect(nzarchives).toHaveAttribute(
      "href",
      "https://www.mockurl.co.nz/nzarchives/B2874930",
    );

    expect(screen.getByText(/London Gazette/)).toBeInTheDocument();
    expect(screen.getByText("23 May 1917, p. 1675.")).toBeInTheDocument();

    expect(
      screen.getByText(
        /Nominal Roll of New Zealand Expeditionary Force, 1915. New Zealand Engineers Tunnelling Company/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(", Government Printer, Wellington, 1916, 37."),
    ).toBeInTheDocument();

    // Image source
    expect(
      screen.getByRole("heading", { name: "Photograph" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Auckland Libraries Ngā Pātaka Kōrero o Tāmaki Makaurau, Sir George Grey Special Collections:/,
      ),
    ).toBeInTheDocument();
    const imageSource = screen.getByRole("link", {
      name: "31-B2671",
    });
    expect(imageSource).toHaveAttribute(
      "href",
      "https://digitalnz.org/records?text=31-B2671&tab=Images#",
    );

    // How to cite
    expect(
      screen.getByRole("heading", {
        name: "How to cite this page Copy to clipboard",
      }),
    ).toBeInTheDocument();

    expect(findElementWithText("“John Smith (1886-1966)“")).toBeInTheDocument();
    expect(screen.getByText(/Accessed: 4 May 2023/)).toBeInTheDocument();
    expect(
      screen.getByText(/URL: www.nztunnellers.com\/tunnellers\/1/),
    ).toBeInTheDocument();
  });
});
