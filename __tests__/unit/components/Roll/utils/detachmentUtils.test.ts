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
            slug: "test-tunneller--1_234",
            name: { forename: "John", surname: "Doe" },
            birthYear: null,
            deathYear: null,
            search: { fullName: "John Doe" },
            detachment: "3^e renfort",
            detachmentEn: null,
            detachmentId: 3,
            rank: "Sapeur",
            rankEn: null,
            rankId: 1,
            attachedCorps: null,
            corpsEn: null,
            corpsId: null,
          },
          {
            id: 2,
            slug: "test-tunneller--1_234",
            name: { forename: "Jane", surname: "Smith" },
            birthYear: null,
            deathYear: null,
            search: { fullName: "Jane Smith" },
            detachment: "Corps principal",
            detachmentEn: null,
            detachmentId: 10,
            rank: "Sapeur",
            rankEn: null,
            rankId: 1,
            attachedCorps: null,
            corpsEn: null,
            corpsId: null,
          },
          {
            id: 3,
            slug: "test-tunneller--1_234",
            name: { forename: "Bob", surname: "Jones" },
            birthYear: null,
            deathYear: null,
            search: { fullName: "Bob Jones" },
            detachment: "1^er renfort",
            detachmentEn: null,
            detachmentId: 1,
            rank: "Sapeur",
            rankEn: null,
            rankId: 1,
            attachedCorps: null,
            corpsEn: null,
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
            slug: "test-tunneller--1_234",
            name: { forename: "John", surname: "Doe" },
            birthYear: null,
            deathYear: null,
            search: { fullName: "John Doe" },
            detachment: "Special Unit",
            detachmentEn: "Special Unit",
            detachmentId: 20,
            rank: "Sapper",
            rankEn: "Sapper",
            rankId: 1,
            attachedCorps: null,
            corpsEn: null,
            corpsId: null,
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
            detachment: "Another Unit",
            detachmentEn: "Another Unit",
            detachmentId: 21,
            rank: "Driver",
            rankEn: "Driver",
            rankId: 2,
            attachedCorps: null,
            corpsEn: null,
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
