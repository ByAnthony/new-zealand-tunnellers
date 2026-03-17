import mysql from "mysql2/promise";

// Mock mysql2/promise at the top level
jest.mock("mysql2/promise", () => ({
  createPool: jest.fn().mockReturnValue({
    getConnection: jest.fn(),
  }),
}));

process.env.MYSQL_HOST = "localhost";
process.env.MYSQL_USER = "user";
process.env.MYSQL_PASSWORD = "password";
process.env.MYSQL_DATABASE = "database";
process.env.MYSQL_PORT = "3306";

describe("mysqlConnection", () => {
  beforeEach(() => {
    // Reset the mock to ensure clean state
    (mysql.createPool as jest.Mock).mockClear();
  });

  test("creates a MySQL pool with the correct configuration", async () => {
    // Dynamically import the module to ensure it uses the mock
    const { mysqlConnection } = await jest.requireActual(
      "@/utils/database/mysqlConnection",
    );

    await mysqlConnection.getConnection();

    expect(mysql.createPool).toHaveBeenCalledWith({
      connectionLimit: 100,
      host: "localhost",
      user: "user",
      password: "password",
      database: "database",
      port: 3306,
      waitForConnections: true,
    });
  });
});
