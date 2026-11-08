import type { PoolConnection } from "mysql2/promise";

import type { Locale } from "@/types/locale";

import { mockDatabase, type DatabaseExec } from "./mocks/mockDatabase";

export type SqlCase = Readonly<{ type: string; val: string }>;
export type BadLoc = Readonly<{ type: string; loc: string }>;
export type IdQuery = (
  val: string,
  loc: Locale,
  db: PoolConnection,
) => Promise<unknown>;

export const locs: readonly Locale[] = ["en", "fr"];

export const attacks: readonly SqlCase[] = [
  { type: "single quote", val: "x'y" },
  { type: "double quote", val: 'x"y' },
  { type: "backtick", val: "x`y" },
  { type: "backslash escape", val: "x\\'y" },
  { type: "mixed quotes", val: `x" OR "1"="1' OR '1'='1` },
  { type: "boolean true", val: `' OR '1'='1` },
  { type: "double-quoted tautology", val: `" OR "1"="1` },
  { type: "double-quoted false condition", val: `" AND "1"="2` },
  { type: "double-quoted comment", val: `" OR 1=1 -- ` },
  { type: "double-quoted UNION-style", val: `" UNION SELECT 1, 2 -- ` },
  { type: "double-quoted stacked statements", val: `"; SELECT 1; -- ` },
  { type: "boolean false", val: `' AND '1'='2` },
  { type: "line comment", val: `' OR 1=1 -- ` },
  { type: "hash comment", val: `' OR 1=1 #` },
  { type: "block comment", val: `'/**/OR/**/1=1 -- ` },
  { type: "UNION-style", val: `' UNION SELECT NULL -- ` },
  { type: "stacked statements", val: `'; SELECT 1; -- ` },
  { type: "time-based", val: `' OR SLEEP(1) -- ` },
  { type: "error-based", val: `' AND 1/0 -- ` },
  { type: "subquery", val: `' OR EXISTS(SELECT 1) -- ` },
  { type: "hex literal", val: `' OR 0x31=0x31 -- ` },
  { type: "mixed-case keyword", val: `' oR 1=1 -- ` },
  { type: "parenthesized condition", val: `') OR ('1'='1` },
  { type: "multiline", val: `x'\nOR\t1=1\r-- ` },
];

export const edges: readonly SqlCase[] = [
  { type: "empty", val: "" },
  { type: "whitespace-only", val: " \t\n " },
  { type: "ordinary ID or slug", val: "jane-doe--1_234" },
  { type: "numeric", val: "12345" },
  { type: "percent/wildcards", val: "x%_y" },
  { type: "URL-encoded", val: "%27%20OR%201%3D1" },
  { type: "double URL-encoded", val: "%2527%2520OR" },
  { type: "HTML entity", val: "&#39; OR 1=1" },
  { type: "NUL", val: "x\u0000y" },
  { type: "control characters", val: "x\b\fy" },
  { type: "Unicode", val: "Émile-漢字-💠" },
  { type: "Unicode quotes", val: "＇＂‘’“”" },
  { type: "backslashes", val: '\\\\\\"' },
  { type: "long input", val: "x".repeat(8192) },
];

export const badLocs: readonly BadLoc[] = [
  { type: "empty locale", loc: "" },
  { type: "unsupported locale", loc: "de" },
  { type: "case variation", loc: "EN" },
  { type: "identifier injection", loc: "en` FROM article -- " },
  { type: "SQL expression", loc: "en, (SELECT 1) AS extra" },
];

export async function makeSqlRefs(run: IdQuery): Promise<Map<Locale, string>> {
  const refs = new Map<Locale, string>();

  for (const loc of locs) {
    const { db, exec } = mockDatabase();
    await run("baseline-id", loc, db);

    const sql: string = exec.mock.calls[0]?.[0];
    if (sql === undefined) throw new Error(`Missing SQL for ${loc}`);
    refs.set(loc, sql);
  }

  return refs;
}

export function refSql(refs: ReadonlyMap<Locale, string>, loc: Locale): string {
  const sql: string | undefined = refs.get(loc);
  if (sql === undefined) throw new Error(`Missing SQL baseline: ${loc}`);
  return sql;
}

export function expectBound<T>(
  exec: DatabaseExec<T>,
  val: string,
  sqlRef: string,
  where: RegExp,
  cols: readonly string[] = [],
): void {
  expect(exec).toHaveBeenCalledTimes(1);

  const [sql, vals] = exec.mock.calls[0];

  expect(sql).toMatch(where);
  expect(sql.match(/\?/g)).toHaveLength(1);
  expect(sql).toBe(sqlRef);
  expect(vals).toEqual([val]);

  for (const col of cols) expect(sql).toContain(col);
}
