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
        title: null,
        titleKey: join.isEnlisted ? "Enlisted" : "Posted",
        image: null,
      },
      {
        date: join.trainingStart,
        event: join.trainingLocation,
        title: null,
        titleKey: "Trained",
        image: null,
      },
    );
  }

  if (join && join.date && join.date >= join.trainingStart) {
    joinEvents.push(
      {
        date: join.date,
        event: join.embarkationUnit,
        title: null,
        titleKey: join.isEnlisted ? "Enlisted" : "Posted",
        image: null,
      },
      {
        date: join.date,
        event: join.trainingLocation,
        title: null,
        titleKey: "Trained",
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

const getFrontEventKey = (event: SingleEventData) =>
  event.titleKey ?? event.title;

const mergeTimelineEvents = (
  companyEvents: SingleEventData[],
  tunnellerEvents: SingleEventData[],
  enlistmentEvents: SingleEventData[] | [],
  postedEvents: SingleEventData[] | [],
) => {
  const getSameDayPriority = (event: SingleEventData) => {
    switch (getFrontEventKey(event)) {
      case "Transferred":
      case "Transfer to New Zealand":
      case "End of Service":
      case "Demobilization":
        return 1;
      default:
        return 0;
    }
  };

  return tunnellerEvents
    .concat(enlistmentEvents, postedEvents, companyEvents)
    .map((event, index) => ({ event, index }))
    .sort((a, b) => {
      const dateDiff =
        new Date(a.event.date).getTime() - new Date(b.event.date).getTime();
      if (dateDiff !== 0) return dateDiff;

      const priorityDiff =
        getSameDayPriority(a.event) - getSameDayPriority(b.event);
      if (priorityDiff !== 0) return priorityDiff;

      return a.index - b.index;
    })
    .map(({ event }) => event);
};

const filterTransferredEvents = (events: SingleEventData[]) => {
  const transferredIndex = events.findIndex(
    (event) => getFrontEventKey(event) === "Transferred",
  );
  const graveReferenceIndex = events.findIndex(
    (event) => getFrontEventKey(event) === "Grave reference",
  );

  return events.filter((_event, index) => {
    return (
      transferredIndex === -1 ||
      graveReferenceIndex === -1 ||
      index <= transferredIndex ||
      index >= graveReferenceIndex - 2
    );
  });
};

const filterPostServiceEvents = (events: SingleEventData[]) => {
  const endOfServiceIndex = events.findIndex(
    (event) => getFrontEventKey(event) === "End of Service",
  );
  const diedOfDiseaseAfterServiceEnd = events.findIndex(
    (event) => getFrontEventKey(event) === "Died of disease",
  );

  return events.filter((_event, index) => {
    return (
      endOfServiceIndex === -1 ||
      diedOfDiseaseAfterServiceEnd === -1 ||
      index <= endOfServiceIndex ||
      index >= diedOfDiseaseAfterServiceEnd
    );
  });
};

const filterTransferToNewZealandEvents = (events: SingleEventData[]) => {
  const transferredToNzIndex = events.findIndex(
    (event) => getFrontEventKey(event) === "Transfer to New Zealand",
  );
  const endOfServiceIndex = events.findIndex(
    (event) => getFrontEventKey(event) === "End of Service",
  );
  const diedOfDiseaseAfterServiceEnd = events.findIndex(
    (event) => getFrontEventKey(event) === "Died of disease",
  );

  return events.filter((event, index) => {
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
        getFrontEventKey(event) !== "The Company" &&
        getFrontEventKey(event) !== "Allied Attacks" &&
        getFrontEventKey(event) !== "British Offensive" &&
        getFrontEventKey(event) !== "Cessation of Hostilities" &&
        getFrontEventKey(event) !== "German Attacks")
    );
  });
};

const mapTimelineEvents = (events: SingleEventData[]): Event[] => {
  return events.map((event) => {
    const dateObj: DateObj = {
      year: getYear(event.date),
      dayMonth: getDayMonth(event.date),
    };

    const eventDetail: EventDetail = {
      description: event.event,
      descriptionKey: event.descriptionKey,
      title: event.title,
      titleKey: event.titleKey,
      image: event.image,
      imageAlt: event.imageAlt,
      extraDescription: event.extraDescription,
    };

    return { date: dateObj, event: [eventDetail] };
  });
};

const groupEventsForTimeline = (events: SingleEventData[]) => {
  const mappedEvents = mapTimelineEvents(events);
  const groupedEventsByDate = getGroupedEventsByDate(mappedEvents);
  return getGroupedEventsByYear(groupedEventsByDate);
};

export const getFrontEvents = (
  companyEvents: SingleEventData[],
  tunnellerEvents: SingleEventData[],
  enlistmentEvents: SingleEventData[] | [],
  postedEvents: SingleEventData[] | [],
) => {
  const mergedEvents = mergeTimelineEvents(
    companyEvents,
    tunnellerEvents,
    enlistmentEvents,
    postedEvents,
  );
  const filteredTransferredEvents = filterTransferredEvents(mergedEvents);
  const filteredPostServiceEvents = filterPostServiceEvents(
    filteredTransferredEvents,
  );
  const filteredTransferToNewZealandEvents = filterTransferToNewZealandEvents(
    filteredPostServiceEvents,
  );

  return groupEventsForTimeline(filteredTransferToNewZealandEvents);
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
) => {
  if (date && dischargeUk === 1) {
    return {
      date,
      event: "",
      descriptionKey: "endOfServiceUK",
      title: null,
      titleKey: "Demobilization",
      image: null,
    };
  }

  if (date && deserted === 1) {
    return {
      date,
      event: "",
      descriptionKey: "endOfServiceDeserter",
      title: null,
      titleKey: "Demobilization",
      image: null,
    };
  }

  if (date) {
    return {
      date,
      event: "",
      descriptionKey: "demobilization",
      title: null,
      titleKey: "End of Service",
      image: null,
    };
  }

  return null;
};

export const getDischargedCountry = (isDischargedUk: number | null) => {
  return isDischargedUk ? "United Kingdom" : "New Zealand";
};
