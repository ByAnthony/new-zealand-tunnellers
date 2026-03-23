import { render, screen, fireEvent } from "@testing-library/react";

import "@testing-library/jest-dom";
import { type Dialog as DialogType } from "@/components/Dialog/Dialog";

jest.mock("react", () => jest.requireActual("react"));

describe("Dialog", () => {
  const defaultProps = {
    id: "test-dialog",
    isOpen: true,
    onClose: jest.fn(),
    title: "Test Dialog",
    totalFiltered: 5,
    total: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("is supported", () => {
    let Dialog: typeof DialogType;

    beforeEach(() => {
      jest.isolateModules(() => {
        ({ Dialog } = jest.requireActual(
          "../../../../components/Dialog/Dialog",
        ));
      });
    });

    test("should render correctly with content", () => {
      const { asFragment } = render(
        <Dialog {...defaultProps}>
          <div>Content</div>
        </Dialog>,
      );

      expect(asFragment()).toMatchSnapshot();
    });

    test("renders the dialog with the correct title", () => {
      render(
        <Dialog {...defaultProps}>
          <div>Dialog Content</div>
        </Dialog>,
      );
      expect(screen.getByText("Test Dialog")).toBeInTheDocument();
    });

    test("renders the children content", () => {
      render(
        <Dialog {...defaultProps}>
          <div>Dialog Content</div>
        </Dialog>,
      );
      expect(screen.getByText("Dialog Content")).toBeInTheDocument();
    });

    test("calls onClose when the close button is clicked", () => {
      render(
        <Dialog {...defaultProps}>
          <div>Dialog Content</div>
        </Dialog>,
      );
      const closeButton = screen.getByText("Done");
      fireEvent.click(closeButton);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    test("renders the footer with the correct totalFiltered and total values", () => {
      render(
        <Dialog {...defaultProps} isFooterEnabled={true}>
          <div>Dialog Content</div>
        </Dialog>,
      );
      expect(screen.getByText("5/10")).toBeInTheDocument();
    });

    test("calls handleResetFilters when the reset button is clicked", () => {
      const handleResetFilters = jest.fn();
      render(
        <Dialog
          {...defaultProps}
          isFooterEnabled={true}
          handleResetFilters={handleResetFilters}
          hasActiveFilters={true}
        >
          <div>Dialog Content</div>
        </Dialog>,
      );
      const resetButton = screen.getByText("Reset filters");
      fireEvent.click(resetButton);
      expect(handleResetFilters).toHaveBeenCalledTimes(1);
    });

    test("reset button is disabled when no filters are active", () => {
      render(
        <Dialog
          {...defaultProps}
          isFooterEnabled={true}
          handleResetFilters={jest.fn()}
          hasActiveFilters={false}
        >
          <div>Dialog Content</div>
        </Dialog>,
      );
      expect(screen.getByText("Reset filters")).toBeDisabled();
    });

    test("reset button is enabled when filters are active", () => {
      render(
        <Dialog
          {...defaultProps}
          isFooterEnabled={true}
          handleResetFilters={jest.fn()}
          hasActiveFilters={true}
        >
          <div>Dialog Content</div>
        </Dialog>,
      );
      expect(screen.getByText("Reset filters")).toBeEnabled();
    });

    test("sets page properties when the dialog is open", () => {
      render(
        <Dialog {...defaultProps}>
          <div>Dialog Content</div>
        </Dialog>,
      );
      expect(document.body.style.overflowY).toBe("hidden");
    });

    test("resets page properties when the dialog is closed", () => {
      render(
        <Dialog {...defaultProps} isOpen={false}>
          <div>Dialog Content</div>
        </Dialog>,
      );
      expect(document.body.style.overflowY).toBe("visible");
    });
  });

  describe("is not supported", () => {
    let htmlDialogElement: typeof window.HTMLDialogElement;

    let Dialog: typeof DialogType;

    beforeEach(async () => {
      htmlDialogElement = window.HTMLDialogElement;
      window.HTMLDialogElement = undefined!;

      jest.isolateModules(() => {
        ({ Dialog } = jest.requireActual(
          "../../../../components/Dialog/Dialog",
        ));
      });
    });

    afterEach(() => {
      window.HTMLDialogElement = htmlDialogElement;
    });

    test("should render correctly with polyfill and content", () => {
      const { asFragment } = render(
        <Dialog {...defaultProps}>
          <div>Content</div>
        </Dialog>,
      );

      expect(asFragment()).toMatchSnapshot();
    });

    test("renders the dialog with the correct title", () => {
      render(
        <Dialog {...defaultProps}>
          <div>Dialog Content</div>
        </Dialog>,
      );
      expect(screen.getByText("Test Dialog")).toBeInTheDocument();
    });

    test("renders the children content", () => {
      render(
        <Dialog {...defaultProps}>
          <div>Dialog Content</div>
        </Dialog>,
      );
      expect(screen.getByText("Dialog Content")).toBeInTheDocument();
    });

    test("calls onClose when the close button is clicked", () => {
      render(
        <Dialog {...defaultProps}>
          <div>Dialog Content</div>
        </Dialog>,
      );
      const closeButton = screen.getByText("Done");
      fireEvent.click(closeButton);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    test("renders the footer with the correct totalFiltered and total values", () => {
      render(
        <Dialog {...defaultProps} isFooterEnabled={true}>
          <div>Dialog Content</div>
        </Dialog>,
      );
      expect(screen.getByText("5/10")).toBeInTheDocument();
    });

    test("calls handleResetFilters when the reset button is clicked", () => {
      const handleResetFilters = jest.fn();
      render(
        <Dialog
          {...defaultProps}
          isFooterEnabled={true}
          handleResetFilters={handleResetFilters}
          hasActiveFilters={true}
        >
          <div>Dialog Content</div>
        </Dialog>,
      );
      const resetButton = screen.getByText("Reset filters");
      fireEvent.click(resetButton);
      expect(handleResetFilters).toHaveBeenCalledTimes(1);
    });

    test("reset button is disabled when no filters are active", () => {
      render(
        <Dialog
          {...defaultProps}
          isFooterEnabled={true}
          handleResetFilters={jest.fn()}
          hasActiveFilters={false}
        >
          <div>Dialog Content</div>
        </Dialog>,
      );
      expect(screen.getByText("Reset filters")).toBeDisabled();
    });

    test("reset button is enabled when filters are active", () => {
      render(
        <Dialog
          {...defaultProps}
          isFooterEnabled={true}
          handleResetFilters={jest.fn()}
          hasActiveFilters={true}
        >
          <div>Dialog Content</div>
        </Dialog>,
      );
      expect(screen.getByText("Reset filters")).toBeEnabled();
    });

    test("sets page properties when the dialog is open", () => {
      render(
        <Dialog {...defaultProps}>
          <div>Dialog Content</div>
        </Dialog>,
      );
      expect(document.body.style.overflowY).toBe("hidden");
      expect(document.body.style.position).toBe("fixed");
      expect(document.body.style.width).toBe("100%");
    });

    test("resets page properties when the dialog is closed", () => {
      render(
        <Dialog {...defaultProps} isOpen={false}>
          <div>Dialog Content</div>
        </Dialog>,
      );
      expect(document.body.style.overflowY).toBe("visible");
      expect(document.body.style.position).toBe("relative");
      expect(document.body.style.width).toBe("auto");
    });
  });
});
