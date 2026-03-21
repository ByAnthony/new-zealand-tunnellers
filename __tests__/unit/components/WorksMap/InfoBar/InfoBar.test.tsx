import { fireEvent, render, screen } from "@testing-library/react";
import {
  mockWork,
  mockWorkSingleDate,
  mockWorkTwoCategories,
  mockWorkWithType,
} from "__tests__/unit/utils/mocks/mockWork";

import { InfoBar } from "@/components/WorksMap/InfoBar/InfoBar";

const onClose = jest.fn();

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
        onClose={onClose}
      />,
    );
    expect(screen.getByText("Corona Cave")).toBeInTheDocument();
  });

  describe("type display", () => {
    test("shows single category as plain text when no type", () => {
      render(
        <InfoBar
          work={mockWork}
          isExiting={false}
          locale="en"
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Dugout")).toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });

    test("shows work type when present, not category", () => {
      render(
        <InfoBar
          work={mockWorkWithType}
          isExiting={false}
          locale="en"
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Anti-aircraft battery")).toBeInTheDocument();
      expect(screen.queryByText("Dugout")).not.toBeInTheDocument();
    });

    test("shows two categories as a bullet list", () => {
      render(
        <InfoBar
          work={mockWorkTwoCategories}
          isExiting={false}
          locale="en"
          onClose={onClose}
        />,
      );
      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();
      expect(screen.getByText("Machine-gun nest")).toBeInTheDocument();
      expect(screen.getByText("Dugout")).toBeInTheDocument();
    });

    test("shows French category when locale is fr", () => {
      render(
        <InfoBar
          work={mockWork}
          isExiting={false}
          locale="fr"
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
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Batterie anti-aérienne")).toBeInTheDocument();
    });
  });

  describe("date display", () => {
    test("shows Start and End labels when dates are different", () => {
      render(
        <InfoBar
          work={mockWork}
          isExiting={false}
          locale="en"
          onClose={onClose}
        />,
      );
      expect(screen.getByText("Start")).toBeInTheDocument();
      expect(screen.getByText("End")).toBeInTheDocument();
    });

    test("shows Date label when start and end are the same", () => {
      render(
        <InfoBar
          work={mockWorkSingleDate}
          isExiting={false}
          locale="en"
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
          onClose={onClose}
        />,
      );
      expect(screen.queryByText("Date")).not.toBeInTheDocument();
      expect(screen.queryByText("Start")).not.toBeInTheDocument();
    });
  });

  describe("animation", () => {
    test("applies enter class when not exiting", () => {
      const { container } = render(
        <InfoBar
          work={mockWork}
          isExiting={false}
          locale="en"
          onClose={onClose}
        />,
      );
      expect(container.firstChild).toHaveClass("enter");
    });

    test("applies exit class when exiting", () => {
      const { container } = render(
        <InfoBar
          work={mockWork}
          isExiting={true}
          locale="en"
          onClose={onClose}
        />,
      );
      expect(container.firstChild).toHaveClass("exit");
    });
  });

  test("calls onClose when close button is clicked", () => {
    render(
      <InfoBar
        work={mockWork}
        isExiting={false}
        locale="en"
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
