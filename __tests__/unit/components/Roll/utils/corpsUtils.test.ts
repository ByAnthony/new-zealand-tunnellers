import { mockTunnellers } from "__tests__/unit/utils/mocks/mockTunnellers";

import { getUniqueCorps } from "@/components/Roll/utils/corpsUtils";
import { Tunneller } from "@/types/tunnellers";

describe("getUniqueDetachments", () => {
  test("returns unique detachments sorted correctly", () => {
    const result = getUniqueCorps(Object.entries(mockTunnellers));
    expect(result).toEqual([
      { id: null, label: "Tunnelling Corps" },
      { id: 3, label: "Army Pay Corps" },
    ]);
  });

  test("handles empty list", () => {
    const result = getUniqueCorps([]);
    expect(result).toEqual([]);
  });

  test("sorts multiple non-Tunnelling Corps entries alphabetically", () => {
    const tunnellers: [string, Tunneller[]][] = [
      [
        "A",
        [
          {
            id: 1,
            slug: "test-tunneller--1_234",
            name: { forename: "John", surname: "Doe" },
            birthYear: null,
            deathYear: null,
            search: { fullName: "John Doe" },
            detachment: "Main Body",
            detachmentEn: "Main Body",
            detachmentId: 1,
            rank: "Sapper",
            rankEn: "Sapper",
            rankId: 1,
            attachedCorps: "Royal Engineers",
            corpsEn: "Royal Engineers",
            corpsId: 5,
          },
        ],
      ],
      [
        "B",
        [
          {
            id: 2,
            slug: "test-tunneller--1_234",
            name: { forename: "Jane", surname: "Smith" },
            birthYear: null,
            deathYear: null,
            search: { fullName: "Jane Smith" },
            detachment: "Main Body",
            detachmentEn: "Main Body",
            detachmentId: 1,
            rank: "Driver",
            rankEn: "Driver",
            rankId: 2,
            attachedCorps: "Army Pay Corps",
            corpsEn: "Army Pay Corps",
            corpsId: 3,
          },
        ],
      ],
    ];

    const result = getUniqueCorps(tunnellers);

    expect(result).toEqual([
      { id: 3, label: "Army Pay Corps" },
      { id: 5, label: "Royal Engineers" },
    ]);
  });
});
