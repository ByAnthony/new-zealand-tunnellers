import { getUniqueCorps } from "@/components/Roll/utils/corpsUtils";
import { mockTunnellers } from "__tests__/unit/utils/mocks/mockTunnellers";

describe("getUniqueDetachments", () => {
  test("returns unique detachments sorted correctly", () => {
    const result = getUniqueCorps(Object.entries(mockTunnellers));
    expect(result).toEqual(["Tunnelling Corps", "Army Pay Corps"]);
  });

  test("handles empty list", () => {
    const result = getUniqueCorps([]);
    expect(result).toEqual([]);
  });
});
