import L from "leaflet";

const MARKER_COLOR_NEUTRAL = "rgb(29, 31, 32)";
export const MARKER_COLOR_ACTIVE = "rgb(255, 255, 255)";

export const CATEGORY_COLORS: Record<string, string> = {
  Demolition: "rgb(231, 76, 60)",
  Dugout: "rgb(52, 152, 219)",
  Infrastructure: "rgb(243, 156, 18)",
  "Machine-gun nest": "rgb(142, 68, 173)",
  Medical: "rgb(46, 204, 113)",
  "Observation post": "rgb(26, 188, 156)",
  Subway: "rgb(241, 196, 15)",
  Trench: "rgb(230, 126, 34)",
  "Trench Mortar": "rgb(192, 57, 43)",
};

function getCategoryColor(
  category: string | null,
  colorMap?: Record<string, string>,
): string {
  if (!category) return MARKER_COLOR_NEUTRAL;
  if (colorMap && colorMap[category]) return colorMap[category];
  return CATEGORY_COLORS[category] ?? MARKER_COLOR_NEUTRAL;
}

export function createSingleIcon(color1: string, color2: string | null) {
  if (!color2 || color1 === color2) {
    return L.divIcon({
      className: "",
      html: `<div style="width:10px;height:10px;border-radius:50%;background:${color1};border:1px solid rgba(255,255,255,0.6);"></div>`,
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    });
  }
  return L.divIcon({
    className: "",
    html: `<div style="width:10px;height:10px;border-radius:50%;overflow:hidden;border:1px solid rgba(255,255,255,0.6);background:conic-gradient(${color1} 50%, ${color2} 50%);"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

export function createGroupIcon(
  color: string,
  count: number,
  textColor = "rgb(255,255,255)",
) {
  return L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:1px solid rgba(255,255,255,0.6);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:${textColor};font-family:sans-serif;">${count}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function buildGradient(colors: string[]) {
  const stops = colors
    .map((c, i) => {
      const from = (i / colors.length) * 100;
      const to = ((i + 1) / colors.length) * 100;
      return `${c} ${from}%, ${c} ${to}%`;
    })
    .join(", ");
  return `conic-gradient(${stops})`;
}

function createSplitGroupIcon(colors: string[], count: number) {
  return L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;border-radius:50%;overflow:hidden;background:${buildGradient(colors)};border:1px solid rgba(255,255,255,0.6);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:rgb(255,255,255);font-family:sans-serif;">${count}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export function createWorkIcon(
  categories: Set<string>,
  visibleCount: number,
  colorMap?: Record<string, string>,
) {
  const cats = Array.from(categories);
  if (visibleCount === 1 && cats.length <= 2) {
    return createSingleIcon(
      getCategoryColor(cats[0] ?? null, colorMap),
      cats[1] ? getCategoryColor(cats[1], colorMap) : null,
    );
  }
  if (cats.length === 1) {
    return createGroupIcon(getCategoryColor(cats[0], colorMap), visibleCount);
  }
  if (cats.length >= 2) {
    return createSplitGroupIcon(
      cats.map((c) => getCategoryColor(c, colorMap)),
      visibleCount,
    );
  }
  return createGroupIcon(MARKER_COLOR_NEUTRAL, visibleCount);
}
