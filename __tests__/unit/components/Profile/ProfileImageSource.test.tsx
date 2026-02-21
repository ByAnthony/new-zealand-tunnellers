import { render, screen } from "@testing-library/react";
import { findElementWithText } from "__tests__/unit/utils/findElementWithText";
import {
  mockImageArchives,
  mockImageAucklandLibraries,
  mockImageBook,
  mockImageFamily,
  mockImageNewspaper,
  mockImageTunneller,
} from "__tests__/unit/utils/mocks/mockTunneller";

import { ProfileImageSource } from "@/components/Profile/ProfileImageSource/ProfileImageSource";

describe("Snapshot", () => {
  test("renders the component correctly with the Auckland Library information", () => {
    const component = (
      <ProfileImageSource
        source={{
          ...mockImageTunneller,
          aucklandLibraries: mockImageAucklandLibraries,
          archives: null,
          family: null,
          newspaper: null,
          book: null,
        }}
      />
    );
    const { asFragment } = render(component);

    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the component correctly with the Archives information", () => {
    const component = (
      <ProfileImageSource
        source={{
          ...mockImageTunneller,
          aucklandLibraries: null,
          archives: mockImageArchives,
          family: null,
          newspaper: null,
          book: null,
        }}
      />
    );
    const { asFragment } = render(component);

    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the component correctly with the family information", () => {
    const component = (
      <ProfileImageSource
        source={{
          ...mockImageTunneller,
          aucklandLibraries: null,
          archives: null,
          family: mockImageFamily,
          newspaper: null,
          book: null,
        }}
      />
    );
    const { asFragment } = render(component);

    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the component correctly with the newspaper information", () => {
    const component = (
      <ProfileImageSource
        source={{
          ...mockImageTunneller,
          aucklandLibraries: null,
          archives: null,
          family: null,
          newspaper: mockImageNewspaper,
          book: null,
        }}
      />
    );
    const { asFragment } = render(component);

    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the component correctly with the book information", () => {
    const component = (
      <ProfileImageSource
        source={{
          ...mockImageTunneller,
          aucklandLibraries: null,
          archives: null,
          family: null,
          newspaper: null,
          book: mockImageBook,
        }}
      />
    );
    const { asFragment } = render(component);

    expect(asFragment()).toMatchSnapshot();
  });
});

describe("Auckland Library", () => {
  test("renders Auckland Library information correctly", () => {
    const component = (
      <ProfileImageSource
        source={{
          ...mockImageTunneller,
          aucklandLibraries: mockImageAucklandLibraries,
          archives: null,
          family: null,
          newspaper: null,
          book: null,
        }}
      />
    );
    render(component);

    const element = findElementWithText(
      "Auckland Libraries Ngā Pātaka Kōrero o Tāmaki Makaurau, Sir George Grey Special Collections:",
    );

    expect(element).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "31-B2671" })).toHaveAttribute(
      "href",
      "https://digitalnz.org/records?text=31-B2671&tab=Images#",
    );
    expect(
      screen.queryByText("Auckland War Memorial Museum, MS-93/157"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Courtesy of John Doe family"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Auckland Star")).not.toBeInTheDocument();
    expect(screen.queryByText("My Mock Title")).not.toBeInTheDocument();
  });
});

describe("Archives", () => {
  test("renders archives information correctly", () => {
    const component = (
      <ProfileImageSource
        source={{
          ...mockImageTunneller,
          aucklandLibraries: null,
          archives: mockImageArchives,
          family: null,
          newspaper: null,
          book: null,
        }}
      />
    );
    render(component);

    const element = findElementWithText(
      "Auckland War Memorial Museum, MS-93/157",
    );

    expect(element).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Auckland Libraries Ngā Pātaka Kōrero o Tāmaki Makaurau, Sir George Grey Special Collections:",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Courtesy of John Doe family"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Auckland Star")).not.toBeInTheDocument();
    expect(screen.queryByText("My Mock Title")).not.toBeInTheDocument();
  });
});

describe("Family", () => {
  test("renders family information correctly", () => {
    const component = (
      <ProfileImageSource
        source={{
          ...mockImageTunneller,
          aucklandLibraries: null,
          archives: null,
          family: mockImageFamily,
          newspaper: null,
          book: null,
        }}
      />
    );
    render(component);

    const element = findElementWithText("Courtesy of John Doe family");

    expect(element).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Auckland Libraries Ngā Pātaka Kōrero o Tāmaki Makaurau, Sir George Grey Special Collections:",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Auckland War Memorial Museum, MS-93/157"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Auckland Star")).not.toBeInTheDocument();
    expect(screen.queryByText("My Mock Title")).not.toBeInTheDocument();
  });
});

describe("Newspaper", () => {
  test("renders newspaper information correctly", () => {
    const component = (
      <ProfileImageSource
        source={{
          ...mockImageTunneller,
          aucklandLibraries: null,
          archives: null,
          family: null,
          newspaper: mockImageNewspaper,
          book: null,
        }}
      />
    );
    render(component);

    const title = findElementWithText("Auckland Star");
    const extraInfo = findElementWithText(", 12 July 1898.");

    expect(title).toBeInTheDocument();
    expect(extraInfo).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Auckland Libraries Ngā Pātaka Kōrero o Tāmaki Makaurau, Sir George Grey Special Collections:",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Auckland War Memorial Museum, MS-93/157"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Courtesy of John Doe family"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("My Mock Title")).not.toBeInTheDocument();
  });
});

describe("Book", () => {
  test("renders book information correctly", () => {
    const component = (
      <ProfileImageSource
        source={{
          ...mockImageTunneller,
          aucklandLibraries: null,
          archives: null,
          family: null,
          newspaper: null,
          book: mockImageBook,
        }}
      />
    );
    render(component);

    const author = findElementWithText("Jane Doe,");
    const title = findElementWithText("My Mock Title");
    const extraInfo = findElementWithText(
      ", Bethune, Publisher and Co., 1925, p. 89.",
    );

    expect(author).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(extraInfo).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Auckland Libraries Ngā Pātaka Kōrero o Tāmaki Makaurau, Sir George Grey Special Collections:",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Auckland War Memorial Museum, MS-93/157"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Courtesy of John Doe family"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Auckland Star")).not.toBeInTheDocument();
  });

  test("renders authors correctly", () => {
    const component = (
      <ProfileImageSource
        source={{
          ...mockImageTunneller,
          aucklandLibraries: null,
          archives: null,
          family: null,
          newspaper: null,
          book: {
            ...mockImageBook,
            authors: [
              {
                forename: "Jane",
                surname: "Doe",
              },
              {
                forename: "John",
                surname: "Doe",
              },
            ],
          },
        }}
      />
    );
    render(component);

    const authors = findElementWithText("Jane Doe and John Doe,");

    expect(authors).toBeInTheDocument();
  });

  test("does not render page when unknown", () => {
    const component = (
      <ProfileImageSource
        source={{
          ...mockImageTunneller,
          aucklandLibraries: null,
          archives: null,
          family: null,
          newspaper: null,
          book: {
            ...mockImageBook,
            page: null,
          },
        }}
      />
    );
    render(component);

    expect(screen.queryByText("p. 89")).not.toBeInTheDocument();
  });
});

test("does not render component when unknown", () => {
  const { container } = render(<ProfileImageSource source={undefined} />);

  expect(container).toBeEmptyDOMElement();
});
