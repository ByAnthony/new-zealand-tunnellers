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
  zoom = 5;

  setView() {
    return this;
  }

  getZoom() {
    return this.zoom;
  }

  on() {
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
    return this;
  }

  zoomOut() {
    this.zoom -= 1;
    return this;
  }
}

jest.mock("leaflet", () => ({
  __esModule: true,
  default: {
    map: () => new MockMap(),
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
    expect(screen.getByText("Emmett")).toBeInTheDocument();
    expect(screen.getByText("Brown")).toBeInTheDocument();
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
    expect(screen.getByText("Marty")).toBeInTheDocument();
    expect(screen.getByText("McFly")).toBeInTheDocument();
  });
});
