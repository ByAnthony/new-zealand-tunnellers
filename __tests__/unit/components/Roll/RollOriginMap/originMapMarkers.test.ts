import { getOriginMarkers } from "@/components/Roll/RollOriginMap/originMapMarkers";
import { mockTunnellers } from "@/test-utils/mocks/mockTunnellers";

describe("getOriginMarkers", () => {
  test("groups tunnellers by residence coordinates", () => {
    expect(getOriginMarkers(mockTunnellers)).toEqual([
      {
        town: "Auckland",
        latitude: -36.8485,
        longitude: 174.7633,
        count: 2,
      },
      {
        town: "Waihi",
        latitude: -37.3919,
        longitude: 175.8406,
        count: 1,
      },
    ]);
  });
});
