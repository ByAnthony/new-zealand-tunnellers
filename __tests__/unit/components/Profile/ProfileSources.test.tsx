import { render, screen } from "@testing-library/react";
import { findElementWithText } from "__tests__/unit/utils/findElementWithText";
import { mockSources } from "__tests__/unit/utils/mocks/mockTunneller";

import { ProfileSources } from "@/components/Profile/ProfileSources/ProfileSources";

const component = <ProfileSources sources={mockSources} />;

test("renders the component correctly", () => {
  const { asFragment } = render(component);

  expect(asFragment()).toMatchSnapshot();
});

describe("Auckland War Memorial Museum", () => {
  test("renders Auckland War Memorial Museum information", () => {
    render(component);

    const element = findElementWithText(
      "Auckland War Memorial Museum Tāmaki Paenga Hira",
    );

    expect(element).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Online Cenotaph He Toa Taumata Rau" }),
    ).toHaveAttribute(
      "href",
      "https://www.mockurl.co.nz/online-cenotaph/B2874930",
    );
  });

  test("returns null if no Auckland War Memorial Museum information", () => {
    render(<ProfileSources sources={{ ...mockSources, awmmCenotaph: null }} />);

    const element = screen.queryByText(
      "Auckland War Memorial Museum Tāmaki Paenga Hira",
    );

    expect(element).not.toBeInTheDocument();
  });
});

describe("NZ Archives", () => {
  test("renders NZ Archives information", () => {
    render(component);

    const element = findElementWithText(
      "New Zealand Archives Te Rua Mahara o te Kāwanatanga, AABK 18805 W5530 39/0022386, ",
    );

    expect(element).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Military Personnel File" }),
    ).toHaveAttribute("href", "https://www.mockurl.co.nz/nzarchives/B2874930");
  });

  test("renders NZ Archives information list", () => {
    const mockComponent = (
      <ProfileSources
        sources={{
          ...mockSources,
          nzArchives: [
            {
              reference: "AABK 18805 W5530 39/0022386",
              url: "https://www.mockurl.co.nz/nzarchives/B2874930",
            },
            {
              reference: "AABK 18805 W5530 39/002286",
              url: "https://www.mockurl.co.nz/nzarchives/B284930",
            },
          ],
        }}
      />
    );

    render(mockComponent);

    expect(screen.getByText("Ibid.,")).toBeTruthy();
  });
});

describe("London Gazette", () => {
  test("renders London Gazette information", () => {
    render(component);

    const title = findElementWithText("London Gazette");
    const extraInfo = findElementWithText("23 May 1917, p. 1675.");

    expect(title).toBeInTheDocument();
    expect(extraInfo).toBeInTheDocument();
  });

  test("renders London Gazette information list", () => {
    const mockComponent = (
      <ProfileSources
        sources={{
          ...mockSources,
          londonGazette: [
            {
              page: "1675",
              date: "23 May 1917",
            },
            {
              page: "457",
              date: "27 September 1919",
            },
          ],
        }}
      />
    );

    render(mockComponent);

    expect(screen.getByText("Ibid.,")).toBeTruthy();
  });

  test("does not render London Gazette information if empty", () => {
    const mockComponent = (
      <ProfileSources
        sources={{
          ...mockSources,
          londonGazette: [],
        }}
      />
    );
    render(mockComponent);

    expect(screen.queryByText("London Gazette")).not.toBeInTheDocument();
  });
});

describe("Nominal Roll", () => {
  test("renders Nominal Roll book", () => {
    render(component);

    const title = findElementWithText(
      "Nominal Roll of New Zealand Expeditionary Force, 1915. New Zealand Engineers Tunnelling Company",
    );
    const extraInfo = findElementWithText(
      ", Government Printer, Wellington, 1916, 37.",
    );

    expect(title).toBeInTheDocument();
    expect(extraInfo).toBeInTheDocument();
  });

  test("renders Nominal Roll book with volume and roll", () => {
    const mockComponent = (
      <ProfileSources
        sources={{
          ...mockSources,
          nominalRoll: {
            title: "Nominal Rolls of New Zealand Expeditionary Force",
            town: "Wellington",
            publisher: "Government Printer",
            date: "1916",
            page: "37",
            volume: "Volume III",
            roll: "No.55",
          },
        }}
      />
    );

    render(mockComponent);

    const title = findElementWithText(
      "Nominal Rolls of New Zealand Expeditionary Forc",
    );
    const extraInfo = findElementWithText(
      ", Volume III, No.55, Government Printer, Wellington, 1916, 37.",
    );

    expect(title).toBeInTheDocument();
    expect(extraInfo).toBeInTheDocument();
  });
});
