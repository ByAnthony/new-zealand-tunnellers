import L from "leaflet";

import {
  MARKER_COLOR_ACTIVE,
  CATEGORY_COLORS,
  createSingleIcon,
  createGroupIcon,
  createWorkIcon,
} from "@/components/WorksMap/markerIcons";

describe("markerIcons", () => {
  describe("MARKER_COLOR_ACTIVE", () => {
    test("is white", () => {
      expect(MARKER_COLOR_ACTIVE).toBe("rgb(255, 255, 255)");
    });
  });

  describe("CATEGORY_COLORS", () => {
    test("has English category colors", () => {
      expect(CATEGORY_COLORS["Dugout"]).toBe("rgb(52, 152, 219)");
      expect(CATEGORY_COLORS["Trench"]).toBe("rgb(230, 126, 34)");
      expect(CATEGORY_COLORS["Infrastructure"]).toBe("rgb(243, 156, 18)");
    });

    test("only contains English category keys", () => {
      const keys = Object.keys(CATEGORY_COLORS);
      expect(keys).toHaveLength(10);
      expect(keys).toContain("Demolition");
      expect(keys).not.toContain("Abri");
    });
  });

  describe("createSingleIcon", () => {
    test("returns a Leaflet divIcon", () => {
      const icon = createSingleIcon("rgb(255,0,0)", null);
      expect(icon).toBeInstanceOf(L.DivIcon);
    });

    test("creates solid icon when color2 is null", () => {
      const icon = createSingleIcon("rgb(255,0,0)", null);
      const html = (icon.options as { html: string }).html;
      expect(html).toContain("rgb(255,0,0)");
      expect(html).not.toContain("conic-gradient");
    });

    test("creates solid icon when both colors are the same", () => {
      const icon = createSingleIcon("rgb(255,0,0)", "rgb(255,0,0)");
      const html = (icon.options as { html: string }).html;
      expect(html).not.toContain("conic-gradient");
    });

    test("creates split icon when two different colors", () => {
      const icon = createSingleIcon("rgb(255,0,0)", "rgb(0,0,255)");
      const html = (icon.options as { html: string }).html;
      expect(html).toContain("conic-gradient");
      expect(html).toContain("rgb(255,0,0)");
      expect(html).toContain("rgb(0,0,255)");
    });
  });

  describe("createGroupIcon", () => {
    test("returns a Leaflet divIcon with count", () => {
      const icon = createGroupIcon("rgb(255,0,0)", 5);
      const html = (icon.options as { html: string }).html;
      expect(html).toContain("5");
      expect(html).toContain("rgb(255,0,0)");
    });

    test("uses white text by default", () => {
      const icon = createGroupIcon("rgb(255,0,0)", 3);
      const html = (icon.options as { html: string }).html;
      expect(html).toContain("rgb(255,255,255)");
    });

    test("uses custom text color when provided", () => {
      const icon = createGroupIcon("rgb(255,0,0)", 3, "rgb(0,0,0)");
      const html = (icon.options as { html: string }).html;
      expect(html).toContain("rgb(0,0,0)");
    });
  });

  describe("createWorkIcon", () => {
    test("creates single dot for 1 visible work with 1 category", () => {
      const icon = createWorkIcon(new Set(["Dugout"]), 1);
      const html = (icon.options as { html: string }).html;
      expect(html).toContain("10px");
      expect(html).not.toContain("22px");
    });

    test("creates split dot for 1 visible work with 2 categories", () => {
      const icon = createWorkIcon(new Set(["Dugout", "Trench"]), 1);
      const html = (icon.options as { html: string }).html;
      expect(html).toContain("conic-gradient");
    });

    test("creates group icon for multiple visible works with 1 category", () => {
      const icon = createWorkIcon(new Set(["Dugout"]), 3);
      const html = (icon.options as { html: string }).html;
      expect(html).toContain("3");
      expect(html).toContain("22px");
    });

    test("creates pie-chart group icon for multiple categories", () => {
      const icon = createWorkIcon(
        new Set(["Dugout", "Trench", "Infrastructure"]),
        5,
      );
      const html = (icon.options as { html: string }).html;
      expect(html).toContain("5");
      expect(html).toContain("conic-gradient");
    });

    test("creates neutral group icon when no categories", () => {
      const icon = createWorkIcon(new Set(), 3);
      const html = (icon.options as { html: string }).html;
      expect(html).toContain("3");
      expect(html).toContain("rgb(29, 31, 32)");
    });

    test("uses custom color map for localized category names", () => {
      const colorMap = { Abri: "rgb(52, 152, 219)" };
      const icon = createWorkIcon(new Set(["Abri"]), 1, colorMap);
      const html = (icon.options as { html: string }).html;
      expect(html).toContain("rgb(52, 152, 219)");
    });

    test("falls back to CATEGORY_COLORS when not in custom map", () => {
      const icon = createWorkIcon(new Set(["Dugout"]), 1, {});
      const html = (icon.options as { html: string }).html;
      expect(html).toContain("rgb(52, 152, 219)");
    });
  });
});
