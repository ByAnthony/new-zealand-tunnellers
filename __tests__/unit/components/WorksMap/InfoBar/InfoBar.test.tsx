import { fireEvent, render, screen } from "@testing-library/react";
import {
  mockWork,
  mockWorkSingleDate,
  mockWorkTwoCategories,
  mockWorkWithType,
} from "__tests__/unit/utils/mocks/mockWork";

import { InfoBar } from "@/components/WorksMap/InfoBar/InfoBar";
import { CATEGORY_COLORS } from "@/components/WorksMap/markerIcons";

const onClose = jest.fn();
const colors = CATEGORY_COLORS;

describe("InfoBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("matches the snapshot", () => {
    const { asFragment } = render(
      <InfoBar
        work={mockWork}
        isExiting={false}
        locale="en"
        colors={colors}
        onClose={onClose}
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the work name", () => {
    render(
      <InfoBar
        work={mockWork}
        isExiting={false}
        locale="en"
        colors={colors}
        onClose={onClose}
      />,
    );
    expect(screen.getByText("Corona Cave")).toBeInTheDocument();
  });

  describe("type display", () => {
    test("shows single category as a tag with dot", () => {
      render(
        <InfoBar
          work={mockWork}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Dugout")).toBeInTheDocument();
    });

    test("shows work type when present, not category", () => {
      render(
        <InfoBar
          work={mockWorkWithType}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Anti-aircraft battery")).toBeInTheDocument();
      expect(screen.queryByText("Dugout")).not.toBeInTheDocument();
    });

    test("shows two categories as tags", () => {
      render(
        <InfoBar
          work={mockWorkTwoCategories}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Machine-gun nest")).toBeInTheDocument();
      expect(screen.getByText("Dugout")).toBeInTheDocument();
    });

    test("shows French category when locale is fr", () => {
      render(
        <InfoBar
          work={mockWork}
          isExiting={false}
          locale="fr"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Abri souterrain")).toBeInTheDocument();
    });

    test("shows French type when locale is fr", () => {
      render(
        <InfoBar
          work={mockWorkWithType}
          isExiting={false}
          locale="fr"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Batterie anti-aérienne")).toBeInTheDocument();
    });
  });

  describe("date display", () => {
    test("shows Started and Ended labels when dates are different", () => {
      render(
        <InfoBar
          work={mockWork}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Started")).toBeInTheDocument();
      expect(screen.getByText("Ended")).toBeInTheDocument();
    });

    test("shows Date label when start and end are the same", () => {
      render(
        <InfoBar
          work={mockWorkSingleDate}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.queryByText("Start")).not.toBeInTheDocument();
      expect(screen.queryByText("End")).not.toBeInTheDocument();
    });

    test("shows no date labels when work has no date", () => {
      const workNoDate = {
        ...mockWork,
        work_date_start: null,
        work_date_end: null,
      };
      render(
        <InfoBar
          work={workNoDate}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.queryByText("Date")).not.toBeInTheDocument();
      expect(screen.queryByText("Start")).not.toBeInTheDocument();
    });
  });

  describe("animation", () => {
    test("applies enter class by default when not exiting", () => {
      const { container } = render(
        <InfoBar
          work={mockWork}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(container.firstChild).toHaveClass("enter");
    });

    test("applies exit class by default when exiting", () => {
      const { container } = render(
        <InfoBar
          work={mockWork}
          isExiting={true}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(container.firstChild).toHaveClass("exit");
    });

    test("applies fade-enter when animType is fade and not exiting", () => {
      const { container } = render(
        <InfoBar
          work={mockWork}
          isExiting={false}
          animType="fade"
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(container.firstChild).toHaveClass("fade-enter");
    });

    test("applies fade-exit when animType is fade and exiting", () => {
      const { container } = render(
        <InfoBar
          work={mockWork}
          isExiting={true}
          animType="fade"
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(container.firstChild).toHaveClass("fade-exit");
    });

    test("applies slide-next-enter when animType is slide-next and not exiting", () => {
      const { container } = render(
        <InfoBar
          work={mockWork}
          isExiting={false}
          animType="slide-next"
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(container.firstChild).toHaveClass("slide-next-enter");
    });

    test("applies slide-prev-enter when animType is slide-prev and not exiting", () => {
      const { container } = render(
        <InfoBar
          work={mockWork}
          isExiting={false}
          animType="slide-prev"
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(container.firstChild).toHaveClass("slide-prev-enter");
    });
  });

  describe("stack navigation", () => {
    const onNavigate = jest.fn();

    test("does not show navigation when stackTotal is 1", () => {
      render(
        <InfoBar
          work={mockWork}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
          stackTotal={1}
          stackIndex={0}
          onNavigate={onNavigate}
        />,
      );
      expect(
        screen.queryByRole("button", { name: "Previous" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Next" }),
      ).not.toBeInTheDocument();
    });

    test("shows navigation when stackTotal > 1", () => {
      render(
        <InfoBar
          work={mockWork}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
          stackTotal={4}
          stackIndex={0}
          onNavigate={onNavigate}
        />,
      );
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
      expect(
        screen.getByText(
          (_content, el) =>
            el?.tagName === "SPAN" && el.textContent === "1\u00a0/\u00a04",
        ),
      ).toBeInTheDocument();
    });

    test("shows correct current index in navigation", () => {
      render(
        <InfoBar
          work={mockWork}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
          stackTotal={4}
          stackIndex={2}
          onNavigate={onNavigate}
        />,
      );
      expect(
        screen.getByText(
          (_content, el) =>
            el?.tagName === "SPAN" && el.textContent === "3\u00a0/\u00a04",
        ),
      ).toBeInTheDocument();
    });

    test("calls onNavigate(1) when Next is clicked", () => {
      render(
        <InfoBar
          work={mockWork}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
          stackTotal={4}
          stackIndex={1}
          onNavigate={onNavigate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      expect(onNavigate).toHaveBeenCalledWith(1);
    });
  });

  test("calls onClose when close button is clicked", () => {
    render(
      <InfoBar
        work={mockWork}
        isExiting={false}
        locale="en"
        colors={colors}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
