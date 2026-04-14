import { redirect } from "next/navigation";

import { getTunneller } from "@/utils/database/getTunneller";
import { getTunnellerBySlug } from "@/utils/database/getTunnellerBySlug";
import { tunnellerSlugByIdQuery } from "@/utils/database/queries/tunnellerSlugByIdQuery";
import { withConnection } from "@/utils/database/withConnection";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/utils/database/getTunneller");
jest.mock("@/utils/database/queries/tunnellerSlugByIdQuery");
jest.mock("@/utils/database/withConnection");

describe("getTunnellerBySlug", () => {
  const mockConnection = {};
  const mockRedirect = jest.mocked(redirect);
  const mockGetTunneller = jest.mocked(getTunneller);
  const mockTunnellerSlugByIdQuery = jest.mocked(tunnellerSlugByIdQuery);
  const mockWithConnection = jest.mocked(withConnection);

  beforeEach(() => {
    jest.clearAllMocks();
    mockWithConnection.mockImplementation(async (callback) =>
      callback(mockConnection),
    );
  });

  test("redirects numeric slugs to the profile route", async () => {
    mockTunnellerSlugByIdQuery.mockResolvedValue("john-doe--1");
    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(getTunnellerBySlug("1", "en")).rejects.toThrow(
      "NEXT_REDIRECT",
    );

    expect(mockTunnellerSlugByIdQuery).toHaveBeenCalledWith(
      "1",
      mockConnection,
    );
    expect(mockRedirect).toHaveBeenCalledWith("/tunnellers/john-doe--1");
    expect(mockGetTunneller).not.toHaveBeenCalled();
  });

  test("redirects numeric slugs to the timeline route", async () => {
    mockTunnellerSlugByIdQuery.mockResolvedValue("john-doe--1");
    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(getTunnellerBySlug("1", "fr", "timeline")).rejects.toThrow(
      "NEXT_REDIRECT",
    );

    expect(mockRedirect).toHaveBeenCalledWith(
      "/fr/tunnellers/john-doe--1/wwi-timeline",
    );
    expect(mockGetTunneller).not.toHaveBeenCalled();
  });

  test("returns tunneller data for non-numeric slugs", async () => {
    const tunneller = { slug: "john-doe--1" };
    mockGetTunneller.mockResolvedValue(tunneller as never);

    await expect(getTunnellerBySlug("john-doe--1", "en")).resolves.toBe(
      tunneller,
    );

    expect(mockTunnellerSlugByIdQuery).not.toHaveBeenCalled();
    expect(mockGetTunneller).toHaveBeenCalledWith(
      "john-doe--1",
      "en",
      mockConnection,
    );
  });

  test("falls through to getTunneller when numeric slug lookup misses", async () => {
    const tunneller = { slug: "1" };
    mockTunnellerSlugByIdQuery.mockResolvedValue(null);
    mockGetTunneller.mockResolvedValue(tunneller as never);

    await expect(getTunnellerBySlug("1", "en")).resolves.toBe(tunneller);

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockGetTunneller).toHaveBeenCalledWith("1", "en", mockConnection);
  });
});
