import { NextResponse } from "next/server";

import { Tunneller, TunnellerData } from "@/types/tunnellers";
import { getTunnellers } from "@/utils/database/getTunnellers";
import { rollQuery } from "@/utils/database/queries/rollQuery";

jest.mock("@/utils/database/queries/rollQuery");

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data) => data),
  },
}));

describe("getTunnellers", () => {
  test("should return a list of tunnellers with full names", async () => {
    const mockConnection = {};
    const mockResults: TunnellerData[] = [
      {
        id: 1,
        slug: "test-tunneller--1_234",
        forename: "John",
        surname: "Doe",
        birthYear: "1940",
        deathYear: "2020",
        detachment: "Main Body",
        detachment_id: 1,
        rank: "Sapper",
        rank_id: 1,
        attached_corps: null,
        corps_id: null,
      },
      {
        id: 2,
        slug: "test-tunneller--1_234",
        forename: "Jane",
        surname: "Smith",
        birthYear: "1915",
        deathYear: "1999",
        detachment: "2nd Reinforcements",
        detachment_id: 2,
        rank: "Sapper",
        rank_id: 1,
        attached_corps: null,
        corps_id: null,
      },
    ];

    (rollQuery as jest.Mock).mockResolvedValue(mockResults);

    // @ts-expect-error: connection is unused as rollQuery is mocked
    const response = await getTunnellers("en", mockConnection);

    const expectedTunnellers: Tunneller[] = [
      {
        id: 1,
        slug: "test-tunneller--1_234",
        name: {
          forename: "John",
          surname: "Doe",
        },
        birthYear: "1940",
        deathYear: "2020",
        search: {
          fullName: "John Doe",
        },
        detachment: "Main Body",
        detachmentId: 1,
        rank: "Sapper",
        rankId: 1,
        attachedCorps: null,
        corpsId: null,
      },
      {
        id: 2,
        slug: "test-tunneller--1_234",
        name: {
          forename: "Jane",
          surname: "Smith",
        },
        birthYear: "1915",
        deathYear: "1999",
        search: {
          fullName: "Jane Smith",
        },
        detachment: "2nd Reinforcements",
        detachmentId: 2,
        rank: "Sapper",
        rankId: 1,
        attachedCorps: null,
        corpsId: null,
      },
    ];

    expect(response).toEqual(NextResponse.json(expectedTunnellers));
  });
});
