import { mockTunnellers } from "__tests__/unit/utils/mocks/mockTunnellers";

import { getUniqueDetachments } from "@/components/Roll/utils/detachmentUtils";
import { Tunneller } from "@/types/tunnellers";

describe("getUniqueDetachments", () => {
  test("returns unique detachments sorted correctly", () => {
    const result = getUniqueDetachments(Object.entries(mockTunnellers));
    expect(result).toEqual([
      "Main Body",
      "2nd Reinforcements",
      "5th Reinforcements",
    ]);
  });

  test("handles empty list", () => {
    const result = getUniqueDetachments([]);
    expect(result).toEqual([]);
  });

  test("sorts non-Reinforcement detachments alphabetically", () => {
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
            detachment: "Special Unit",
            rank: "Sapper",
            attachedCorps: null,
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
            detachment: "Another Unit",
            rank: "Driver",
            attachedCorps: null,
          },
        ],
      ],
    ];

    const result = getUniqueDetachments(tunnellers);

    expect(result).toEqual(["Another Unit", "Special Unit"]);
  });
});
