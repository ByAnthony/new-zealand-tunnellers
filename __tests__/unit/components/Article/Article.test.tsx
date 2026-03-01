import { render, screen } from "@testing-library/react";
import { mockArticle } from "__tests__/unit/utils/mocks/mockArticle";

import { Article } from "@/components/Article/Article";

import { findElementWithText } from "../../utils/findElementWithText";

jest.useFakeTimers().setSystemTime(new Date("2023-05-04"));

describe("Article", () => {
  test("matches the snapshot", () => {
    const { asFragment } = render(<Article article={mockArticle} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the component correctly", () => {
    render(<Article article={mockArticle} />);

    const historyLink = screen.getByText("History");
    expect(historyLink).toHaveAttribute("href", "/#history");

    const titleLineOne = screen.getByText("My Awesome");
    expect(titleLineOne).toHaveClass("title-line-1");

    const titleLineTwo = screen.getByText("Article Title");
    expect(titleLineTwo).toHaveClass("title-line-2");

    expect(screen.getByText("Section Title 1")).toBeInTheDocument();
    expect(screen.getByText("Section text one")).toBeInTheDocument();

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute("alt", "Accessible alt text");
    expect(images[0]).toHaveAttribute("src", "/images/history/img-123.png");
    expect(images[1]).toHaveAttribute("alt", "Accessible alt text");
    expect(images[1]).toHaveAttribute("src", "/images/history/img-123.png");
    expect(screen.getByText("An Amazing Photo")).toBeInTheDocument();
    expect(
      screen.getByText("The French Photographer Doisneau"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Where the photo is preserved"),
    ).toBeInTheDocument();

    expect(screen.getByText("Section Title 2")).toBeInTheDocument();
    expect(screen.getByText("Section text two")).toBeInTheDocument();

    const nextButton = screen.getByRole("link", {
      name: "Go to Chapter 3: Next Chapter",
    });
    expect(nextButton).toHaveAttribute(
      "href",
      "/history/my-path-to-next-chapter",
    );
    expect(screen.getByText("Chapter 3")).toBeInTheDocument();
    expect(screen.getByText("Next Chapter")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument();
    const noteOne = screen.getByText("1.");
    expect(noteOne).toHaveAttribute("href", "#reference_1");
    expect(noteOne).toHaveAttribute("id", "footnote_1");
    const noteTwo = screen.getByText("2.");
    expect(noteTwo).toHaveAttribute("href", "#reference_2");
    expect(noteTwo).toHaveAttribute("id", "footnote_2");

    expect(
      screen.getByRole("heading", {
        name: "How to cite this page Copy to clipboard",
      }),
    ).toBeInTheDocument();
    expect(findElementWithText("My Awesome Article Title")).toBeInTheDocument();
    expect(
      screen.getByText(/history\/my-awesome-article-title/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Accessed: 4 May 2023/)).toBeInTheDocument();
  });

  test("does not render the next chapter link when null", () => {
    render(<Article article={{ ...mockArticle, next: null }} />);

    expect(
      screen.queryByRole("link", {
        name: "Go to Chapter 3: Next Chapter",
      }),
    ).toBeNull();
  });
});
