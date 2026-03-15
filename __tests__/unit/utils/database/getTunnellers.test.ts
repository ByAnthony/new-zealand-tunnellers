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
        forename: "John",
        surname: "Doe",
        birthYear: "1940",
        deathYear: "2020",
        detachment: "Main Body",
        rank: "Sapper",
        attached_corps: null,
      },
      {
        id: 2,
        forename: "Jane",
        surname: "Smith",
        birthYear: "1915",
        deathYear: "1999",
        detachment: "2nd Reinforcements",
        rank: "Sapper",
        attached_corps: null,
      },
    ];

    (rollQuery as jest.Mock).mockResolvedValue(mockResults);

    const response = await getTunnellers("en", mockConnection);

    const expectedTunnellers: Tunneller[] = [
      {
        id: 1,
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
        rank: "Sapper",
        attachedCorps: null,
      },
      {
        id: 2,
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
        rank: "Sapper",
        attachedCorps: null,
      },
    ];

    expect(response).toEqual(NextResponse.json(expectedTunnellers));
  });
});
