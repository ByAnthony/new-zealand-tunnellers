import { mockTunnellers } from "__tests__/unit/utils/mocks/mockTunnellers";

import { getUniqueCorps } from "@/components/Roll/utils/corpsUtils";
import { Tunneller } from "@/types/tunnellers";

describe("getUniqueDetachments", () => {
  test("returns unique detachments sorted correctly", () => {
    const result = getUniqueCorps(Object.entries(mockTunnellers));
    expect(result).toEqual(["Tunnelling Corps", "Army Pay Corps"]);
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
            name: { forename: "John", surname: "Doe" },
            birthYear: null,
            deathYear: null,
            search: { fullName: "John Doe" },
            detachment: "Main Body",
            rank: "Sapper",
            attachedCorps: "Royal Engineers",
          },
        ],
      ],
      [
        "B",
        [
          {
            id: 2,
            name: { forename: "Jane", surname: "Smith" },
            birthYear: null,
            deathYear: null,
            search: { fullName: "Jane Smith" },
            detachment: "Main Body",
            rank: "Driver",
            attachedCorps: "Army Pay Corps",
          },
        ],
      ],
    ];

    const result = getUniqueCorps(tunnellers);

    expect(result).toEqual(["Army Pay Corps", "Royal Engineers"]);
  });
});
