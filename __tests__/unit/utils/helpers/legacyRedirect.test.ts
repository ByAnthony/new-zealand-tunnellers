import { PoolConnection } from "mysql2/promise";

import { tunnellerSlugByIdQuery } from "@/utils/database/queries/tunnellerSlugByIdQuery";
import { withConnection } from "@/utils/database/withConnection";
import {
  getLegacyTunnellerRedirectPath,
  legacyPermanentRedirect,
} from "@/utils/helpers/legacyRedirect";

jest.mock("@/utils/database/queries/tunnellerSlugByIdQuery");
jest.mock("@/utils/database/withConnection");
jest.mock("next/server", () => ({
  NextResponse: class MockNextResponse {
    headers: { get: (_name: string) => string | null };
    status: number;

    constructor(
      _body: null,
      init: { headers: { Location?: string }; status: number },
    ) {
      this.status = init.status;
      this.headers = {
        get: (name: string) =>
          name.toLowerCase() === "location"
            ? (init.headers.Location ?? null)
            : null,
      };
    }
  },
}));

describe("legacyRedirect", () => {
  const mockConnection = {} as PoolConnection;
  const mockTunnellerSlugByIdQuery = jest.mocked(tunnellerSlugByIdQuery);
  const mockWithConnection = jest.mocked(withConnection);

  beforeEach(() => {
    jest.clearAllMocks();
    mockWithConnection.mockImplementation(async (callback) =>
      callback(mockConnection),
    );
  });

  test("returns a permanent redirect response with a relative location", () => {
    const response = legacyPermanentRedirect("/tunnellers/john-doe--1/");

    expect(response.status).toBe(308);
    expect(response.headers.get("Location")).toBe("/tunnellers/john-doe--1/");
  });

  test("resolves an English legacy numeric id to the tunneller slug path", async () => {
    mockTunnellerSlugByIdQuery.mockResolvedValue("john-doe--1");

    await expect(getLegacyTunnellerRedirectPath("123", "en")).resolves.toBe(
      "/tunnellers/john-doe--1/",
    );

    expect(mockTunnellerSlugByIdQuery).toHaveBeenCalledWith(
      "123",
      mockConnection,
    );
  });

  test("resolves a French legacy numeric id to the translated tunneller slug path", async () => {
    mockTunnellerSlugByIdQuery.mockResolvedValue("john-doe--1");

    await expect(getLegacyTunnellerRedirectPath("123", "fr")).resolves.toBe(
      "/fr/tunnellers/john-doe--1/",
    );
  });

  test("falls back to the roll when the legacy id is missing", async () => {
    await expect(getLegacyTunnellerRedirectPath(null, "en")).resolves.toBe(
      "/tunnellers/",
    );

    expect(mockWithConnection).not.toHaveBeenCalled();
  });

  test("falls back to the translated roll when the legacy id is not numeric", async () => {
    await expect(getLegacyTunnellerRedirectPath("abc", "fr")).resolves.toBe(
      "/fr/tunnellers/",
    );

    expect(mockWithConnection).not.toHaveBeenCalled();
  });

  test("falls back to the roll when the legacy id does not match a tunneller", async () => {
    mockTunnellerSlugByIdQuery.mockResolvedValue(null);

    await expect(getLegacyTunnellerRedirectPath("99999", "en")).resolves.toBe(
      "/tunnellers/",
    );
  });
});
