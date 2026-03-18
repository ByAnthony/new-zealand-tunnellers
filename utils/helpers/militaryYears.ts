import {
  SingleEventData,
  JoinEventData,
  DateObj,
  Event,
  EventDetail,
  DeathData,
} from "@/types/tunneller";
import { getAge, getDate, getDayMonth, getYear } from "@/utils/helpers/date";
import { getDeathPlaceWithoutCountry } from "@/utils/helpers/death";

export const getTransferred = (date: string | null, unit: string | null) => {
  return date && unit ? { date: getDate(date), unit } : null;
};

export const getAgeAtEnlistment = (
  enlistmentDate: string | null,
  postedDate: string | null,
  birthDate: string | null,
) => {
  if (enlistmentDate && birthDate) {
    return getAge(birthDate, enlistmentDate);
  }
  if (postedDate && birthDate) {
    return getAge(birthDate, postedDate);
  }
  return null;
};

export const getEventStartDate = (tunnellerEvents: SingleEventData[]) => {
  return tunnellerEvents.reduce((minDate, event) => {
    return event.date < minDate ? event.date : minDate;
  }, tunnellerEvents[0].date);
};

export const getEventEndDate = (tunnellerEvents: SingleEventData[]) => {
  return tunnellerEvents.reduce((maxDate, event) => {
    return event.date > maxDate ? event.date : maxDate;
  }, tunnellerEvents[0].date);
};

export const getJoinEvents = (join: JoinEventData | null) => {
  const joinEvents: SingleEventData[] = [];

  if (join && join.date && join.date < join.trainingStart) {
    joinEvents.push(
      {
        date: join.date,
        event: join.embarkationUnit,
        title: join.isEnlisted ? "Enlisted" : "Posted",
        image: null,
      },
      {
        date: join.trainingStart,
        event: join.trainingLocation,
        title: "Trained",
        image: null,
      },
    );
  }

  if (join && join.date && join.date >= join.trainingStart) {
    joinEvents.push(
      {
        date: join.date,
        event: join.embarkationUnit,
        title: join.isEnlisted ? "Enlisted" : "Posted",
        image: null,
      },
      {
        date: join.date,
        event: join.trainingLocation,
        title: "Trained",
        image: null,
      },
    );
  }

  return joinEvents;
};

export const getWarDeathEvents = (death: DeathData) => {
  const deathEvents: SingleEventData[] = [];

  if (death.deathDate) {
    if (death.deathTypeKey === "War") {
      if (
        death.deathCauseKey === "Killed in action" &&
        death.deathCircumstances
      ) {
        deathEvents.push({
          date: death.deathDate,
          event: death.deathCircumstances,
          title: death.deathCause,
          titleKey: death.deathCauseKey,
          image: null,
          extraDescription: getDeathPlaceWithoutCountry(
            death.deathLocation,
            death.deathTown,
          ),
        });
      }

      if (death.deathCauseKey === "Died of wounds") {
        deathEvents.push({
          date: death.deathDate,
          event: `${death.deathLocation}${death.deathTown ? `, ${death.deathTown}` : ""}`,
          title: death.deathCause,
          titleKey: death.deathCauseKey,
          image: null,
        });
      }

      if (death.deathCauseKey === "Died of disease") {
        deathEvents.push({
          date: death.deathDate,
          event: `${death.deathLocation}${death.deathTown ? `, ${death.deathTown}` : ""}`,
          title: death.deathCause,
          titleKey: death.deathCauseKey,
          image: null,
          extraDescription: death.deathCircumstances
            ? death.deathCircumstances
            : null,
        });
      }

      if (death.deathCauseKey === "Died of accident" && death.deathLocation) {
        deathEvents.push({
          date: death.deathDate,
          event: `${death.deathLocation}${death.deathTown ? `, ${death.deathTown}` : ""}`,
          title: death.deathCause,
          titleKey: death.deathCauseKey,
          image: null,
        });
      }

      if (death.grave) {
        deathEvents.push(
          {
            date: death.deathDate,
            event: `${death.cemetery}, ${death.cemteryTown}`,
            title: "Buried",
            titleKey: "Buried",
            image: null,
          },
          {
            date: death.deathDate,
            event: death.grave,
            title: "Grave reference",
            titleKey: "Grave reference",
            image: null,
          },
        );
      }
    }

    if (
      death.deathTypeKey === "War injuries" &&
      death.deathCauseKey === "Died of disease" &&
      death.deathCircumstances
    ) {
      deathEvents.push({
        date: death.deathDate,
        event: death.deathCircumstances,
        title: death.deathCause,
        titleKey: death.deathCauseKey,
        image: null,
      });
    }
  }

  return deathEvents;
};

export const getGroupedEventsByDate = (events: Event[]) => {
  return events.reduce((acc: Event[], current: Event) => {
    const existingEntry = acc.find(
      (entry: Event) =>
        entry.date.year === current.date.year &&
        entry.date.dayMonth === current.date.dayMonth,
    );

    if (existingEntry) {
      existingEntry.event.push(...current.event);
    } else {
      acc.push({
        date: {
          year: current.date.year,
          dayMonth: current.date.dayMonth,
        },
        event: [...current.event],
      });
    }

    return acc;
  }, []);
};

export const getGroupedEventsByYear = (events: Event[]) => {
  return events.reduce((acc: { [year: string]: Event[] }, current: Event) => {
    const year = current.date.year;

    if (!acc[year]) {
      acc[year] = [];
    }

    acc[year].push({
      date: current.date,
      event: current.event,
    });

    return acc;
  }, {});
};

export const getFrontEvents = (
  companyEvents: SingleEventData[],
  tunnellerEvents: SingleEventData[],
  enlistmentEvents: SingleEventData[] | [],
  postedEvents: SingleEventData[] | [],
) => {
  const fullTunnellerEvents: SingleEventData[] = tunnellerEvents
    .concat(enlistmentEvents, postedEvents, companyEvents)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const key = (e: SingleEventData) => e.titleKey ?? e.title;

  const transferredIndex: number = fullTunnellerEvents.findIndex(
    (e) => key(e) === "Transferred",
  );

  const graveReferenceIndex: number = fullTunnellerEvents.findIndex(
    (e) => key(e) === "Grave reference",
  );

  const transferredToNzIndex: number = fullTunnellerEvents.findIndex(
    (e) => key(e) === "Transfer to New Zealand",
  );

  const endOfServiceIndex: number = fullTunnellerEvents.findIndex(
    (e) => key(e) === "End of Service",
  );

  const diedOfDiseaseAfterServiceEnd: number = fullTunnellerEvents.findIndex(
    (e) => key(e) === "Died of disease",
  );

  const filteredAfterTransferredEvents: SingleEventData[] =
    fullTunnellerEvents.filter((event, index) => {
      return (
        transferredIndex === -1 ||
        graveReferenceIndex === -1 ||
        index <= transferredIndex ||
        index >= graveReferenceIndex - 2
      );
    });

  const filteredAfterEndOfServiceWarInjuries: SingleEventData[] =
    filteredAfterTransferredEvents.filter((event, index) => {
      return (
        endOfServiceIndex === -1 ||
        diedOfDiseaseAfterServiceEnd === -1 ||
        index <= endOfServiceIndex ||
        index >= diedOfDiseaseAfterServiceEnd
      );
    });

  const filteredAfterTransferToNz: SingleEventData[] =
    filteredAfterEndOfServiceWarInjuries.filter((event, index) => {
      return (
        transferredToNzIndex === -1 ||
        (endOfServiceIndex === -1 && diedOfDiseaseAfterServiceEnd === -1) ||
        index <= transferredToNzIndex ||
        (index >= endOfServiceIndex && endOfServiceIndex !== -1) ||
        (index >= diedOfDiseaseAfterServiceEnd &&
          diedOfDiseaseAfterServiceEnd !== -1) ||
        (index > transferredToNzIndex &&
          ((index < endOfServiceIndex && endOfServiceIndex !== -1) ||
            (index < diedOfDiseaseAfterServiceEnd &&
              diedOfDiseaseAfterServiceEnd !== -1)) &&
          key(event) !== "The Company" &&
          key(event) !== "Allied Attacks" &&
          key(event) !== "British Offensive" &&
          key(event) !== "Cessation of Hostilities" &&
          key(event) !== "German Attacks")
      );
    });

  const mappedEvents: Event[] = filteredAfterTransferToNz.map(
    (event: SingleEventData) => {
      const dateObj: DateObj = {
        year: getYear(event.date),
        dayMonth: getDayMonth(event.date),
      };

      const eventDetail: EventDetail = {
        description: event.event,
        title: event.title,
        titleKey: event.titleKey,
        image: event.image,
        imageAlt: event.imageAlt,
        extraDescription: event.extraDescription,
      };

      return { date: dateObj, event: [eventDetail] };
    },
  );

  const groupEventsByDate: Event[] = getGroupedEventsByDate(mappedEvents);

  const groupEventsByYear: Record<string, Event[]> =
    getGroupedEventsByYear(groupEventsByDate);

  return groupEventsByYear;
};

export const isDeserter = (isDeserter: number | null) => {
  return isDeserter === 1 ? true : false;
};

export const isDeathWar = (deathTypeKey: string | null) => {
  return deathTypeKey === "War" ? true : false;
};

export const getTransport = (
  reference: string | null,
  vessel: string | null,
  departureDate: DateObj | null,
) => {
  return reference && vessel && departureDate
    ? { reference, vessel, departureDate }
    : null;
};

export const getDemobilizationSummaryInfo = (
  date: DateObj | null,
  country: string | null,
) => {
  return date && country ? { date, country } : null;
};

export const getDemobilization = (
  date: string | null,
  dischargeUk: number | null,
  deserted: number | null,
  locale: string = "en",
) => {
  const isEn = locale === "en";

  if (date && dischargeUk === 1) {
    return {
      date: date,
      event: isEn
        ? "End of Service in the United Kingdom"
        : "Fin de service au Royaume-Uni",
      title: isEn ? "Demobilisation" : "Démobilisation",
      titleKey: "Demobilization",
      image: null,
    };
  }

  if (date && deserted === 1) {
    return {
      date: date,
      event: isEn
        ? "End of Service as deserter"
        : "Fin de service en tant que déserteur",
      title: isEn ? "Demobilisation" : "Démobilisation",
      titleKey: "Demobilization",
      image: null,
    };
  }

  if (date) {
    return {
      date: date,
      event: isEn ? "Demobilisation" : "Démobilisation",
      title: isEn ? "End of Service" : "Fin de service",
      titleKey: "End of Service",
      image: null,
    };
  }

  return null;
};

export const getDischargedCountry = (isDischargedUk: number | null) => {
  return isDischargedUk ? "United Kingdom" : "New Zealand";
};
