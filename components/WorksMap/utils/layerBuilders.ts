import L from "leaflet";

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

import { collectCategories, getWorkCategories } from "./filterUtils";
import {
  createGroupIcon,
  createSingleIcon,
  createWorkIcon,
} from "./markerIcons";
import { groupPathsBySegment } from "./pathUtils";

export type WorkMarkerEntry = {
  marker: L.Marker;
  groupWorks: WorkData[];
  starts: number[];
  ends: number[];
  categories1: (string | null)[];
  categories2: (string | null)[];
};

type WorkPolylineParams = {
  map: L.Map;
  paths: WorkPathPoint[];
  works: WorkData[];
  defaultWorkColor: string;
  categoryColors: Record<string, string>;
  onClick: (args: {
    work: WorkData;
    latlng: L.LatLng;
    workPolylines: L.Polyline[];
  }) => void;
};

export function buildWorkPolylineLayers({
  map,
  paths,
  works,
  defaultWorkColor,
  categoryColors,
  onClick,
}: WorkPolylineParams) {
  const workIdsWithPaths = new Set(paths.map((p) => p.work_id));
  const polylinesByWorkId = new Map<number, L.Polyline[]>();
  const polylineColorByWorkId = new Map<number, string>();

  groupPathsBySegment(paths, (p) => p.work_id).forEach(
    ({ id: workId, points }) => {
      const work = works.find((w) => w.work_id === workId);
      const cat = work?.work_category_1_en ?? null;
      const workColor =
        cat && categoryColors[cat] ? categoryColors[cat] : defaultWorkColor;

      polylineColorByWorkId.set(workId, workColor);
      const polyline = L.polyline(points, {
        color: workColor,
        weight: 3,
        opacity: 1,
      }).addTo(map);

      if (!polylinesByWorkId.has(workId)) polylinesByWorkId.set(workId, []);
      polylinesByWorkId.get(workId)!.push(polyline);

      if (work) {
        polyline.on("click", (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          onClick({
            work,
            latlng: e.latlng,
            workPolylines: polylinesByWorkId.get(workId) ?? [],
          });
        });
      }
    },
  );

  return { workIdsWithPaths, polylinesByWorkId, polylineColorByWorkId };
}

type CaveLayerParams = {
  map: L.Map;
  cavePaths: CavePathPoint[];
  caves: CaveData[];
  caveBorderColor: string;
  caveColor: string;
  onClick: (args: {
    cave: CaveData;
    caveId: number;
    latlng: L.LatLng;
    cavePolygons: L.Polygon[];
  }) => void;
};

export function buildCavePolygonLayers({
  map,
  cavePaths,
  caves,
  caveBorderColor,
  caveColor,
  onClick,
}: CaveLayerParams) {
  const cavePolygonsById = new Map<number, L.Polygon[]>();

  groupPathsBySegment(cavePaths, (p) => p.cave_id).forEach(
    ({ id: caveId, points }) => {
      const polygon = L.polygon(points, {
        color: caveBorderColor,
        weight: 2,
        opacity: 1,
        fillColor: caveColor,
        fillOpacity: 1,
      }).addTo(map);

      if (!cavePolygonsById.has(caveId)) cavePolygonsById.set(caveId, []);
      cavePolygonsById.get(caveId)!.push(polygon);

      const cave = caves.find((c) => c.cave_id === caveId);
      if (cave) {
        polygon.on("click", (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          onClick({
            cave,
            caveId,
            latlng: e.latlng,
            cavePolygons: cavePolygonsById.get(caveId) ?? [],
          });
        });
      }
    },
  );

  return cavePolygonsById;
}

type SubwayLayerParams = {
  map: L.Map;
  subwayPaths: SubwayPathPoint[];
  subways: SubwayData[];
  caveColor: string;
  onClick: (args: {
    subway: SubwayData;
    subwayId: number;
    latlng: L.LatLng;
    subwayPolylines: L.Polyline[];
  }) => void;
};

export function buildSubwayPolylineLayers({
  map,
  subwayPaths,
  subways,
  caveColor,
  onClick,
}: SubwayLayerParams) {
  const subwayPolylinesById = new Map<number, L.Polyline[]>();

  groupPathsBySegment(subwayPaths, (p) => p.subway_id).forEach(
    ({ id: subwayId, points }) => {
      const polyline = L.polyline(points, {
        color: caveColor,
        weight: 3,
        opacity: 1,
      }).addTo(map);

      if (!subwayPolylinesById.has(subwayId))
        subwayPolylinesById.set(subwayId, []);
      subwayPolylinesById.get(subwayId)!.push(polyline);

      const subway = subways.find((s) => s.subway_id === subwayId);
      if (subway) {
        polyline.on("click", (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          onClick({
            subway,
            subwayId,
            latlng: e.latlng,
            subwayPolylines: subwayPolylinesById.get(subwayId) ?? [],
          });
        });
      }
    },
  );

  return subwayPolylinesById;
}

type FrontLineLayerParams = {
  map: L.Map;
  frontLinePaths: FrontLinePathPoint[];
  frontLines: FrontLineData[];
  britishLineColor: string;
  germanLineColor: string;
  pane: string;
};

export function buildFrontLineLayers({
  map,
  frontLinePaths,
  frontLines,
  britishLineColor,
  germanLineColor,
  pane,
}: FrontLineLayerParams) {
  const frontLinePolylinesById = new Map<number, L.Polyline[]>();

  groupPathsBySegment(frontLinePaths, (p) => p.front_line_id).forEach(
    ({ id: frontLineId, points }) => {
      const frontLine = frontLines.find((f) => f.front_line_id === frontLineId);
      if (!frontLine) return;

      const color =
        frontLine.front_line_side === "british"
          ? britishLineColor
          : germanLineColor;
      const polyline = L.polyline(points, {
        color,
        weight: 2,
        opacity: 0,
        pane,
        interactive: false,
      }).addTo(map);

      if (!frontLinePolylinesById.has(frontLineId))
        frontLinePolylinesById.set(frontLineId, []);
      frontLinePolylinesById.get(frontLineId)!.push(polyline);
    },
  );

  return frontLinePolylinesById;
}

type PointMarkerParams = {
  map: L.Map;
  works: WorkData[];
  locale: string;
  allMonths: { start: number; end: number }[];
  workIdsWithPaths: Set<number>;
  coordTolerance: number;
  typeColors: Record<string, string>;
  isWorkVisible: (
    start: number,
    end: number,
    cat1: string | null,
    cat2: string | null,
    dateRange: [number, number],
    selectedTypes: Set<string>,
  ) => boolean;
  getDateRange: () => [number, number];
  getSelectedTypes: () => Set<string>;
  onClick: (args: { marker: L.Marker; filteredWorks: WorkData[] }) => void;
};

export function buildPointWorkMarkers({
  map,
  works,
  locale,
  allMonths,
  workIdsWithPaths,
  coordTolerance,
  typeColors,
  isWorkVisible,
  getDateRange,
  getSelectedTypes,
  onClick,
}: PointMarkerParams): WorkMarkerEntry[] {
  const snapCoord = (n: number) =>
    Math.round(n / coordTolerance) * coordTolerance;
  const groupMap = new Map<string, WorkData[]>();

  works.forEach((work) => {
    if (workIdsWithPaths.has(work.work_id)) return;
    const key = `${snapCoord(work.work_latitude)},${snapCoord(work.work_longitude)}`;
    const existing = groupMap.get(key);
    if (existing) existing.push(work);
    else groupMap.set(key, [work]);
  });

  return Array.from(groupMap.values()).map((groupWorks) => {
    const rep = groupWorks[0];
    const count = groupWorks.length;
    const groupCats = collectCategories(groupWorks, locale);
    const icon = createWorkIcon(groupCats, count, typeColors);

    const marker = L.marker([rep.work_latitude, rep.work_longitude], { icon })
      .addTo(map)
      .on("click", () => {
        const filteredWorks = groupWorks.filter((work) => {
          const idx = works.indexOf(work);
          const [c1, c2] = getWorkCategories(work, locale);
          return isWorkVisible(
            allMonths[idx].start,
            allMonths[idx].end,
            c1,
            c2,
            getDateRange(),
            getSelectedTypes(),
          );
        });

        if (filteredWorks.length === 0) return;

        marker.setIcon(
          filteredWorks.length === 1
            ? createSingleIcon("rgb(255, 255, 255)", null)
            : createGroupIcon(
                "rgb(255, 255, 255)",
                filteredWorks.length,
                "rgb(29,31,32)",
              ),
        );
        onClick({ marker, filteredWorks });
      });

    const worksMonths = groupWorks.map((work) => {
      const idx = works.indexOf(work);
      return { start: allMonths[idx].start, end: allMonths[idx].end };
    });
    const categoryPairs = groupWorks.map((work) =>
      getWorkCategories(work, locale),
    );

    return {
      marker,
      groupWorks,
      starts: worksMonths.map((m) => m.start),
      ends: worksMonths.map((m) => m.end),
      categories1: categoryPairs.map(([c1]) => c1),
      categories2: categoryPairs.map(([, c2]) => c2),
    };
  });
}
