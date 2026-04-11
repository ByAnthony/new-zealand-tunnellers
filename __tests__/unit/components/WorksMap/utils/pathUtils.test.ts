import { groupPathsBySegment } from "@/components/WorksMap/utils/pathUtils";

describe("groupPathsBySegment", () => {
  test("groups points by id and segment", () => {
    const paths = [
      { id: 1, segment: 0, latitude: 50.1, longitude: 2.1 },
      { id: 1, segment: 0, latitude: 50.2, longitude: 2.2 },
      { id: 1, segment: 1, latitude: 50.3, longitude: 2.3 },
    ];
    const result = groupPathsBySegment(paths, (p) => p.id);
    expect(result.size).toBe(2);
    expect(result.get("1-0")!.points).toEqual([
      [50.1, 2.1],
      [50.2, 2.2],
    ]);
    expect(result.get("1-1")!.points).toEqual([[50.3, 2.3]]);
  });

  test("groups points from multiple ids independently", () => {
    const paths = [
      { id: 1, segment: 0, latitude: 50.1, longitude: 2.1 },
      { id: 2, segment: 0, latitude: 50.4, longitude: 2.4 },
    ];
    const result = groupPathsBySegment(paths, (p) => p.id);
    expect(result.get("1-0")!.id).toBe(1);
    expect(result.get("2-0")!.id).toBe(2);
  });

  test("coerces latitude and longitude to numbers", () => {
    const paths = [
      {
        id: 1,
        segment: 0,
        latitude: "50.1" as unknown as number,
        longitude: "2.1" as unknown as number,
      },
    ];
    const result = groupPathsBySegment(paths, (p) => p.id);
    expect(result.get("1-0")!.points).toEqual([[50.1, 2.1]]);
  });

  test("returns empty map for empty input", () => {
    const result = groupPathsBySegment<{
      id: number;
      segment: number;
      latitude: number;
      longitude: number;
    }>([], (p) => p.id);
    expect(result.size).toBe(0);
  });
});
