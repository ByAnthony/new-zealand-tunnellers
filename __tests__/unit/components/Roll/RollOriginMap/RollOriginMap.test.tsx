import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { RollOriginMap } from "@/components/Roll/RollOriginMap/RollOriginMap";
import { mockTunnellers } from "@/test-utils/mocks/mockTunnellers";
import { Filters } from "@/utils/helpers/rollParams";

type MarkerHandler = () => void;

const circleMarkers: MockCircleMarker[] = [];
const maps: MockMap[] = [];

class MockCircleMarker {
  handlers: Record<string, MarkerHandler> = {};

  constructor(
    _latlng: [number, number],
    public options: Record<string, unknown>,
  ) {}

  on(event: string, handler: MarkerHandler) {
    this.handlers[event] = handler;
    return this;
  }

  bindTooltip() {
    return this;
  }

  addTo() {
    return this;
  }

  bringToFront() {
    return this;
  }
}

class MockLayerGroup {
  addTo() {
    return this;
  }

  clearLayers() {
    circleMarkers.length = 0;
  }
}

class MockMap {
  handlers: Record<string, MarkerHandler> = {};
  zoom = 5;

  setView(_latlng: [number, number], zoom: number) {
    this.zoom = zoom;
    return this;
  }

  getZoom() {
    return this.zoom;
  }

  on(event: string, handler: MarkerHandler) {
    this.handlers[event] = handler;
    return this;
  }

  remove() {
    return this;
  }

  invalidateSize() {
    return this;
  }

  zoomIn() {
    this.zoom += 1;
    this.handlers.zoomend?.();
    return this;
  }

  zoomOut() {
    this.zoom -= 1;
    this.handlers.zoomend?.();
    return this;
  }
}

jest.mock("leaflet", () => ({
  __esModule: true,
  default: {
    map: () => {
      const map = new MockMap();
      maps.push(map);
      return map;
    },
    tileLayer: () => ({ addTo: () => ({}) }),
    layerGroup: () => new MockLayerGroup(),
    circleMarker: (
      latlng: [number, number],
      options: Record<string, unknown>,
    ) => {
      const marker = new MockCircleMarker(latlng, options);
      circleMarkers.push(marker);
      return marker;
    },
  },
}));

const filters: Filters = {
  detachment: [],
  corps: [],
  ranks: {},
  birthYear: [],
  unknownBirthYear: "",
  deathYear: [],
  unknownDeathYear: "",
};

const rollFiltersProps = {
  uniqueDetachments: [],
  uniqueCorps: [],
  uniqueBirthYears: [],
  uniqueDeathYears: [],
  sortedRanks: {},
  filters,
  startBirthYear: "",
  endBirthYear: "",
  startDeathYear: "",
  endDeathYear: "",
  handleDetachmentFilter: jest.fn(),
  handleCorpsFilter: jest.fn(),
  handleBirthSliderChange: jest.fn(),
  handleDeathSliderChange: jest.fn(),
  handleSliderDragStart: jest.fn(),
  handleSliderDragComplete: jest.fn(),
  handleRankFilter: jest.fn(),
  handleUnknownBirthYear: jest.fn(),
  handleUnknownDeathYear: jest.fn(),
};

describe("RollOriginMap", () => {
  beforeEach(() => {
    circleMarkers.length = 0;
    maps.length = 0;
    window.history.replaceState(null, "", "/tunnellers?view=map");
  });

  test("closes the origin drawer when filters are opened", async () => {
    render(
      <RollOriginMap
        tunnellers={mockTunnellers}
        rollFiltersProps={rollFiltersProps}
        filters={filters}
        defaultFilters={filters}
        applyFilters={jest.fn()}
        getFilteredTunnellerCount={() => 4}
        activeFilterCount={0}
        totalTunnellers={4}
      />,
    );

    await waitFor(() => expect(circleMarkers.length).toBeGreaterThan(0));

    act(() => {
      circleMarkers[0].handlers.click();
    });

    expect(
      screen.getByRole("dialog", { name: "Auckland" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Toggle filters" }));

    expect(
      screen.queryByRole("dialog", { name: "Auckland" }),
    ).not.toBeInTheDocument();
    expect(document.querySelector("#roll-origin-map-filters")).toHaveAttribute(
      "data-open",
      "true",
    );
  });

  test("keeps drawer cards rendered while the drawer closes", async () => {
    window.history.replaceState(null, "", "/tunnellers?view=map&zoom=6");

    render(
      <RollOriginMap
        tunnellers={mockTunnellers}
        rollFiltersProps={rollFiltersProps}
        filters={filters}
        defaultFilters={filters}
        applyFilters={jest.fn()}
        getFilteredTunnellerCount={() => 4}
        activeFilterCount={0}
        totalTunnellers={4}
      />,
    );

    await waitFor(() => expect(circleMarkers.length).toBeGreaterThan(0));

    act(() => {
      circleMarkers[0].handlers.click();
    });

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(
      screen.queryByRole("dialog", { name: "Auckland" }),
    ).not.toBeInTheDocument();
    expect(window.location.search).toBe("?view=map&zoom=6");
    expect(screen.getByText("Emmett")).toBeInTheDocument();
    expect(screen.getByText("Brown")).toBeInTheDocument();
  });

  test("updates the url when a marker is selected", async () => {
    render(
      <RollOriginMap
        tunnellers={mockTunnellers}
        rollFiltersProps={rollFiltersProps}
        filters={filters}
        defaultFilters={filters}
        applyFilters={jest.fn()}
        getFilteredTunnellerCount={() => 4}
        activeFilterCount={0}
        totalTunnellers={4}
      />,
    );

    await waitFor(() => expect(circleMarkers.length).toBeGreaterThan(0));

    act(() => {
      circleMarkers[0].handlers.click();
    });

    expect(window.location.search).toBe("?view=map&lat=-36.8485&lng=174.7633");
  });

  test("updates the url when the map is zoomed", async () => {
    render(
      <RollOriginMap
        tunnellers={mockTunnellers}
        rollFiltersProps={rollFiltersProps}
        filters={filters}
        defaultFilters={filters}
        applyFilters={jest.fn()}
        getFilteredTunnellerCount={() => 4}
        activeFilterCount={0}
        totalTunnellers={4}
      />,
    );

    await waitFor(() => expect(maps.length).toBe(1));

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));

    expect(window.location.search).toBe("?view=map&zoom=6");
  });

  test("restores the map zoom from query params", async () => {
    window.history.replaceState(null, "", "/tunnellers?view=map&zoom=9");

    render(
      <RollOriginMap
        tunnellers={mockTunnellers}
        rollFiltersProps={rollFiltersProps}
        filters={filters}
        defaultFilters={filters}
        applyFilters={jest.fn()}
        getFilteredTunnellerCount={() => 4}
        activeFilterCount={0}
        totalTunnellers={4}
      />,
    );

    await waitFor(() => expect(maps.length).toBe(1));

    expect(maps[0].getZoom()).toBe(9);
  });

  test("clears map params when returning to the roll list", async () => {
    window.history.replaceState(
      null,
      "",
      "/tunnellers?view=map&zoom=9&lat=-36.8485&lng=174.7633",
    );

    render(
      <RollOriginMap
        tunnellers={mockTunnellers}
        rollFiltersProps={rollFiltersProps}
        filters={filters}
        defaultFilters={filters}
        applyFilters={jest.fn()}
        getFilteredTunnellerCount={() => 4}
        activeFilterCount={0}
        totalTunnellers={4}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open the tunnellers roll list" }),
    );

    expect(window.location.search).toBe("");
  });

  test("opens the matching drawer from lat and lng query params", async () => {
    window.history.replaceState(
      null,
      "",
      "/tunnellers?view=map&lat=-36.8485&lng=174.7633",
    );

    render(
      <RollOriginMap
        tunnellers={mockTunnellers}
        rollFiltersProps={rollFiltersProps}
        filters={filters}
        defaultFilters={filters}
        applyFilters={jest.fn()}
        getFilteredTunnellerCount={() => 4}
        activeFilterCount={0}
        totalTunnellers={4}
      />,
    );

    expect(
      await screen.findByRole("dialog", { name: "Auckland" }),
    ).toBeInTheDocument();
  });

  test("opens a drawer for tunnellers without an origin", async () => {
    render(
      <RollOriginMap
        tunnellers={mockTunnellers}
        rollFiltersProps={rollFiltersProps}
        filters={filters}
        defaultFilters={filters}
        applyFilters={jest.fn()}
        getFilteredTunnellerCount={() => 4}
        activeFilterCount={0}
        totalTunnellers={4}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /unknown origin/i }));

    expect(
      screen.getByRole("dialog", { name: "Unknown Origin" }),
    ).toBeInTheDocument();
    expect(window.location.search).toBe("?view=map&origin=unknown");
    expect(screen.getByText("Marty")).toBeInTheDocument();
    expect(screen.getByText("McFly")).toBeInTheDocument();
  });
});
