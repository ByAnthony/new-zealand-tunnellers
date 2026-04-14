import { getTunneller } from "@/utils/database/getTunneller";
import { armyExperienceQuery } from "@/utils/database/queries/armyExperienceQuery";
import { companyEventsQuery } from "@/utils/database/queries/companyEventsQuery";
import { imageSourceBookAuthorsQuery } from "@/utils/database/queries/imageSourceBookAuthorsQuery";
import { londonGazetteQuery } from "@/utils/database/queries/londonGazetteQuery";
import { medalsQuery } from "@/utils/database/queries/medalsQuery";
import { nzArchivesQuery } from "@/utils/database/queries/nzArchivesQuery";
import { tunnellerEventsQuery } from "@/utils/database/queries/tunnellerEventsQuery";
import { tunnellerQuery } from "@/utils/database/queries/tunnellerQuery";

jest.mock("@/utils/database/queries/tunnellerQuery");
jest.mock("@/utils/database/queries/armyExperienceQuery");
jest.mock("@/utils/database/queries/companyEventsQuery");
jest.mock("@/utils/database/queries/tunnellerEventsQuery");
jest.mock("@/utils/database/queries/medalsQuery");
jest.mock("@/utils/database/queries/nzArchivesQuery");
jest.mock("@/utils/database/queries/londonGazetteQuery");
jest.mock("@/utils/database/queries/imageSourceBookAuthorsQuery");

describe("getTunneller", () => {
  test("returns a plain tunneller profile object", async () => {
    const mockConnection = {};

    (tunnellerQuery as jest.Mock).mockResolvedValue({
      id: 1,
      slug: "john-doe--1",
      serial: "1234",
      forename: "John",
      surname: "Doe",
      birth_date: "1890-01-01",
      death_date: null,
      birth_country: "New Zealand",
      mother_name: null,
      mother_origin: null,
      father_name: null,
      father_origin: null,
      marital_status: null,
      spouse: null,
      work: null,
      employer: null,
      residence: null,
      hometown: null,
      wife_name: null,
      father: null,
      mother: null,
      enlistment_date: "1915-01-01",
      training_start: "1915-01-03",
      training_location: null,
      training_location_type: null,
      embarkation_unit: null,
      embarkation_unit_key: null,
      section: null,
      attached_corps: null,
      embarkation_date: null,
      embarkation_ref: null,
      embarkation_vessel: null,
      posted_date: "1915-01-02",
      posted_from_corps: null,
      posted_unit: null,
      posted_unit_key: null,
      transferred_to_date: null,
      transferred_to_unit: null,
      transport_uk_start: "1915-02-01",
      transport_uk_ref: null,
      transport_uk_vessel: null,
      transport_nz_start: null,
      transport_nz_ref: null,
      transport_nz_vessel: null,
      demobilization_date: null,
      discharge_uk: null,
      has_deserted: 0,
      death_type: null,
      death_type_key: null,
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
      birth_location: null,
      birth_town: null,
      district: null,
      aka: null,
      nz_arrival_year: null,
      nz_arrival_age: null,
      father_country: null,
      mother_country: null,
      image: null,
      image_url: null,
      image_source_type: null,
      family_name: null,
      newspaper_name: null,
      newspaper_date: null,
      book_title: null,
      book_town: null,
      book_publisher: null,
      book_year: null,
      book_page: null,
      rank: "Sapper",
      unit: "New Zealand Tunnelling Company",
      corps: "Tunnellers",
      corps_key: "Tunnellers",
      death_age: null,
      awmm_cenotaph: null,
    });

    (armyExperienceQuery as jest.Mock).mockResolvedValue([]);
    (companyEventsQuery as jest.Mock).mockResolvedValue([]);
    (tunnellerEventsQuery as jest.Mock).mockResolvedValue([]);
    (medalsQuery as jest.Mock).mockResolvedValue([]);
    (nzArchivesQuery as jest.Mock).mockResolvedValue([]);
    (londonGazetteQuery as jest.Mock).mockResolvedValue([]);
    (imageSourceBookAuthorsQuery as jest.Mock).mockResolvedValue([]);

    // @ts-expect-error mocked connection
    const tunneller = await getTunneller("john-doe--1", "en", mockConnection);

    expect(tunneller).toMatchObject({
      id: 1,
      slug: "john-doe--1",
      summary: {
        name: {
          forename: "John",
          surname: "Doe",
        },
      },
      militaryYears: {
        enlistment: {
          rank: "Sapper",
        },
      },
    });
  });
});
