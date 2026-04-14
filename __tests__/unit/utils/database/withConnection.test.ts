import { mysqlConnection } from "@/utils/database/mysqlConnection";
import { withConnection } from "@/utils/database/withConnection";

jest.mock("@/utils/database/mysqlConnection", () => ({
  mysqlConnection: {
    getConnection: jest.fn(),
  },
}));

describe("withConnection", () => {
  const mockGetConnection = jest.mocked(mysqlConnection.getConnection);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns the callback result and releases the connection", async () => {
    const release = jest.fn();
    const connection = { release };
    mockGetConnection.mockResolvedValue(connection as never);

    const result = await withConnection(async (receivedConnection) => {
      expect(receivedConnection).toBe(connection);
      return "ok";
    });

    expect(result).toBe("ok");
    expect(release).toHaveBeenCalledTimes(1);
  });

  test("releases the connection when the callback throws", async () => {
    const release = jest.fn();
    const connection = { release };
    mockGetConnection.mockResolvedValue(connection as never);

    await expect(
      withConnection(async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    expect(release).toHaveBeenCalledTimes(1);
  });
});
