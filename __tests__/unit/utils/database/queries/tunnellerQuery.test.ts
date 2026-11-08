import { mockDatabase } from "@/test-utils/mocks/mockDatabase";
import {
  attacks,
  badLocs,
  edges,
  expectBound,
  locs,
  makeSqlRefs,
  refSql,
} from "@/test-utils/sqlSecurity";
import type { Locale } from "@/types/locale";
import type { ProfileData } from "@/types/tunneller";
import { tunnellerQuery } from "@/utils/database/queries/tunnellerQuery";

const row: ProfileData = {
  id: 1,
  slug: "kaiser-wilhelm--1_234",
  surname: "Wilhelm",
  forename: "Kaiser",
  birth_date: null,
  birth_year: "1889",
  death_date: null,
  birth_country: "New Zealand",
  mother_name: null,
  mother_origin: null,
  father_name: null,
  father_origin: null,
  nz_resident_in_month: null,
  enlistment_date: null,
  posted_date: null,
  occupation: null,
  employer: null,
  residence: null,
  marital_status: null,
  wife_name: null,
  serial: "TEST-1",
  rank: "Sapper",
  district: null,
  aka: null,
  posted_from_corps: null,
  embarkation_unit: "Main Body",
  embarkation_unit_key: "Main Body",
  training_start: "1915-01-01",
  training_location: "Falmouth",
  training_location_type: "Camp",
  section: null,
  attached_corps: null,
  transport_uk_ref: "",
  transport_uk_vessel: "",
  transport_uk_start: "1915-01-01",
  has_deserted: 0,
  transferred_to_date: null,
  transferred_to_unit: null,
  death_type: null,
  death_type_key: null,
  transport_nz_ref: null,
  transport_nz_vessel: null,
  transport_nz_start: null,
  demobilization_date: null,
  discharge_uk: null,
  death_location: null,
  death_town: null,
  death_country: null,
  death_cause: null,
  death_cause_key: null,
  death_circumstances: null,
  cemetery: null,
  cemetery_town: null,
  cemetery_country: null,
  grave: null,
  awmm_cenotaph: null,
  nominal_roll_volume: null,
  nominal_roll_number: null,
  nominal_roll_page: "",
  image: null,
  image_source_auckland_libraries: null,
  archives_name: null,
  archives_ref: null,
  family_name: null,
  newspaper_name: null,
  newspaper_date: null,
  book_title: null,
  book_town: null,
  book_publisher: null,
  book_year: null,
  book_page: null,
};

describe("tunnellerQuery SQL parameterization", (): void => {
  const where = /\bWHERE\s+t\.slug\s*=\s*\?\s*$/i;
  let refs: ReadonlyMap<Locale, string>;

  beforeAll(async (): Promise<void> => {
    refs = await makeSqlRefs(tunnellerQuery);
  });

  test.each(attacks)(
    "binds $type SQLi text",
    async ({ val }: Readonly<{ type: string; val: string }>): Promise<void> => {
      for (const loc of locs) {
        const { db, exec } = mockDatabase();
        await tunnellerQuery(val, loc, db);
        expectBound(exec, val, refSql(refs, loc), where);
      }
    },
  );

  test.each(edges)(
    "binds $type edge-case slug",
    async ({ val }: Readonly<{ type: string; val: string }>): Promise<void> => {
      for (const loc of locs) {
        const { db, exec } = mockDatabase();
        await tunnellerQuery(val, loc, db);
        expectBound(exec, val, refSql(refs, loc), where);
      }
    },
  );

  test.each(locs)(
    "selects only supported %s columns",
    async (loc: Locale): Promise<void> => {
      const { db, exec } = mockDatabase();
      await tunnellerQuery(row.slug, loc, db);

      const cols = [
        `birth_country.country_${loc} AS birth_country`,
        `mother_origin.country_${loc} AS mother_origin`,
        `father_origin.country_${loc} AS father_origin`,
        `occupation.occupation_${loc} AS occupation`,
        `marital_status.marital_status_${loc} AS marital_status`,
        `rank.rank_${loc} AS rank`,
        `section.section_${loc} AS section`,
        `cemetery.cemetery_name_${loc} AS cemetery`,
        `archives_name.archives_name_${loc} AS archives_name`,
      ] as const;

      expectBound(exec, row.slug, refSql(refs, loc), where, cols);
    },
  );

  test.each(badLocs)(
    "rejects $type before SQL execution",
    async ({ loc }: Readonly<{ type: string; loc: string }>): Promise<void> => {
      const { db, exec } = mockDatabase();
      await expect(tunnellerQuery(row.slug, loc as Locale, db)).rejects.toThrow(
        "Invalid locale",
      );
      expect(exec).not.toHaveBeenCalled();
    },
  );

  test("returns exactly the first matching profile", async (): Promise<void> => {
    const next: ProfileData = {
      ...row,
      id: 2,
      slug: "john-doe--2_345",
      forename: "John",
    };
    const { db, exec } = mockDatabase([row, next]);

    await expect(tunnellerQuery(row.slug, "en", db)).resolves.toBe(row);
    expectBound(exec, row.slug, refSql(refs, "en"), where);
  });

  test("returns undefined for no matching profile", async (): Promise<void> => {
    const { db, exec } = mockDatabase([]);
    await expect(
      tunnellerQuery("does-not-exist", "en", db),
    ).resolves.toBeUndefined();
    expectBound(exec, "does-not-exist", refSql(refs, "en"), where);
  });

  test("propagates database errors without retrying", async (): Promise<void> => {
    const { db, exec } = mockDatabase();
    const err = new Error("Mock database failure");
    exec.mockRejectedValueOnce(err);

    await expect(tunnellerQuery(row.slug, "en", db)).rejects.toBe(err);
    expectBound(exec, row.slug, refSql(refs, "en"), where);
  });
});
