import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { WorksMap } from "@/components/WorksMap/WorksMap";
import { CaveData, CavePathPoint } from "@/utils/database/queries/cavesQuery";
import {
  FrontLineData,
  FrontLinePathPoint,
} from "@/utils/database/queries/frontLinesQuery";
import {
  SubwayData,
  SubwayPathPoint,
} from "@/utils/database/queries/subwaysQuery";
import { WorkData, WorkPathPoint } from "@/utils/database/queries/worksQuery";

type BoundsLike = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  extend: (_other: BoundsLike) => BoundsLike;
  isValid: () => boolean;
};

let mockSearchParams = new URLSearchParams();
let latestMapControlsProps: Record<string, unknown> | null = null;
let lastMapInstance: MockMap | null = null;

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

jest.mock("../../../../components/WorksMap/utils/markerIcons", () => ({
  CATEGORY_COLORS: {
    Dugout: "rgb(52, 152, 219)",
    Subway: "rgb(153, 131, 100)",
  },
  MARKER_COLOR_ACTIVE: "rgb(255, 196, 0)",
  createGroupIcon: jest.fn(() => ({ type: "group-icon" })),
  createSingleIcon: jest.fn(() => ({ type: "single-icon" })),
  createWorkIcon: jest.fn(() => ({ type: "work-icon" })),
}));

jest.mock("../../../../components/WorksMap/MapControls/MapControls", () => ({
  MapControls: (props: Record<string, unknown>) => {
    latestMapControlsProps = props;
    return (
      <div>
        <button
          onClick={() =>
            (
              props.onApplyFilters as (
                _periodKey: string | null,
                _periodStart: string | null,
                _periodEnd: string | null,
                _types: Set<string>,
              ) => void
            )("1916-11-16/1917-04-09", "1916-11-16", "1917-04-09", new Set())
          }
        >
          Apply Arras
        </button>
        <button
          onClick={() =>
            (
              props.onApplyFilters as (
                _periodKey: string | null,
                _periodStart: string | null,
                _periodEnd: string | null,
                _types: Set<string>,
              ) => void
            )("1918-07-15/1918-09-26", "1918-07-15", "1918-09-26", new Set())
          }
        >
          Apply Hundred Days
        </button>
      </div>
    );
  },
}));

function normalizePoint(
  point: [number, number] | { lat: number; lng: number },
): [number, number] {
  return Array.isArray(point) ? point : [point.lat, point.lng];
}

function createBounds(
  points: Array<[number, number] | { lat: number; lng: number }> = [],
): BoundsLike {
  const normalized = points.map(normalizePoint);
  const bounds: BoundsLike = {
    minLat:
      normalized.length > 0 ? Math.min(...normalized.map(([lat]) => lat)) : NaN,
    maxLat:
      normalized.length > 0 ? Math.max(...normalized.map(([lat]) => lat)) : NaN,
    minLng:
      normalized.length > 0
        ? Math.min(...normalized.map(([, lng]) => lng))
        : NaN,
    maxLng:
      normalized.length > 0
        ? Math.max(...normalized.map(([, lng]) => lng))
        : NaN,
    extend(other: BoundsLike) {
      if (!other.isValid()) return this;
      if (!this.isValid()) {
        this.minLat = other.minLat;
        this.maxLat = other.maxLat;
        this.minLng = other.minLng;
        this.maxLng = other.maxLng;
        return this;
      }
      this.minLat = Math.min(this.minLat, other.minLat);
      this.maxLat = Math.max(this.maxLat, other.maxLat);
      this.minLng = Math.min(this.minLng, other.minLng);
      this.maxLng = Math.max(this.maxLng, other.maxLng);
      return this;
    },
    isValid() {
      return Number.isFinite(this.minLat);
    },
  };
  return bounds;
}

class MockLayer {
  map: MockMap | null = null;
  events: Record<string, (_event?: Record<string, unknown>) => void> = {};

  addTo(map: MockMap) {
    this.map = map;
    map.layers.add(this);
    return this;
  }

  remove() {
    this.map?.layers.delete(this);
    return this;
  }

  on(event: string, handler: (_event?: Record<string, unknown>) => void) {
    this.events[event] = handler;
    return this;
  }

  fire(event: string, payload: Record<string, unknown> = {}) {
    this.events[event]?.(payload);
    return this;
  }
}

class MockMarker extends MockLayer {
  latlng: { lat: number; lng: number };
  icon: unknown;

  constructor(latlng: [number, number], icon: unknown) {
    super();
    this.latlng = { lat: latlng[0], lng: latlng[1] };
    this.icon = icon;
  }

  getLatLng() {
    return this.latlng;
  }

  setIcon(icon: unknown) {
    this.icon = icon;
    return this;
  }
}

class MockPolyline extends MockLayer {
  points: [number, number][];
  style: Record<string, unknown>;

  constructor(points: [number, number][], style: Record<string, unknown>) {
    super();
    this.points = points;
    this.style = { ...style };
  }

  getBounds() {
    return createBounds(this.points);
  }

  setStyle(style: Record<string, unknown>) {
    this.style = { ...this.style, ...style };
    return this;
  }
}

class MockMap {
  layers = new Set<unknown>();
  events: Record<string, Array<() => void>> = {};
  fitBoundsCalls: Array<{
    bounds: BoundsLike;
    options: Record<string, unknown>;
  }> = [];
  center = { lat: 0, lng: 0 };
  zoom = 10;

  createPane() {
    return { style: {} };
  }

  hasLayer(layer: unknown) {
    return this.layers.has(layer);
  }

  fitBounds(bounds: BoundsLike, options: Record<string, unknown>) {
    this.fitBoundsCalls.push({ bounds, options });
    return this;
  }

  setView([lat, lng]: [number, number], zoom: number) {
    this.center = { lat, lng };
    this.zoom = zoom;
    return this;
  }

  getCenter() {
    return this.center;
  }

  getZoom() {
    return this.zoom;
  }

  panTo(latlng: { lat: number; lng: number }) {
    this.center = latlng;
    return this;
  }

  latLngToContainerPoint() {
    return { x: 0, y: 0 };
  }

  containerPointToLatLng() {
    return { lat: 0, lng: 0 };
  }

  on(event: string, handler: () => void) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(handler);
    return this;
  }

  remove() {
    this.layers.clear();
  }
}

jest.mock("leaflet", () => {
  const IconDefault = function IconDefault() {};
  (IconDefault as unknown as { prototype: Record<string, unknown> }).prototype =
    {};
  return {
    __esModule: true,
    default: {
      Icon: {
        Default: Object.assign(IconDefault, {
          mergeOptions: jest.fn(),
        }),
      },
      DomEvent: {
        stopPropagation: jest.fn(),
      },
      point: (x: number, y: number) => ({ x, y }),
      latLngBounds: (
        points: Array<[number, number] | { lat: number; lng: number }> = [],
      ) => createBounds(points),
      map: () => {
        lastMapInstance = new MockMap();
        return lastMapInstance;
      },
      tileLayer: () => new MockLayer(),
      marker: (latlng: [number, number], options: { icon: unknown }) =>
        new MockMarker(latlng, options.icon),
      polyline: (points: [number, number][], style: Record<string, unknown>) =>
        new MockPolyline(points, style),
      polygon: (points: [number, number][], style: Record<string, unknown>) =>
        new MockPolyline(points, style),
    },
  };
});

const workVisibleInArras: WorkData = {
  work_id: 1,
  work_name: "Visible Work",
  work_name_fr: null,
  work_type_en: null,
  work_type_fr: null,
  work_category_1_en: "Dugout",
  work_category_1_fr: "Abri",
  work_category_2_en: null,
  work_category_2_fr: null,
  work_section: 1,
  work_date_start: "1917-01-01",
  work_date_end: "1917-01-15",
  work_latitude: 0,
  work_longitude: 0,
  work_note_en: null,
  work_note_fr: null,
};

const workVisibleInAllPeriods: WorkData = {
  ...workVisibleInArras,
  work_id: 2,
  work_name: "Anchor Work",
  work_date_start: "1916-11-16",
  work_date_end: "1918-09-26",
};

const works: WorkData[] = [workVisibleInArras, workVisibleInAllPeriods];
const paths: WorkPathPoint[] = [];
const caves: CaveData[] = [];
const cavePaths: CavePathPoint[] = [];
const subways: SubwayData[] = [];
const subwayPaths: SubwayPathPoint[] = [];
const frontLines: FrontLineData[] = [
  {
    front_line_id: 1,
    front_line_date: "1917-01-01",
    front_line_side: "british",
    front_line_period_start: "1916-11-16",
    front_line_period_end: "1917-04-09",
  },
  {
    front_line_id: 2,
    front_line_date: "1918-08-01",
    front_line_side: "british",
    front_line_period_start: "1918-07-15",
    front_line_period_end: "1918-09-26",
  },
];
const frontLinePaths: FrontLinePathPoint[] = [
  {
    front_line_id: 1,
    segment: 0,
    point_order: 0,
    latitude: 10,
    longitude: 10,
  },
  {
    front_line_id: 1,
    segment: 0,
    point_order: 1,
    latitude: 12,
    longitude: 12,
  },
  {
    front_line_id: 2,
    segment: 0,
    point_order: 0,
    latitude: 50,
    longitude: 50,
  },
  {
    front_line_id: 2,
    segment: 0,
    point_order: 1,
    latitude: 52,
    longitude: 52,
  },
];

function renderWorksMap() {
  return render(
    <WorksMap
      works={works}
      paths={paths}
      caves={caves}
      cavePaths={cavePaths}
      subways={subways}
      subwayPaths={subwayPaths}
      frontLines={frontLines}
      frontLinePaths={frontLinePaths}
      locale="en"
    />,
  );
}

describe("WorksMap", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockSearchParams = new URLSearchParams();
    latestMapControlsProps = null;
    lastMapInstance = null;
    window.history.replaceState({}, "", "/maps");
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("fits to the newly selected period front lines instead of the previous period", async () => {
    renderWorksMap();

    fireEvent.click(screen.getByRole("button", { name: "Apply Arras" }));
    await waitFor(() => {
      expect(lastMapInstance?.fitBoundsCalls.at(-1)?.bounds.maxLat).toBe(12);
    });

    fireEvent.click(screen.getByRole("button", { name: "Apply Hundred Days" }));
    await waitFor(() => {
      expect(lastMapInstance?.fitBoundsCalls.at(-1)?.bounds.maxLat).toBe(52);
    });
  });

  test("clears the selected work when filters hide it", async () => {
    mockSearchParams = new URLSearchParams("work=1");
    window.history.replaceState({}, "", "/maps?work=1");

    renderWorksMap();

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(await screen.findByText("Visible Work")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Apply Hundred Days" }));

    await waitFor(() => {
      expect(screen.queryByText("Visible Work")).not.toBeInTheDocument();
    });
  });

  test("does not restore a deep-linked work when current filters hide it", async () => {
    mockSearchParams = new URLSearchParams(
      "work=1&period=true&from=1918-07-15&to=1918-09-26",
    );
    window.history.replaceState(
      {},
      "",
      "/maps?work=1&period=true&from=1918-07-15&to=1918-09-26",
    );

    renderWorksMap();

    act(() => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(screen.queryByText("Visible Work")).not.toBeInTheDocument();
    });
    expect(latestMapControlsProps?.periodBounds).toEqual([
      expect.any(Number),
      expect.any(Number),
    ]);
  });
});
