import {
  getOriginMapSummary,
  getOriginMarkers,
} from "@/components/Roll/RollOriginMap/originMapMarkers";
import {
  mockTunnellers,
  mockTunnellersData,
} from "@/test-utils/mocks/mockTunnellers";

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
});
