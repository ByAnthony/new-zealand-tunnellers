import { mockTunnellers } from "__tests__/unit/utils/mocks/mockTunnellers";

import { getUniqueDetachments } from "@/components/Roll/utils/detachmentUtils";
import { Tunneller } from "@/types/tunnellers";

describe("getUniqueDetachments", () => {
  test("returns unique detachments sorted correctly", () => {
    const result = getUniqueDetachments(Object.entries(mockTunnellers));
    expect(result).toEqual([
      { id: 1, label: "Main Body" },
      { id: 2, label: "2nd Reinforcements" },
      { id: 5, label: "5th Reinforcements" },
    ]);
  });

  test("handles empty list", () => {
    const result = getUniqueDetachments([]);
    expect(result).toEqual([]);
  });

  test("sorts French detachments with Corps principal first", () => {
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
            detachment: "3^e renfort",
            detachmentId: 3,
            rank: "Sapeur",
            rankId: 1,
            attachedCorps: null,
            corpsId: null,
          },
          {
            id: 2,
            name: { forename: "Jane", surname: "Smith" },
            birthYear: null,
            deathYear: null,
            search: { fullName: "Jane Smith" },
            detachment: "Corps principal",
            detachmentId: 10,
            rank: "Sapeur",
            rankId: 1,
            attachedCorps: null,
            corpsId: null,
          },
          {
            id: 3,
            name: { forename: "Bob", surname: "Jones" },
            birthYear: null,
            deathYear: null,
            search: { fullName: "Bob Jones" },
            detachment: "1^er renfort",
            detachmentId: 1,
            rank: "Sapeur",
            rankId: 1,
            attachedCorps: null,
            corpsId: null,
          },
        ],
      ],
    ];

    const result = getUniqueDetachments(tunnellers);

    expect(result).toEqual([
      { id: 10, label: "Corps principal" },
      { id: 1, label: "1^er renfort" },
      { id: 3, label: "3^e renfort" },
    ]);
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
            detachmentId: 20,
            rank: "Sapper",
            rankId: 1,
            attachedCorps: null,
            corpsId: null,
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
            detachmentId: 21,
            rank: "Driver",
            rankId: 2,
            attachedCorps: null,
            corpsId: null,
          },
        ],
      ],
    ];

    const result = getUniqueDetachments(tunnellers);

    expect(result).toEqual([
      { id: 21, label: "Another Unit" },
      { id: 20, label: "Special Unit" },
    ]);
  });
});
