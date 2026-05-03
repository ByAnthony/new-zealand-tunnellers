import {
  getUniqueMaritalStatuses,
  getUniqueMaritalStatusesEn,
} from "@/components/Roll/utils/maritalStatusUtils";
import { mockTunnellers } from "@/test-utils/mocks/mockTunnellers";
import { Tunneller } from "@/types/tunnellers";

const baseTunneller = mockTunnellers.D[0];
const statusTunneller = (
  maritalStatusId: number | null,
  maritalStatus: string | null,
  maritalStatusEn = maritalStatus,
): Tunneller => ({
  ...baseTunneller,
  maritalStatusId,
  maritalStatus,
  maritalStatusEn,
});

const allStatuses: [string, Tunneller[]][] = [
  [
    "A",
    [
      statusTunneller(3, "Widower"),
      statusTunneller(null, null),
      statusTunneller(4, "Separated"),
      statusTunneller(2, "Married"),
      statusTunneller(1, "Single"),
    ],
  ],
];

describe("getUniqueMaritalStatuses", () => {
  test("returns unique marital statuses in display order", () => {
    const result = getUniqueMaritalStatuses(allStatuses);

    expect(result).toEqual([
      { id: 1, label: "Single" },
      { id: 2, label: "Married" },
      { id: 4, label: "Separated" },
      { id: 3, label: "Widower" },
    ]);
  });

  test("handles empty list", () => {
    expect(getUniqueMaritalStatuses([])).toEqual([]);
  });
});

describe("getUniqueMaritalStatusesEn", () => {
  test("returns English lookup labels for URL params", () => {
    const result = getUniqueMaritalStatusesEn(allStatuses);

    expect(result).toEqual([
      { id: 1, label: "Single" },
      { id: 2, label: "Married" },
      { id: 4, label: "Separated" },
      { id: 3, label: "Widower" },
    ]);
  });
});
