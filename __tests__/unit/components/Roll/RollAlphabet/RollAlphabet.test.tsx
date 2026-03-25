import { act, fireEvent, render, screen } from "@testing-library/react";
import { mockTunnellers } from "__tests__/unit/utils/mocks/mockTunnellers";

import { RollAlphabet } from "@/components/Roll/RollAlphabet/RollAlphabet";
import { Tunneller } from "@/types/tunnellers";

const createTunnellers = (count: number): [string, Tunneller[]][] => {
  const tunnellers: Tunneller[] = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    slug: "test-tunneller--1_234",
    name: { forename: "John", surname: `Doe${i + 1}` },
    birthYear: "1886",
    deathYear: "1952",
    search: { fullName: `John Doe${i + 1}` },
    detachment: "Main Body",
    detachmentEn: "Main Body",
    detachmentId: 1,
    rank: "Sapper",
    rankEn: "Sapper",
    rankId: 1,
    attachedCorps: null,
    corpsEn: null,
    corpsId: null,
  }));
  return [["D", tunnellers]];
};

describe("RollAlphabet", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders tunnellers grouped by letter heading", () => {
    render(
      <RollAlphabet
        tunnellers={Object.entries(mockTunnellers)}
        currentPage={1}
        onPageChange={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Letter B" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Sapper Emmett Brown Main Body ?-1935 →",
      }),
    ).toBeInTheDocument();
  });

  describe("Pagination buttons", () => {
    test("previous page button is disabled on the first page", () => {
      render(
        <RollAlphabet
          tunnellers={Object.entries(mockTunnellers)}
          currentPage={1}
          onPageChange={jest.fn()}
        />,
      );

      expect(
        screen.getByRole("button", { name: "Go to previous page" }),
      ).toBeDisabled();
    });

    test("next page button is disabled on the last page", () => {
      render(
        <RollAlphabet
          tunnellers={Object.entries(mockTunnellers)}
          currentPage={1}
          onPageChange={jest.fn()}
        />,
      );

      expect(
        screen.getByRole("button", { name: "Go to next page" }),
      ).toBeDisabled();
    });

    test("clicking next page calls onPageChange with the next page number and scrolls to top", () => {
      const onPageChange = jest.fn();
      render(
        <RollAlphabet
          tunnellers={createTunnellers(30)}
          currentPage={1}
          onPageChange={onPageChange}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
      act(() => jest.runAllTimers());

      expect(onPageChange).toHaveBeenCalledWith(2);
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    test("clicking previous page calls onPageChange with the previous page number and scrolls to top", () => {
      const onPageChange = jest.fn();
      render(
        <RollAlphabet
          tunnellers={createTunnellers(30)}
          currentPage={2}
          onPageChange={onPageChange}
        />,
      );

      fireEvent.click(
        screen.getByRole("button", { name: "Go to previous page" }),
      );
      act(() => jest.runAllTimers());

      expect(onPageChange).toHaveBeenCalledWith(1);
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    test("clicking a numbered page button calls onPageChange with that page number and scrolls to top", () => {
      const onPageChange = jest.fn();
      render(
        <RollAlphabet
          tunnellers={createTunnellers(51)}
          currentPage={1}
          onPageChange={onPageChange}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));
      act(() => jest.runAllTimers());

      expect(onPageChange).toHaveBeenCalledWith(2);
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    test("current page button is disabled", () => {
      render(
        <RollAlphabet
          tunnellers={createTunnellers(51)}
          currentPage={2}
          onPageChange={jest.fn()}
        />,
      );

      expect(
        screen.getByRole("button", { name: "Go to page 2" }),
      ).toBeDisabled();
    });
  });

  describe("Pagination ellipsis", () => {
    test("shows all page buttons without ellipsis when total pages is 6 or fewer", () => {
      render(
        <RollAlphabet
          tunnellers={createTunnellers(150)}
          currentPage={1}
          onPageChange={jest.fn()}
        />,
      );

      expect(
        screen.getByRole("button", { name: "Go to page 1" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Go to page 6" }),
      ).toBeInTheDocument();
      expect(screen.queryByText("...")).not.toBeInTheDocument();
    });

    test("shows ellipsis when total pages exceeds 6", () => {
      render(
        <RollAlphabet
          tunnellers={createTunnellers(175)}
          currentPage={1}
          onPageChange={jest.fn()}
        />,
      );

      expect(screen.getByText("...")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Go to page 7" }),
      ).toBeInTheDocument();
    });

    test("shows ellipsis on both sides when current page is in the middle", () => {
      render(
        <RollAlphabet
          tunnellers={createTunnellers(200)}
          currentPage={4}
          onPageChange={jest.fn()}
        />,
      );

      expect(screen.getAllByText("...")).toHaveLength(2);
    });

    test("shows only trailing ellipsis when on an early page", () => {
      render(
        <RollAlphabet
          tunnellers={createTunnellers(200)}
          currentPage={1}
          onPageChange={jest.fn()}
        />,
      );

      expect(screen.getAllByText("...")).toHaveLength(1);
    });

    test("shows only leading ellipsis when on a late page", () => {
      render(
        <RollAlphabet
          tunnellers={createTunnellers(200)}
          currentPage={7}
          onPageChange={jest.fn()}
        />,
      );

      expect(screen.getAllByText("...")).toHaveLength(1);
    });
  });
});
