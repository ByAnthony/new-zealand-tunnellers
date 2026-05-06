import {
  getOriginMarkerRadius,
  getOriginMarkerStyle,
  getOriginMapSummary,
  getOriginMarkers,
} from "@/components/Roll/RollOriginMap/originMapMarkers";
import {
  mockTunnellers,
  mockTunnellersData,
} from "@/test-utils/mocks/mockTunnellers";
import { Tunneller } from "@/types/tunnellers";

describe("origin map markers", () => {
  test("groups tunnellers by residence coordinates", () => {
    expect(getOriginMarkers(mockTunnellers)).toEqual([
      {
        town: "Auckland",
        latitude: -36.8485,
        longitude: 174.7633,
        count: 2,
        tunnellers: [mockTunnellersData[0], mockTunnellersData[1]],
      },
      {
        town: "Waihi",
        latitude: -37.3919,
        longitude: 175.8406,
        count: 1,
        tunnellers: [mockTunnellersData[3]],
      },
    ]);
  });

  test("summarises visible, mapped, and missing origin counts", () => {
    expect(getOriginMapSummary(mockTunnellers)).toEqual({
      markers: getOriginMarkers(mockTunnellers),
      visibleCount: 4,
      mappedCount: 3,
      missingOriginCount: 1,
      missingOriginTunnellers: [mockTunnellersData[2]],
    });
  });

  test("treats tunnellers without an origin object as missing origin", () => {
    const tunnellerWithoutOrigin = {
      ...mockTunnellersData[1],
      origin: undefined,
    } as unknown as Tunneller;

    expect(
      getOriginMapSummary({
        ...mockTunnellers,
        D: [tunnellerWithoutOrigin],
      }),
    ).toMatchObject({
      visibleCount: 4,
      mappedCount: 2,
      missingOriginCount: 2,
      missingOriginTunnellers: [tunnellerWithoutOrigin, mockTunnellersData[2]],
    });
  });

  test("scales marker radius by count with a cap", () => {
    expect(getOriginMarkerRadius(1)).toBe(7);
    expect(getOriginMarkerRadius(2)).toBe(10);
    expect(getOriginMarkerRadius(100)).toBe(28);
  });

  test("returns selected and default marker styles", () => {
    expect(getOriginMarkerStyle(false)).toEqual({
      color: "rgba(255, 255, 255, 0.85)",
      fillColor: "rgb(153, 131, 100)",
      fillOpacity: 0.85,
      weight: 1,
    });
    expect(getOriginMarkerStyle(true)).toEqual({
      color: "rgb(255, 255, 255)",
      fillColor: "rgb(255, 255, 255)",
      fillOpacity: 1,
      weight: 2,
    });
  });
});
