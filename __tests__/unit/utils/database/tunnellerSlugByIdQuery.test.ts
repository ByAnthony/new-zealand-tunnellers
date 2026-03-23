import { tunnellerSlugByIdQuery } from "@/utils/database/queries/tunnellerSlugByIdQuery";

const mockExecute = jest.fn();
const mockConnection = { execute: mockExecute };

describe("tunnellerSlugByIdQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns the slug when a tunneller with the given id exists", async () => {
    mockExecute.mockResolvedValue([[{ slug: "harry-corrin--4_1415" }]]);

    const result = await tunnellerSlugByIdQuery(
      "162",
      // @ts-expect-error: mocked connection
      mockConnection,
    );

    expect(result).toBe("harry-corrin--4_1415");
  });

  test("returns null when no tunneller is found for the given id", async () => {
    mockExecute.mockResolvedValue([[]]);

    const result = await tunnellerSlugByIdQuery(
      "99999",
      // @ts-expect-error: mocked connection
      mockConnection,
    );

    expect(result).toBeNull();
  });
});
