import { fireEvent, render, screen } from "@testing-library/react";

import { TypeFilter } from "@/components/WorksMap/TypeFilter/TypeFilter";

const mockTypes = ["Dugout", "Machine-gun nest", "Trench"];
const mockColors: Record<string, string> = {
  Dugout: "rgb(52, 152, 219)",
  "Machine-gun nest": "rgb(142, 68, 173)",
  Trench: "rgb(230, 126, 34)",
};
const onToggle = jest.fn();

describe("TypeFilter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("matches the snapshot", () => {
    const { asFragment } = render(
      <TypeFilter
        types={mockTypes}
        selectedTypes={new Set()}
        onToggle={onToggle}
        colors={mockColors}
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  describe("chips", () => {
    test("renders a chip for each type", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedTypes={new Set()}
          onToggle={onToggle}
          colors={mockColors}
        />,
      );
      expect(screen.getByText("Dugout")).toBeInTheDocument();
      expect(screen.getByText("Machine-gun nest")).toBeInTheDocument();
      expect(screen.getByText("Trench")).toBeInTheDocument();
    });

    test("chips have aria-pressed false when not selected", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedTypes={new Set()}
          onToggle={onToggle}
          colors={mockColors}
        />,
      );
      expect(screen.getByText("Dugout").closest("button")).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });

    test("chips have aria-pressed true when selected", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedTypes={new Set(["Dugout"])}
          onToggle={onToggle}
          colors={mockColors}
        />,
      );
      expect(screen.getByText("Dugout").closest("button")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    test("applies active class when selected", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedTypes={new Set(["Trench"])}
          onToggle={onToggle}
          colors={mockColors}
        />,
      );
      const chip = screen.getByText("Trench").closest("button");
      expect(chip?.className).toMatch(/active/);
    });

    test("does not apply active class when not selected", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedTypes={new Set()}
          onToggle={onToggle}
          colors={mockColors}
        />,
      );
      const chip = screen.getByText("Trench").closest("button");
      expect(chip?.className).not.toMatch(/active/);
    });

    test("calls onToggle with type when a chip is clicked", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedTypes={new Set()}
          onToggle={onToggle}
          colors={mockColors}
        />,
      );
      fireEvent.click(screen.getByText("Dugout"));
      expect(onToggle).toHaveBeenCalledWith("Dugout");
    });

    test("supports multiple selected types", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedTypes={new Set(["Dugout", "Trench"])}
          onToggle={onToggle}
          colors={mockColors}
        />,
      );
      expect(screen.getByText("Dugout").closest("button")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(
        screen.getByText("Machine-gun nest").closest("button"),
      ).toHaveAttribute("aria-pressed", "false");
      expect(screen.getByText("Trench").closest("button")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });
  });

  test("renders the chips in a filter group", () => {
    render(
      <TypeFilter
        types={mockTypes}
        selectedTypes={new Set()}
        onToggle={onToggle}
        colors={mockColors}
      />,
    );
    expect(
      screen.getByRole("group", { name: "Filter by type" }),
    ).toBeInTheDocument();
  });

  describe("availableTypes", () => {
    test("disables chips not in availableTypes", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedTypes={new Set()}
          availableTypes={new Set(["Dugout"])}
          onToggle={onToggle}
          colors={mockColors}
        />,
      );
      expect(screen.getByText("Dugout").closest("button")).not.toBeDisabled();
      expect(
        screen.getByText("Machine-gun nest").closest("button"),
      ).toBeDisabled();
      expect(screen.getByText("Trench").closest("button")).toBeDisabled();
    });

    test("enables all chips when availableTypes is not provided", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedTypes={new Set()}
          onToggle={onToggle}
          colors={mockColors}
        />,
      );
      expect(screen.getByText("Dugout").closest("button")).not.toBeDisabled();
      expect(
        screen.getByText("Machine-gun nest").closest("button"),
      ).not.toBeDisabled();
      expect(screen.getByText("Trench").closest("button")).not.toBeDisabled();
    });
  });
});
