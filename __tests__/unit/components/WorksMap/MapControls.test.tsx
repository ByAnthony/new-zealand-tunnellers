import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import "@testing-library/jest-dom";

import { MapControls } from "@/components/WorksMap/MapControls/MapControls";
import { dateToDay } from "@/components/WorksMap/utils/mapParams";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    ({
      work: "work",
      works: "works",
    })[key] ?? key,
}));

jest.mock("../../../../components/Dialog/Dialog", () => ({
  Dialog: ({
    children,
    isOpen,
    title,
    totalFiltered,
    total,
    onClose,
  }: {
    children: ReactNode;
    isOpen: boolean;
    title: string;
    totalFiltered?: number;
    total?: number;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div>
        <h2>{title}</h2>
        <button onClick={onClose}>Done</button>
        <div data-testid="dialog-count">
          {totalFiltered}/{total}
        </div>
        {children}
      </div>
    ) : null,
}));

jest.mock("../../../../components/WorksMap/TypeFilter/TypeFilter", () => ({
  TypeFilter: ({
    types,
    onToggle,
  }: {
    types: string[];
    onToggle: (_type: string) => void;
  }) => (
    <div>
      {types.map((type) => (
        <button key={type} onClick={() => onToggle(type)}>
          {type}
        </button>
      ))}
    </div>
  ),
}));

jest.mock("../../../../components/WorksMap/WorksSlider/WorksSlider", () => ({
  WorksSlider: () => <div data-testid="works-slider" />,
}));

describe("MapControls", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });
  });

  function renderMapControls({
    selectedTypes = new Set<string>(),
    initialPeriodKey = null,
    computeAvailableTypes = () => new Set(["Dugout"]),
    computeVisibleCount = () => 8,
  }: {
    selectedTypes?: Set<string>;
    initialPeriodKey?: string | null;
    computeAvailableTypes?: (_start: number, _end: number) => Set<string>;
    computeVisibleCount?: (
      _start: number,
      _end: number,
      _types: Set<string>,
    ) => number;
  } = {}) {
    return render(
      <MapControls
        visibleCount={8}
        locale="en"
        types={["Dugout"]}
        selectedTypes={selectedTypes}
        typeColors={{}}
        dateRange={[1, 2]}
        onDateRangeChange={jest.fn()}
        onDateRangeComplete={jest.fn()}
        minMonth={1}
        maxMonth={2}
        initialPeriodKey={initialPeriodKey}
        onApplyFilters={jest.fn()}
        computeAvailableTypes={computeAvailableTypes}
        computeVisibleCount={computeVisibleCount}
        currentZoom={10}
        onZoom={jest.fn()}
        totalWorks={10}
        periodBounds={null}
      />,
    );
  }

  test("updates the dialog count when pending filters change", () => {
    const computeVisibleCount = jest.fn(
      (_start: number, _end: number, types: Set<string>) =>
        types.has("Dugout") ? 3 : 8,
    );

    renderMapControls({ computeVisibleCount });

    fireEvent.click(screen.getByRole("button", { name: "Toggle filters" }));
    expect(screen.getByTestId("dialog-count")).toHaveTextContent("8/10");
    expect(screen.getByText("16 March — 15 November 1916")).toBeInTheDocument();
    expect(
      screen.getByText("16 November 1916 — 9 April 1917"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dugout" }));
    expect(screen.getByTestId("dialog-count")).toHaveTextContent("3/10");
  });

  test("keeps the badge count based on applied filters while the dialog is open", () => {
    renderMapControls({
      selectedTypes: new Set(["Dugout"]),
      initialPeriodKey: "1916-03-16/1916-11-15",
      computeAvailableTypes: () => new Set(["Dugout"]),
      computeVisibleCount: () => 3,
    });

    const toggle = screen.getByRole("button", { name: "Toggle filters" });
    expect(toggle).toHaveTextContent("Filters2");

    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent("Filters2");

    fireEvent.click(
      screen.getByRole("button", { name: /Underground Warfare/i }),
    );
    expect(toggle).toHaveTextContent("Filters2");
  });

  test("disables periods that have no matching work for the selected pending type", () => {
    const undergroundWarfareStart = dateToDay("1916-03-16");
    const undergroundWarfareEnd = dateToDay("1916-11-15");

    renderMapControls({
      computeVisibleCount: (start, end, types) => {
        if (
          types.has("Dugout") &&
          start === undergroundWarfareStart &&
          end === undergroundWarfareEnd
        ) {
          return 0;
        }
        return 5;
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Toggle filters" }));
    fireEvent.click(screen.getByRole("button", { name: "Dugout" }));

    expect(
      screen.getByRole("button", { name: /Underground Warfare/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", {
        name: /Preparations for the Battle of Arras/i,
      }),
    ).toBeEnabled();
  });
});
