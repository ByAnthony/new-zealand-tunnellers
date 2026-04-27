import { PoolConnection } from "mysql2/promise";

import { Locale } from "@/types/locale";
import {
  ProfileData,
  ArmyExperience,
  SingleEventData,
  Medal,
  NzArchives,
  LondonGazette,
  Author,
  JoinEventData,
  DeathData,
  TunnellerProfile,
} from "@/types/tunneller";

import { armyExperienceQuery } from "./queries/armyExperienceQuery";
import { companyEventsQuery } from "./queries/companyEventsQuery";
import { imageSourceBookAuthorsQuery } from "./queries/imageSourceBookAuthorsQuery";
import { londonGazetteQuery } from "./queries/londonGazetteQuery";
import { medalsQuery } from "./queries/medalsQuery";
import { nzArchivesQuery } from "./queries/nzArchivesQuery";
import { tunnellerEventsQuery } from "./queries/tunnellerEventsQuery";
import { tunnellerQuery } from "./queries/tunnellerQuery";
import { getYear, getDate, getAge } from "../helpers/date";
import {
  getDeath,
  isWarInjuriesDeathAfterWar,
  getDeathPlace,
  getDeathCause,
  getCemetery,
} from "../helpers/death";
import {
  getImage,
  getImageSource,
  getImageSourceAucklandLibraries,
  getImageSourceArchives,
  getImageSourceFamily,
  getImageSourceNewspaper,
  getImageSourceBook,
  getImageSourceBookAuthors,
  getImageSourceBookPage,
} from "../helpers/image";
import {
  getDemobilization,
  getWarDeathEvents,
  getEventStartDate,
  getEventEndDate,
  getTransferred,
  getAgeAtEnlistment,
  getTransport,
  getFrontEvents,
  getJoinEvents,
  isDeserter,
  isDeathWar,
  getDemobilizationSummaryInfo,
  getDischargedCountry,
} from "../helpers/militaryYears";
import { getParent, getNzResident } from "../helpers/origin";
import { getArmyExperience } from "../helpers/preWarYears";
import {
  getNzArchives,
  getAwmm,
  getNominalRoll,
  getLondonGazette,
} from "../helpers/sources";

export async function getTunneller(
  slug: string,
  locale: Locale,
  connection: PoolConnection,
) {
  const profile: ProfileData = await tunnellerQuery(slug, locale, connection);
  const id = profile.id.toString();
  const armyExperience: ArmyExperience[] = await armyExperienceQuery(
    id,
    locale,
    connection,
  );
  const companyEvents: SingleEventData[] = await companyEventsQuery(
    locale,
    connection,
  );
  const tunnellerEvents: SingleEventData[] = await tunnellerEventsQuery(
    id,
    locale,
    connection,
  );
  const medals: Medal[] = await medalsQuery(id, locale, connection);
  const nzArchives: NzArchives[] = await nzArchivesQuery(id, connection);
  const londonGazette: LondonGazette[] = await londonGazetteQuery(
    id,
    connection,
  );
  const bookAuthors: Author[] = await imageSourceBookAuthorsQuery(
    id,
    connection,
  );

  const transportUk: SingleEventData | null = profile.transport_uk_start
    ? {
        date: profile.transport_uk_start,
        event: `${profile.transport_uk_ref} ${profile.transport_uk_vessel}`,
        title: null,
        titleKey: "Transfer to England",
        image: null,
      }
    : null;

  const transportNz: SingleEventData | null = profile.transport_nz_start
    ? {
        date: profile.transport_nz_start,
        event: `${profile.transport_nz_ref} ${profile.transport_nz_vessel}`,
        title: null,
        titleKey: "Transfer to New Zealand",
        image: null,
      }
    : null;

  const transferred: SingleEventData | null =
    profile.transferred_to_date && profile.transferred_to_unit
      ? {
          date: profile.transferred_to_date,
          event: profile.transferred_to_unit,
          title: null,
          titleKey: "Transferred",
          image: null,
        }
      : null;

  const enlistment: JoinEventData = {
    date: profile.enlistment_date,
    trainingStart: profile.training_start,
    trainingLocation: profile.training_location,
    embarkationUnit: profile.embarkation_unit,
    isEnlisted: true,
  };

  const posted: JoinEventData = {
    date: profile.posted_date,
    trainingStart: profile.training_start,
    trainingLocation: profile.training_location,
    embarkationUnit: profile.embarkation_unit,
    isEnlisted: false,
  };

  const death: DeathData = {
    deathType: profile.death_type,
    deathTypeKey: profile.death_type_key,
    deathDate: profile.death_date,
    deathLocation: profile.death_location,
    deathTown: profile.death_town,
    deathCountry: profile.death_country,
    deathCause: profile.death_cause,
    deathCauseKey: profile.death_cause_key,
    deathCircumstances: profile.death_circumstances,
    cemetery: profile.cemetery,
    cemteryTown: profile.cemetery_town,
    cemeteryCountry: profile.cemetery_country,
    grave: profile.grave,
  };

  const additionalTunnellerEvents: SingleEventData[] = [
    transportUk,
    transportNz,
    transferred,
    getDemobilization(
      profile.demobilization_date,
      profile.discharge_uk,
      profile.has_deserted,
    ),
  ]
    .concat(tunnellerEvents, getWarDeathEvents(death))
    .filter((event): event is SingleEventData => {
      return event !== null;
    });

  const selectedCompanyEvents: SingleEventData[] = companyEvents.filter(
    (event) => {
      const eventKey = event.eventKey ?? event.event;
      if (
        eventKey !== "Marched in to the Company Training Camp, Falmouth" &&
        getEventStartDate(additionalTunnellerEvents) <= event.date &&
        event.date < getEventEndDate(additionalTunnellerEvents)
      ) {
        return true;
      }

      if (
        eventKey === "Marched in to the Company Training Camp, Falmouth" &&
        (profile.embarkation_unit_key === "Main Body" ||
          profile.embarkation_unit_key === "1st Reinforcements")
      ) {
        return true;
      }

      return false;
    },
  );

  const tunneller: TunnellerProfile = {
    id: profile.id,
    slug: profile.slug,
    summary: {
      serial: profile.serial,
      name: {
        forename: profile.forename,
        surname: profile.surname,
      },
      birth: profile.birth_date ? getYear(profile.birth_date) : null,
      death: profile.death_date ? getYear(profile.death_date) : null,
    },
    origins: {
      birth: {
        date: profile.birth_date ? getDate(profile.birth_date) : null,
        country: profile.birth_country,
      },
      parents: {
        mother: getParent(profile.mother_name, profile.mother_origin),
        father: getParent(profile.father_name, profile.father_origin),
      },
      inNzLength: getNzResident(
        profile.nz_resident_in_month,
        profile.enlistment_date,
        profile.posted_date,
      ),
    },
    preWarYears: {
      armyExperience: getArmyExperience(armyExperience, locale),
      employment: {
        occupation: profile.occupation,
        employer: profile.employer,
      },
      residence: profile.residence,
      maritalStatus: profile.marital_status,
      wife: profile.wife_name,
    },
    militaryYears: {
      enlistment: {
        serial: profile.serial,
        rank: profile.rank,
        date: profile.enlistment_date ? getDate(profile.enlistment_date) : null,
        district: profile.district,
        alias: profile.aka,
        transferredToTunnellers: getTransferred(
          profile.posted_date,
          profile.posted_from_corps,
        ),
        ageAtEnlistment: getAgeAtEnlistment(
          profile.enlistment_date,
          profile.posted_date,
          profile.birth_date,
        ),
      },
      embarkationUnit: {
        detachment: profile.embarkation_unit,
        training: {
          date: getDate(profile.training_start),
          location: profile.training_location,
          locationType: profile.training_location_type,
        },
        section: profile.section,
        attachedCorps: profile.attached_corps,
      },
      transportUk: getTransport(
        profile.transport_uk_ref,
        profile.transport_uk_vessel,
        getDate(profile.transport_uk_start),
      ),
      frontEvents: getFrontEvents(
        selectedCompanyEvents,
        additionalTunnellerEvents,
        getJoinEvents(enlistment),
        getJoinEvents(posted),
      ),
      endOfService: {
        deserter: isDeserter(profile.has_deserted),
        transferred: getTransferred(
          profile.transferred_to_date,
          profile.transferred_to_unit,
        ),
        deathWar: isDeathWar(profile.death_type_key),
        transportNz: getTransport(
          profile.transport_nz_ref,
          profile.transport_nz_vessel,
          profile.transport_nz_start
            ? getDate(profile.transport_nz_start)
            : null,
        ),
        demobilization: getDemobilizationSummaryInfo(
          profile.demobilization_date
            ? getDate(profile.demobilization_date)
            : null,
          getDischargedCountry(profile.discharge_uk),
        ),
      },
      medals: medals,
    },
    death: getDeath(
      isWarInjuriesDeathAfterWar(profile.death_type_key),
      profile.death_type_key,
      profile.death_date ? getDate(profile.death_date) : null,
      getDeathPlace(
        profile.death_location,
        profile.death_town,
        profile.death_country,
      ),
      getDeathCause(profile.death_cause, profile.death_circumstances),
      getCemetery(
        profile.cemetery,
        profile.cemetery_town,
        profile.cemetery_country,
        profile.grave,
      ),
      getAge(profile.birth_date, profile.death_date),
    ),
    sources: {
      nzArchives: getNzArchives(nzArchives),
      awmmCenotaph: getAwmm(profile.awmm_cenotaph),
      nominalRoll: getNominalRoll(
        profile.nominal_roll_volume,
        profile.nominal_roll_number,
        profile.nominal_roll_page,
      ),
      londonGazette: getLondonGazette(londonGazette),
    },
    image: getImage(
      profile.image,
      getImageSource(
        getImageSourceAucklandLibraries(
          profile.image_source_auckland_libraries,
        ),
        getImageSourceArchives(profile.archives_name, profile.archives_ref),
        getImageSourceFamily(profile.family_name),
        getImageSourceNewspaper(profile.newspaper_name, profile.newspaper_date),
        getImageSourceBook(
          getImageSourceBookAuthors(bookAuthors),
          profile.book_title,
          profile.book_town,
          profile.book_publisher,
          profile.book_year,
          getImageSourceBookPage(profile.book_page),
        ),
      ),
    ),
  };

  return tunneller;
}
