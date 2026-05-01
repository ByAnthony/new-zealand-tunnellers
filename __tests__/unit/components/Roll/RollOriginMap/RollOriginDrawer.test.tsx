import { fireEvent, render, screen } from "@testing-library/react";
import { useTranslations } from "next-intl";

import { RollOriginDrawer } from "@/components/Roll/RollOriginMap/RollOriginDrawer";
import { mockTunnellersData } from "@/test-utils/mocks/mockTunnellers";

const origin = {
  town: "Auckland",
  latitude: -36.8485,
  longitude: 174.7633,
  count: 2,
  tunnellers: [mockTunnellersData[0], mockTunnellersData[1]],
};

describe("RollOriginDrawer", () => {
  beforeEach(() => {
    (useTranslations as jest.Mock).mockImplementation((namespace: string) => {
      if (namespace !== "maps") return (key: string) => key;

      return (key: string, values?: Record<string, unknown>) => {
        if (key === "originDrawerCount") return `${values?.count} results`;
        if (key === "closePanel") return "Close";
        return key;
      };
    });
  });

  test("does not render when there is no selected origin", () => {
    render(<RollOriginDrawer origin={null} onClose={jest.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("renders a labelled dialog with origin results", () => {
    render(<RollOriginDrawer origin={origin} onClose={jest.fn()} />);

    expect(
      screen.getByRole("dialog", { name: "Auckland" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 results")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Emmett Brown/i })).toHaveAttribute(
      "href",
      "/tunnellers/test-tunneller--1_234",
    );
    expect(screen.getByRole("link", { name: /John Doe/i })).toBeInTheDocument();
  });

  test("closes when the close button is clicked", () => {
    const onClose = jest.fn();
    render(<RollOriginDrawer origin={origin} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("closes when Escape is pressed", () => {
    const onClose = jest.fn();
    render(<RollOriginDrawer origin={origin} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("uses inert instead of aria-hidden while closing", () => {
    const { container, rerender } = render(
      <RollOriginDrawer origin={origin} onClose={jest.fn()} />,
    );

    screen.getByRole("button", { name: "Close" }).focus();

    rerender(
      <RollOriginDrawer origin={origin} isClosing onClose={jest.fn()} />,
    );

    const drawer = container.querySelector("aside");

    expect(drawer).not.toHaveAttribute("aria-hidden");
    expect(drawer).toHaveAttribute("inert");
  });
});
