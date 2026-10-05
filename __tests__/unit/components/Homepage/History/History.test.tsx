import { fireEvent, render, screen } from "@testing-library/react";

import { History } from "@/components/HomePage/History/History";
import { mockHistory } from "@/test-utils/mocks/mockHistory";

describe("History", () => {
  beforeAll(() => {
    HTMLElement.prototype.scrollTo = jest.fn();
  });

  test("matches the snapshot", () => {
    const { asFragment } = render(<History articles={mockHistory} />);

    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the component correctly", () => {
    render(<History articles={mockHistory} />);

    const title = screen.getByRole("heading", {
      name: /History of the Company/i,
    });
    expect(title).toBeInTheDocument();

    mockHistory.forEach((article) => {
      const articleCard = screen.getByRole("link", {
        name: new RegExp(
          `Go to Chapter ${article.chapter}: ${article.title.replace(/\\/g, " ")}`,
          "i",
        ),
      });
      expect(articleCard).toBeInTheDocument();

      const articleCardDiv = articleCard.closest("div");
      expect(articleCardDiv).toHaveStyle(
        `backgroundImage: url(/images/history/${article.image})`,
      );

      const titleLine1 = screen.getByText(splitTitle(article.title)[0]);
      const titleLine2 = screen.getByText(splitTitle(article.title)[1]);
      const titleLine3 = screen.getByText(`Chapter ${article.chapter}`);
      expect(titleLine1).toBeInTheDocument();
      expect(titleLine2).toBeInTheDocument();
      expect(titleLine3).toBeInTheDocument();
    });
  });

  describe("Navigation buttons", () => {
    test("left button is disabled when isFirstCard is true", () => {
      render(<History articles={mockHistory} />);

      const leftButton = screen.getByRole("button", {
        name: /See previous chapters/i,
      });
      expect(leftButton).toBeDisabled();
    });

    test("right button is enabled when isFirstCard is true", () => {
      render(<History articles={mockHistory} />);

      const rightButton = screen.getByRole("button", {
        name: /See next chapters/i,
      });
      expect(rightButton).toBeEnabled();
    });

    test("left button is enabled after clicking right button", () => {
      render(<History articles={mockHistory} />);

      const rightButton = screen.getByRole("button", {
        name: /See next chapters/i,
      });
      fireEvent.click(rightButton);

      const leftButton = screen.getByRole("button", {
        name: /See previous chapters/i,
      });
      expect(leftButton).toBeEnabled();
    });

    test.each([1, 2, 3, mockHistory.length])(
      "right button is disabled when isLastCard is true (%i visible cards)",
      (visibleCards) => {
        render(<History articles={mockHistory} />);

        const container = screen.getByTestId("chapters-scroll");
        const cardWidth = 300;
        const gap = 25;
        const padding = 100;
        const cardStep = cardWidth + gap;
        const scrollTo = jest.fn();
        container.scrollTo = scrollTo;
        container.style.gap = `${gap}px`;
        container.style.paddingLeft = `${padding}px`;
        container.style.paddingRight = `${padding}px`;
        Object.defineProperty(container.firstElementChild, "offsetWidth", {
          value: cardWidth,
        });
        Object.defineProperty(container, "clientWidth", {
          value: visibleCards * cardStep + padding * 2,
        });
        fireEvent(window, new Event("resize"));

        const rightButton = screen.getByRole("button", {
          name: /See next chapters/i,
        });
        const lastCardIndex = mockHistory.length - visibleCards;

        for (let nextIndex = 1; nextIndex <= lastCardIndex; nextIndex++) {
          expect(rightButton).toBeEnabled();
          fireEvent.click(rightButton);
          expect(scrollTo).toHaveBeenNthCalledWith(nextIndex, {
            left: nextIndex * cardStep,
          });
        }

        expect(rightButton).toBeDisabled();
        fireEvent.click(rightButton);
        expect(scrollTo).toHaveBeenCalledTimes(lastCardIndex);
      },
    );

    test("can click on navigation buttons to show next/previous chapters", () => {
      render(<History articles={mockHistory} />);

      const chapter1 = screen.getByText("Chapter 1");
      const chapter2 = screen.getByText("Chapter 2");
      const chapter3 = screen.getByText("Chapter 3");
      const chapter4 = screen.getByText("Chapter 4");
      const chapter5 = screen.getByText("Chapter 5");
      expect(chapter1).toBeVisible();
      expect(chapter2).toBeVisible();
      expect(chapter3).toBeVisible();

      const rightButton = screen.getByRole("button", {
        name: /See next chapters/i,
      });

      fireEvent.click(rightButton);
      fireEvent.click(rightButton);
      expect(chapter3).toBeVisible();
      expect(chapter4).toBeVisible();
      expect(chapter5).toBeVisible();

      const leftButton = screen.getByRole("button", {
        name: /See previous chapters/i,
      });

      fireEvent.click(leftButton);
      expect(chapter2).toBeVisible();
      expect(chapter3).toBeVisible();
      expect(chapter4).toBeVisible();
    });
  });

  describe("Scroll through chapters", () => {
    test("can scroll through the chapter cards", () => {
      render(<History articles={mockHistory} />);

      const chapter1 = screen.getByText("Chapter 1");
      const chapter2 = screen.getByText("Chapter 2");
      const chapter3 = screen.getByText("Chapter 3");
      const chapter4 = screen.getByText("Chapter 4");
      expect(chapter1).toBeVisible();
      expect(chapter2).toBeVisible();
      expect(chapter3).toBeVisible();

      const container = screen.getByTestId("chapters-scroll");
      fireEvent.scroll(container, { target: { scrollRight: 300 } });

      expect(chapter2).toBeVisible();
      expect(chapter3).toBeVisible();
      expect(chapter4).toBeVisible();
    });
  });
});

const splitTitle = (string: string) => {
  const split = string.split("\\");
  return split;
};
