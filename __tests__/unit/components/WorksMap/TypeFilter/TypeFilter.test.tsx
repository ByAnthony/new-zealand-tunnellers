import { fireEvent, render, screen } from "@testing-library/react";

import { TypeFilter } from "@/components/WorksMap/TypeFilter/TypeFilter";

const mockTypes = ["Dugout", "Machine-gun nest", "Trench"];
const onChange = jest.fn();
const onOpen = jest.fn();

describe("TypeFilter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("matches the snapshot", () => {
    const { asFragment } = render(
      <TypeFilter types={mockTypes} selectedType={null} onChange={onChange} />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  describe("trigger button", () => {
    test("shows 'All types' when no type is selected", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedType={null}
          onChange={onChange}
        />,
      );
      expect(
        screen.getByRole("button", { name: "All types" }),
      ).toBeInTheDocument();
    });

    test("shows selected type name on trigger", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedType="Dugout"
          onChange={onChange}
        />,
      );
      expect(
        screen.getByRole("button", { name: "Dugout" }),
      ).toBeInTheDocument();
    });

    test("applies active class when a type is selected", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedType="Trench"
          onChange={onChange}
        />,
      );
      const trigger = screen.getByRole("button", { name: "Trench" });
      expect(trigger.className).toMatch(/active/);
    });

    test("does not apply active class when no type is selected", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedType={null}
          onChange={onChange}
        />,
      );
      const trigger = screen.getByRole("button", { name: "All types" });
      expect(trigger.className).not.toMatch(/active/);
    });
  });

  describe("dropup", () => {
    test("dropup is closed by default", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedType={null}
          onChange={onChange}
        />,
      );
      expect(screen.queryByText("Machine-gun nest")).not.toBeInTheDocument();
    });

    test("opens dropup when trigger is clicked", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedType={null}
          onChange={onChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "All types" }));
      expect(screen.getByText("Machine-gun nest")).toBeInTheDocument();
      expect(screen.getByText("Trench")).toBeInTheDocument();
    });

    test("closes dropup when trigger is clicked again", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedType={null}
          onChange={onChange}
        />,
      );
      const trigger = screen.getByRole("button", { name: "All types" });
      fireEvent.click(trigger);
      fireEvent.click(trigger);
      expect(screen.queryByText("Machine-gun nest")).not.toBeInTheDocument();
    });

    test("calls onChange with type when an option is selected", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedType={null}
          onChange={onChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "All types" }));
      fireEvent.click(screen.getByRole("button", { name: "Dugout" }));
      expect(onChange).toHaveBeenCalledWith("Dugout");
    });

    test("calls onChange with null when 'All types' is selected", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedType="Dugout"
          onChange={onChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Dugout" }));
      fireEvent.click(screen.getByRole("button", { name: "All types" }));
      expect(onChange).toHaveBeenCalledWith(null);
    });

    test("closes dropup after selecting a type", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedType={null}
          onChange={onChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "All types" }));
      fireEvent.click(screen.getByRole("button", { name: "Trench" }));
      expect(screen.queryByText("Machine-gun nest")).not.toBeInTheDocument();
    });

    test("calls onOpen when opening the dropup", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedType={null}
          onChange={onChange}
          onOpen={onOpen}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "All types" }));
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    test("does not call onOpen when closing the dropup", () => {
      render(
        <TypeFilter
          types={mockTypes}
          selectedType={null}
          onChange={onChange}
          onOpen={onOpen}
        />,
      );
      const trigger = screen.getByRole("button", { name: "All types" });
      fireEvent.click(trigger);
      fireEvent.click(trigger);
      expect(onOpen).toHaveBeenCalledTimes(1);
    });
  });

  describe("outside click", () => {
    test("closes dropup when clicking outside", () => {
      render(
        <div>
          <TypeFilter
            types={mockTypes}
            selectedType={null}
            onChange={onChange}
          />
          <div data-testid="outside">Outside</div>
        </div>,
      );
      fireEvent.click(screen.getByRole("button", { name: "All types" }));
      expect(screen.getByText("Machine-gun nest")).toBeInTheDocument();
      fireEvent.mouseDown(screen.getByTestId("outside"));
      expect(screen.queryByText("Machine-gun nest")).not.toBeInTheDocument();
    });
  });
});
