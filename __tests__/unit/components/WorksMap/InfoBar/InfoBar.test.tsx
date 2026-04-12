import { fireEvent, render, screen } from "@testing-library/react";
import { mockCave } from "__tests__/unit/utils/mocks/mockCave";
import {
  mockSubway,
  mockSubwayNoDate,
  mockSubwaySingleDate,
} from "__tests__/unit/utils/mocks/mockSubway";
import {
  mockWork,
  mockWorkSingleDate,
  mockWorkTwoCategories,
  mockWorkWithType,
} from "__tests__/unit/utils/mocks/mockWork";

import { InfoBar } from "@/components/WorksMap/InfoBar/InfoBar";
import { CATEGORY_COLORS } from "@/components/WorksMap/utils/markerIcons";

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
    test("shows Work started and Ended labels when dates are different", () => {
      render(
        <InfoBar
          work={mockWork}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Work started")).toBeInTheDocument();
      expect(screen.getByText("Ended")).toBeInTheDocument();
    });

    test("shows Work date label when start and end are the same", () => {
      render(
        <InfoBar
          work={mockWorkSingleDate}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Work date")).toBeInTheDocument();
      expect(screen.queryByText("Work started")).not.toBeInTheDocument();
      expect(screen.queryByText("Ended")).not.toBeInTheDocument();
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
      expect(screen.queryByText("Work date")).not.toBeInTheDocument();
      expect(screen.queryByText("Work started")).not.toBeInTheDocument();
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

  describe("cave card", () => {
    test("renders cave name in English", () => {
      render(
        <InfoBar
          work={null}
          cave={mockCave}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Auckland")).toBeInTheDocument();
    });

    test("renders cave type label", () => {
      render(
        <InfoBar
          work={null}
          cave={mockCave}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(
        screen.getByText("Pre-existing underground quarry"),
      ).toBeInTheDocument();
    });

    test("renders French name and type when locale is fr", () => {
      render(
        <InfoBar
          work={null}
          cave={mockCave}
          isExiting={false}
          locale="fr"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(
        screen.getByText("Carrière souterraine préexistante"),
      ).toBeInTheDocument();
    });

    test("renders coordinates", () => {
      render(
        <InfoBar
          work={null}
          cave={mockCave}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Coordinates")).toBeInTheDocument();
      expect(screen.getByText("50.281061, 2.782754")).toBeInTheDocument();
    });

    test("calls onClose when close button is clicked", () => {
      render(
        <InfoBar
          work={null}
          cave={mockCave}
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

  describe("subway card", () => {
    test("renders subway name in English", () => {
      render(
        <InfoBar
          work={null}
          subway={mockSubway}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Sewer-Glasgow")).toBeInTheDocument();
    });

    test("renders French name and type when locale is fr", () => {
      render(
        <InfoBar
          work={null}
          subway={mockSubway}
          isExiting={false}
          locale="fr"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Égout-Glasgow")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Souterrain réalisé par la 184ᵉ Compagnie de tunneliers",
        ),
      ).toBeInTheDocument();
    });

    test("renders subway type label", () => {
      render(
        <InfoBar
          work={null}
          subway={mockSubway}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(
        screen.getByText("Subway done by 184th Tunnelling Company"),
      ).toBeInTheDocument();
    });

    test("renders coordinates", () => {
      render(
        <InfoBar
          work={null}
          subway={mockSubway}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Coordinates")).toBeInTheDocument();
      expect(screen.getByText("50.287814, 2.784128")).toBeInTheDocument();
    });

    test("shows start and end date labels when dates differ", () => {
      render(
        <InfoBar
          work={null}
          subway={mockSubway}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Work started")).toBeInTheDocument();
      expect(screen.getByText("Ended")).toBeInTheDocument();
    });

    test("shows single date label when start and end are the same", () => {
      render(
        <InfoBar
          work={null}
          subway={mockSubwaySingleDate}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Work date")).toBeInTheDocument();
      expect(screen.queryByText("Work started")).not.toBeInTheDocument();
    });

    test("shows no date when subway has no date", () => {
      render(
        <InfoBar
          work={null}
          subway={mockSubwayNoDate}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.queryByText("Work date")).not.toBeInTheDocument();
      expect(screen.queryByText("Work started")).not.toBeInTheDocument();
    });

    test("calls onClose when close button is clicked", () => {
      render(
        <InfoBar
          work={null}
          subway={mockSubway}
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

  describe("card priority", () => {
    test("shows subway card when subway and cave are both set", () => {
      render(
        <InfoBar
          work={null}
          cave={mockCave}
          subway={mockSubway}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Sewer-Glasgow")).toBeInTheDocument();
      expect(screen.queryByText("Auckland")).not.toBeInTheDocument();
    });

    test("shows cave card when cave is set and subway is null", () => {
      render(
        <InfoBar
          work={null}
          cave={mockCave}
          subway={null}
          isExiting={false}
          locale="en"
          colors={colors}
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Auckland")).toBeInTheDocument();
      expect(screen.queryByText("Sewer-Glasgow")).not.toBeInTheDocument();
    });
  });
});
