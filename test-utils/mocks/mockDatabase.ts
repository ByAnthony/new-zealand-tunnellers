import type { FieldPacket, PoolConnection } from "mysql2/promise";

export type DatabaseExec<T> = jest.Mock<
  Promise<[T[], FieldPacket[]]>,
  [_sql: string, _vals?: readonly string[]]
>;

export type MockDatabase<T> = {
  db: PoolConnection;
  exec: DatabaseExec<T>;
};

export function mockDatabase<T = unknown>(rows: T[] = []): MockDatabase<T> {
  const exec: DatabaseExec<T> = jest.fn(
    async (
      _sql: string,
      _vals?: readonly string[],
    ): Promise<[T[], FieldPacket[]]> => [rows, []],
  );

  const db = { execute: exec } as unknown as PoolConnection;
  return { db, exec };
}
