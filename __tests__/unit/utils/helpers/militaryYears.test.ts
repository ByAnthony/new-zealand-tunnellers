import {
  mockFrontEventsWithCompanyEvents,
  mockFrontEventsWithDeathAfterEndOfService,
  mockFrontEventsWithTransferred,
  mockFrontEventsWithTransferToNzAndEndOfService,
} from "__tests__/unit/utils/mocks/mockFrontEvents";

import {
  DeathData,
  Event,
  JoinEventData,
  SingleEventData,
} from "@/types/tunneller";
import {
  getAgeAtEnlistment,
  getDemobilization,
  getDemobilizationSummaryInfo,
  getDischargedCountry,
  getEventEndDate,
  getEventStartDate,
  getFrontEvents,
  getGroupedEventsByDate,
  getGroupedEventsByYear,
  getJoinEvents,
  getTransferred,
  getTransport,
  getWarDeathEvents,
  isDeathWar,
  isDeserter,
} from "@/utils/helpers/militaryYears";

describe("getTransferred", () => {
  test("returns an object with formatted date and unit when both date and unit are provided", () => {
    const date = "2023-04-01";
    const unit = "101st Airborne";
    const expectedResult = {
      date: { year: "2023", dayMonth: "1 April" },
      unit: "101st Airborne",
    };
    const result = getTransferred(date, unit);
    expect(result).toEqual(expectedResult);
  });

  test("returns null when date is null", () => {
    const unit = "101st Airborne";
    const result = getTransferred(null, unit);
    expect(result).toBeNull();
  });

  test("returns null when unit is null", () => {
    const date = "2023-04-01";
    const result = getTransferred(date, null);
    expect(result).toBeNull();
  });

  test("returns null when both date and unit are null", () => {
    const result = getTransferred(null, null);
    expect(result).toBeNull();
  });
});

describe("getAgeAtEnlistment", () => {
  test("returns age at enlistment when enlistmentDate and birthDate are provided", () => {
    const enlistmentDate = "2023-04-01";
    const birthDate = "2000-04-01";
    const expectedAge = 23;
    const result = getAgeAtEnlistment(enlistmentDate, null, birthDate);
    expect(result).toBe(expectedAge);
  });

  test("returns age at posting when postedDate and birthDate are provided and enlistmentDate is null", () => {
    const postedDate = "2023-04-01";
    const birthDate = "2000-04-01";
    const expectedAge = 23;
    const result = getAgeAtEnlistment(null, postedDate, birthDate);
    expect(result).toBe(expectedAge);
  });

  test("returns null when both enlistmentDate and postedDate are null", () => {
    const birthDate = "2000-04-01";
    const result = getAgeAtEnlistment(null, null, birthDate);
    expect(result).toBeNull();
  });

  test("returns null when birthDate is null", () => {
    const enlistmentDate = "2023-04-01";
    const result = getAgeAtEnlistment(enlistmentDate, null, null);
    expect(result).toBeNull();
  });
});

describe("getEventStartDate", () => {
  test("returns the earliest date from an array of SingleEventData", () => {
    const tunnellerEvents: SingleEventData[] = [
      {
        date: "2023-04-03",
        event: "enlistment",
        title: "Enlisted",
        image: null,
      },
      { date: "2023-04-01", event: "posting", title: "Enlisted", image: null },
      {
        date: "2023-04-02",
        event: "promotion",
        title: "Enlisted",
        image: null,
      },
    ];
    const expectedResult = "2023-04-01";
    const result = getEventStartDate(tunnellerEvents);
    expect(result).toBe(expectedResult);
  });

  test("returns the date when array contains only one SingleEventData", () => {
    const tunnellerEvents: SingleEventData[] = [
      {
        date: "2023-04-01",
        event: "enlistment",
        title: "Enlisted",
        image: null,
      },
    ];
    const expectedResult = "2023-04-01";
    const result = getEventStartDate(tunnellerEvents);
    expect(result).toBe(expectedResult);
  });
});

describe("getEventEndDate", () => {
  test("returns the latest date from an array of SingleEventData", () => {
    const tunnellerEvents: SingleEventData[] = [
      {
        date: "2023-04-03",
        event: "enlistment",
        title: "Enlisted",
        image: null,
      },
      { date: "2023-04-01", event: "posting", title: "Enlisted", image: null },
      {
        date: "2023-04-05",
        event: "promotion",
        title: "Enlisted",
        image: null,
      },
    ];
    const expectedResult = "2023-04-05";
    const result = getEventEndDate(tunnellerEvents);
    expect(result).toBe(expectedResult);
  });

  test("returns the date when array contains only one SingleEventData", () => {
    const tunnellerEvents: SingleEventData[] = [
      {
        date: "2023-04-01",
        event: "promotion",
        title: "Enlisted",
        image: null,
      },
    ];
    const expectedResult = "2023-04-01";
    const result = getEventEndDate(tunnellerEvents);
    expect(result).toBe(expectedResult);
  });
});

describe("getJoinEvents", () => {
  test.each([
    [true, "Enlisted"],
    [false, "Posted"],
  ])(
    "should return enlistment and training events when enlistmentDate is before trainingStart",
    (isEnlisted: boolean, joinType: string) => {
      const joinData: JoinEventData = {
        date: "2020-01-01",
        trainingStart: "2020-02-01",
        embarkationUnit: "Unit A",
        trainingLocation: "Location A",
        isEnlisted: isEnlisted,
      };
      const expectedEvents: SingleEventData[] = [
        {
          date: "2020-01-01",
          event: "Unit A",
          title: joinType,
          image: null,
        },
        {
          date: "2020-02-01",
          event: "Location A",
          title: "Trained",
          image: null,
        },
      ];
      expect(getJoinEvents(joinData)).toEqual(expectedEvents);
    },
  );

  test.each([
    [true, "Enlisted"],
    [false, "Posted"],
  ])(
    "should return enlistment and training events on the same date when enlistmentDate is the same as trainingStart",
    (isEnlisted: boolean, joinType: string) => {
      const joinData: JoinEventData = {
        date: "2020-02-01",
        trainingStart: "2020-01-01",
        embarkationUnit: "Unit B",
        trainingLocation: "Location B",
        isEnlisted: isEnlisted,
      };
      const expectedEvents: SingleEventData[] = [
        {
          date: "2020-02-01",
          event: "Unit B",
          title: joinType,
          image: null,
        },
        {
          date: "2020-02-01",
          event: "Location B",
          title: "Trained",
          image: null,
        },
      ];
      expect(getJoinEvents(joinData)).toEqual(expectedEvents);
    },
  );

  test("should return an empty array when join data is null", () => {
    expect(getJoinEvents(null)).toEqual([]);
  });
});

describe("getWarDeathEvents", () => {
  const kia: DeathData = {
    deathType: "War",
    deathCause: "Killed in action",
    deathDate: "1916-07-01",
    deathCircumstances: "Battle of the Somme",
    deathLocation: "Telegraph Wood",
    deathTown: "La Boisselle",
    deathCountry: "France",
    cemetery: "Thiepval Memorial",
    cemteryTown: "Ovilliers",
    cemeteryCountry: "France",
    grave: "B2",
  };

  const buried: SingleEventData = {
    date: "1916-07-01",
    event: "Thiepval Memorial, Ovilliers",
    title: "Buried",
    image: null,
  };

  const grave: SingleEventData = {
    date: "1916-07-01",
    event: "B2",
    title: "Grave reference",
    image: null,
  };

  test('should handle "Killed in action" death cause', () => {
    const expected: SingleEventData[] = [
      {
        date: "1916-07-01",
        event: "Battle of the Somme",
        title: "Killed in action",
        image: null,
        extraDescription: "Telegraph Wood, La Boisselle",
      },
      buried,
      grave,
    ];
    expect(getWarDeathEvents(kia)).toEqual(expected);
  });

  test('should handle "Died of wounds" death cause', () => {
    const deathWar: DeathData = {
      ...kia,
      deathCause: "Died of wounds",
      deathLocation: "NZEF Hospital",
      deathTown: "Arras",
    };

    const expected: SingleEventData[] = [
      {
        date: "1916-07-01",
        event: "NZEF Hospital, Arras",
        title: "Died of wounds",
        image: null,
      },
      buried,
      grave,
    ];
    expect(getWarDeathEvents(deathWar)).toEqual(expected);
  });

  test('should handle "Died of wounds" without death town', () => {
    const deathWar: DeathData = {
      ...kia,
      deathCause: "Died of wounds",
      deathLocation: "NZEF Hospital",
      deathTown: null,
    };

    const expected: SingleEventData[] = [
      {
        date: "1916-07-01",
        event: "NZEF Hospital",
        title: "Died of wounds",
        image: null,
      },
      buried,
      grave,
    ];
    expect(getWarDeathEvents(deathWar)).toEqual(expected);
  });

  test('should handle "Died of disease"', () => {
    const deathWar: DeathData = {
      ...kia,
      deathCause: "Died of disease",
      deathLocation: "NZEF Hospital",
      deathTown: "Arras",
      deathCircumstances: "Spanish Flu",
    };
    const expected: SingleEventData[] = [
      {
        date: "1916-07-01",
        event: "NZEF Hospital, Arras",
        title: "Died of disease",
        image: null,
        extraDescription: "Spanish Flu",
      },
      buried,
      grave,
    ];
    expect(getWarDeathEvents(deathWar)).toEqual(expected);
  });

  test('should handle "Died of disease" without death town', () => {
    const deathWar: DeathData = {
      ...kia,
      deathCause: "Died of disease",
      deathLocation: "NZEF Hospital",
      deathTown: null,
      deathCircumstances: "Spanish Flu",
    };
    const expected: SingleEventData[] = [
      {
        date: "1916-07-01",
        event: "NZEF Hospital",
        title: "Died of disease",
        image: null,
        extraDescription: "Spanish Flu",
      },
      buried,
      grave,
    ];
    expect(getWarDeathEvents(deathWar)).toEqual(expected);
  });

  test('should handle "Died of disease" without extra description', () => {
    const deathWar: DeathData = {
      ...kia,
      deathCause: "Died of disease",
      deathLocation: "NZEF Hospital",
      deathTown: "Arras",
      deathCircumstances: null,
    };
    const expected: SingleEventData[] = [
      {
        date: "1916-07-01",
        event: "NZEF Hospital, Arras",
        title: "Died of disease",
        image: null,
        extraDescription: null,
      },
      buried,
      grave,
    ];
    expect(getWarDeathEvents(deathWar)).toEqual(expected);
  });

  test('should handle "Died of accident"', () => {
    const deathWar: DeathData = {
      ...kia,
      deathCause: "Died of accident",
      deathDate: "1916-07-01",
      deathLocation: "Drowned in the harbour",
      deathTown: "Boulogne",
    };
    const expected: SingleEventData[] = [
      {
        date: "1916-07-01",
        event: "Drowned in the harbour, Boulogne",
        title: "Died of accident",
        image: null,
      },
      buried,
      grave,
    ];
    expect(getWarDeathEvents(deathWar)).toEqual(expected);
  });

  test('should handle "Died of accident" without death town', () => {
    const deathWar: DeathData = {
      ...kia,
      deathCause: "Died of accident",
      deathDate: "1916-07-01",
      deathLocation: "Drowned in the harbour",
      deathTown: null,
    };
    const expected: SingleEventData[] = [
      {
        date: "1916-07-01",
        event: "Drowned in the harbour",
        title: "Died of accident",
        image: null,
      },
      buried,
      grave,
    ];
    expect(getWarDeathEvents(deathWar)).toEqual(expected);
  });

  test('should handle "War injuries" and "Died of disease"', () => {
    const deathWar: DeathData = {
      ...kia,
      deathType: "War injuries",
      deathCause: "Died of disease",
      deathDate: "1916-07-01",
      deathCircumstances: "Flu",
    };
    const expected: SingleEventData[] = [
      {
        date: "1916-07-01",
        event: "Flu",
        title: "Died of disease",
        image: null,
      },
    ];
    expect(getWarDeathEvents(deathWar)).toEqual(expected);
  });
});

describe("getGroupedEventsByDate", () => {
  test("should group events by the same date", () => {
    const events: Event[] = [
      {
        date: { year: "1916", dayMonth: "1 July" },
        event: [{ description: "Event A", title: null, image: null }],
      },
      {
        date: { year: "1916", dayMonth: "1 July" },
        event: [{ description: "Event B", title: null, image: null }],
      },
      {
        date: { year: "1917", dayMonth: "11 November" },
        event: [{ description: "Event C", title: null, image: null }],
      },
    ];
    const expectedGroupedEvents: Event[] = [
      {
        date: { year: "1916", dayMonth: "1 July" },
        event: [
          { description: "Event A", title: null, image: null },
          { description: "Event B", title: null, image: null },
        ],
      },
      {
        date: { year: "1917", dayMonth: "11 November" },
        event: [{ description: "Event C", title: null, image: null }],
      },
    ];
    expect(getGroupedEventsByDate(events)).toEqual(expectedGroupedEvents);
  });

  test("should handle an empty events array", () => {
    const events: Event[] = [];
    const expectedGroupedEvents: Event[] = [];
    expect(getGroupedEventsByDate(events)).toEqual(expectedGroupedEvents);
  });

  test("should not modify events with unique dates", () => {
    const events: Event[] = [
      {
        date: { year: "1916", dayMonth: "1 July" },
        event: [{ description: "Event A", title: null, image: null }],
      },
      {
        date: { year: "1917", dayMonth: "11 November" },
        event: [{ description: "Event B", title: null, image: null }],
      },
    ];
    const expectedGroupedEvents: Event[] = [
      {
        date: { year: "1916", dayMonth: "1 July" },
        event: [{ description: "Event A", title: null, image: null }],
      },
      {
        date: { year: "1917", dayMonth: "11 November" },
        event: [{ description: "Event B", title: null, image: null }],
      },
    ];
    expect(getGroupedEventsByDate(events)).toEqual(expectedGroupedEvents);
  });
});

describe("getGroupedEventsByYear", () => {
  test("should group events by year", () => {
    const events: Event[] = [
      {
        date: { year: "1916", dayMonth: "1 July" },
        event: [{ description: "Event A", title: null, image: null }],
      },
      {
        date: { year: "1916", dayMonth: "2 July" },
        event: [{ description: "Event B", title: null, image: null }],
      },
      {
        date: { year: "1917", dayMonth: "11 November" },
        event: [{ description: "Event C", title: null, image: null }],
      },
    ];
    const expectedOutput: {
      [year: string]: Event[];
    } = {
      "1916": [
        {
          date: { year: "1916", dayMonth: "1 July" },
          event: [{ description: "Event A", title: null, image: null }],
        },
        {
          date: { year: "1916", dayMonth: "2 July" },
          event: [{ description: "Event B", title: null, image: null }],
        },
      ],
      "1917": [
        {
          date: { year: "1917", dayMonth: "11 November" },
          event: [{ description: "Event C", title: null, image: null }],
        },
      ],
    };
    expect(getGroupedEventsByYear(events)).toEqual(expectedOutput);
  });

  test("should handle an empty events array", () => {
    const events: Event[] = [];
    const expectedOutput = {};
    expect(getGroupedEventsByYear(events)).toEqual(expectedOutput);
  });
});

describe("getFrontEvents", () => {
  test("should return timeline", () => {
    const mockCompanyEvent: SingleEventData = {
      date: "1916-11-11",
      event: "Something major happened",
      title: "Major event",
      image: "major.jpg",
    };

    const mockCompanyEvents: SingleEventData[] = [
      { ...mockCompanyEvent },
      { ...mockCompanyEvent, date: "1917-04-09" },
    ];

    const mockTunnellerEvent: SingleEventData = {
      date: "1916-06-13",
      event: "Something happened",
      title: null,
      image: null,
    };

    const mockTunnellerEvents: SingleEventData[] = [
      { ...mockTunnellerEvent },
      { ...mockTunnellerEvent, date: "1917-01-26" },
      { ...mockTunnellerEvent, date: "1917-06-28" },
    ];

    const mockEnlistment: SingleEventData[] = [
      { ...mockTunnellerEvent, date: "1915-09-01", title: "Enlisted" },
      { ...mockTunnellerEvent, date: "1915-10-10", title: "Trained" },
    ];

    expect(
      getFrontEvents(
        mockCompanyEvents,
        mockTunnellerEvents,
        mockEnlistment,
        [],
      ),
    ).toEqual(mockFrontEventsWithCompanyEvents);
  });

  test("should filtered timeline when a men was transferred to another unit", () => {
    const mockCompanyEvent: SingleEventData = {
      date: "1916-11-11",
      event: "Something major happened",
      title: "Major event",
      image: "major.jpg",
    };

    const mockCompanyEvents: SingleEventData[] = [
      { ...mockCompanyEvent },
      { ...mockCompanyEvent, date: "1917-04-09" },
    ];

    const mockTunnellerEvent: SingleEventData = {
      date: "1916-06-13",
      event: "Something happened",
      title: null,
      image: null,
    };

    const mockTunnellerEvents: SingleEventData[] = [
      { ...mockTunnellerEvent },
      { ...mockTunnellerEvent, date: "1917-01-26" },
      { ...mockTunnellerEvent, date: "1917-06-28" },
      { ...mockTunnellerEvent, date: "1917-09-28", title: "Transferred" },
      { ...mockTunnellerEvent, date: "1917-12-02" },
      { ...mockTunnellerEvent, date: "1918-04-05" },
      { ...mockTunnellerEvent, date: "1918-08-10", title: "Killed in action" },
      { ...mockTunnellerEvent, date: "1918-08-10", title: "Buried" },
      { ...mockTunnellerEvent, date: "1918-08-10", title: "Grave reference" },
    ];

    const mockEnlistment: SingleEventData[] = [
      { ...mockTunnellerEvent, date: "1915-09-01", title: "Enlisted" },
      { ...mockTunnellerEvent, date: "1915-10-10", title: "Trained" },
    ];

    expect(
      getFrontEvents(
        mockCompanyEvents,
        mockTunnellerEvents,
        mockEnlistment,
        [],
      ),
    ).toEqual(mockFrontEventsWithTransferred);
  });

  test("should filtered timeline when men died from war injuries after being demobilised", () => {
    const mockCompanyEvent: SingleEventData = {
      date: "1916-11-11",
      event: "Something major happened",
      title: "Major event",
      image: "major.jpg",
    };

    const mockCompanyEvents: SingleEventData[] = [
      { ...mockCompanyEvent },
      { ...mockCompanyEvent, date: "1917-04-09" },
      { ...mockCompanyEvent, date: "1917-12-12" },
      { ...mockCompanyEvent, date: "1918-06-23" },
    ];

    const mockTunnellerEvent: SingleEventData = {
      date: "1916-06-13",
      event: "Something happened",
      title: null,
      image: null,
    };

    const mockTunnellerEvents: SingleEventData[] = [
      { ...mockTunnellerEvent },
      { ...mockTunnellerEvent, date: "1917-01-26" },
      { ...mockTunnellerEvent, date: "1917-06-28" },
      { ...mockTunnellerEvent, date: "1917-09-28", title: "End of Service" },
      { ...mockTunnellerEvent, date: "1918-12-02", title: "Died of disease" },
    ];

    const mockEnlistment: SingleEventData[] = [
      { ...mockTunnellerEvent, date: "1915-09-01", title: "Enlisted" },
      { ...mockTunnellerEvent, date: "1915-10-10", title: "Trained" },
    ];

    expect(
      getFrontEvents(
        mockCompanyEvents,
        mockTunnellerEvents,
        mockEnlistment,
        [],
      ),
    ).toEqual(mockFrontEventsWithDeathAfterEndOfService);
  });

  test.each([
    {
      end: "End of Service",
      expected:
        mockFrontEventsWithTransferToNzAndEndOfService("End of Service"),
    },
    {
      end: "Died of disease",
      expected:
        mockFrontEventsWithTransferToNzAndEndOfService("Died of disease"),
    },
  ])(
    `should filtered main events after transfer to New Zealand`,
    ({ end, expected }) => {
      const mockCompanyEvent: SingleEventData = {
        date: "1916-11-11",
        event: "Something major happened",
        title: "Major event",
        image: "major.jpg",
      };

      const mockCompanyEvents: SingleEventData[] = [
        { ...mockCompanyEvent },
        { ...mockCompanyEvent, date: "1917-04-09" },
      ];

      const mockTunnellerEvent: SingleEventData = {
        date: "1916-06-13",
        event: "Something happened",
        title: null,
        image: null,
      };

      const mockTunnellerEvents: SingleEventData[] = [
        { ...mockTunnellerEvent },
        { ...mockTunnellerEvent, date: "1917-01-26" },
        { ...mockTunnellerEvent, date: "1917-06-28" },
        {
          ...mockTunnellerEvent,
          date: "1917-09-28",
          title: "Transfer to New Zealand",
        },
        { ...mockCompanyEvent, date: "1917-10-28", title: "The Company" },
        { ...mockCompanyEvent, date: "1917-11-28", title: "Allied Attacks" },
        { ...mockCompanyEvent, date: "1917-12-28", title: "British Offensive" },
        {
          ...mockCompanyEvent,
          date: "1918-02-28",
          title: "Cessation of Hostilities",
        },
        { ...mockTunnellerEvent, date: "1918-06-28" },
        { ...mockTunnellerEvent, date: "1918-12-02", title: end },
      ];

      const mockEnlistment: SingleEventData[] = [
        { ...mockTunnellerEvent, date: "1915-09-01", title: "Enlisted" },
        { ...mockTunnellerEvent, date: "1915-10-10", title: "Trained" },
      ];

      expect(
        getFrontEvents(
          mockCompanyEvents,
          mockTunnellerEvents,
          mockEnlistment,
          [],
        ),
      ).toEqual(expected);
    },
  );
});

describe("isDeserter", () => {
  test("should return true if isDeserter is 1", () => {
    expect(isDeserter(1)).toBe(true);
  });

  test("should return false if isDeserter is 0", () => {
    expect(isDeserter(0)).toBe(false);
  });

  test("should return false if isDeserter is null", () => {
    expect(isDeserter(null)).toBe(false);
  });
});

describe("isDeathWar", () => {
  test('should return true if isDeathWar is "War"', () => {
    expect(isDeathWar("War")).toBe(true);
  });

  test('should return false if isDeathWar is not "War"', () => {
    expect(isDeathWar("Peace")).toBe(false);
    expect(isDeathWar("")).toBe(false);
    expect(isDeathWar(null)).toBe(false);
  });
});

describe("getTransport", () => {
  test("should return transport object if all parameters are provided", () => {
    const reference = "REF123";
    const vessel = "HMS Victory";
    const departureDate = { year: "1805", dayMonth: "21 October" };
    const expected = {
      reference: "REF123",
      vessel: "HMS Victory",
      departureDate: { year: "1805", dayMonth: "21 October" },
    };
    expect(getTransport(reference, vessel, departureDate)).toEqual(expected);
  });

  test("should return null if any parameter is null", () => {
    expect(
      getTransport(null, "HMS Victory", {
        year: "1805",
        dayMonth: "21 October",
      }),
    ).toBeNull();
    expect(
      getTransport("REF123", null, { year: "1805", dayMonth: "21 October" }),
    ).toBeNull();
    expect(getTransport("REF123", "HMS Victory", null)).toBeNull();
  });
});

describe("getDemobilizationSummaryInfo", () => {
  test("should return demobilization object if both date and country are provided", () => {
    const date = { year: "1945", dayMonth: "2 September" };
    const country = "USA";
    const expected = {
      date: { year: "1945", dayMonth: "2 September" },
      country: "USA",
    };
    expect(getDemobilizationSummaryInfo(date, country)).toEqual(expected);
  });

  test("should return null if date is null", () => {
    const country = "USA";
    expect(getDemobilizationSummaryInfo(null, country)).toBeNull();
  });

  test("should return null if country is null", () => {
    const date = { year: "1945", dayMonth: "2 September" };
    expect(getDemobilizationSummaryInfo(date, null)).toBeNull();
  });

  test("should return null if both date and country are null", () => {
    expect(getDemobilizationSummaryInfo(null, null)).toBeNull();
  });
});

describe("getDemobilization", () => {
  test("returns UK discharge event when dischargeUk is 1", () => {
    const result = getDemobilization("2023-01-01", 1, null);
    expect(result).toEqual({
      date: "2023-01-01",
      event: "End of Service in the United Kingdom",
      title: "Demobilization",
      image: null,
    });
  });

  test("returns deserter event when deserted is 1", () => {
    const result = getDemobilization("2023-01-01", null, 1);
    expect(result).toEqual({
      date: "2023-01-01",
      event: "End of Service as deserter",
      title: "Demobilization",
      image: null,
    });
  });

  test("returns general demobilization event when only date is provided", () => {
    const result = getDemobilization("2023-01-01", null, null);
    expect(result).toEqual({
      date: "2023-01-01",
      event: "Demobilization",
      title: "End of Service",
      image: null,
    });
  });

  test("returns null when date is null", () => {
    const result = getDemobilization(null, null, null);
    expect(result).toBeNull();
  });
});

describe("getDischargedCountry", () => {
  test('should return "United Kingdom" if isDischargedUk is 1', () => {
    expect(getDischargedCountry(1)).toBe("United Kingdom");
  });

  test('should return "New Zealand" if isDischargedUk is 0', () => {
    expect(getDischargedCountry(0)).toBe("New Zealand");
  });

  test('should return "New Zealand" if isDischargedUk is null', () => {
    expect(getDischargedCountry(null)).toBe("New Zealand");
  });
});
