import { DateObj, Event, EventDetail } from "@/types/tunneller";

const mockDate = (year: string, dayMonth: string): DateObj => ({
  year,
  dayMonth,
});

export const mockEvent: EventDetail = {
  description: "",
  title: null,
  image: null,
};

export const mockEventCompany: EventDetail = {
  ...mockEvent,
  description: "Something happened that day for the Company",
  title: "The Company",
  image: "image.jpg",
};
export const mockEventDescription: EventDetail = {
  ...mockEvent,
  description: "Something happened that day",
};
export const mockEventEnlisted: EventDetail = {
  ...mockEvent,
  description: "Main Body",
  title: "Enlisted",
};
export const mockEventPosted: EventDetail = {
  ...mockEvent,
  description: "Reinforcement",
  title: "Posted",
};
export const mockEventTrained: EventDetail = {
  ...mockEvent,
  description: "Military Camp, Somewhere",
  title: "Trained",
};
export const mockEventTitleAndDescription: EventDetail = {
  ...mockEvent,
  description: "Something happened",
  title: "Major Event",
};

export const mockEventDiedOfDisease: EventDetail = {
  ...mockEvent,
  description: "Military Hospital",
  title: "Died of disease",
  extraDescription: "Pneumonia",
};
export const mockEventKilledInAction: EventDetail = {
  ...mockEvent,
  description: "Killed on the battlefield",
  title: "Killed in action",
  extraDescription: "Baraffles, Rebreuve-Ranchicourt",
};
export const mockEventDiedOfWounds: EventDetail = {
  ...mockEvent,
  description: "Somewhere on the battlefield",
  title: "Died of wounds",
};
export const mockEventDiedOfAccident: EventDetail = {
  ...mockEvent,
  description: "Fatal accident",
  title: "Died of accident",
};
export const mockEventBuried: EventDetail = {
  ...mockEvent,
  description: "Cemetery, France",
  title: "Buried",
};
export const mockEventGrave: EventDetail = {
  ...mockEvent,
  description: "1 A 26",
  title: "Grave reference",
};

const mockDeathEvent = (deathEvent: EventDetail): Record<string, Event[]> => ({
  1916: [
    {
      date: mockDate("1916", "27 September"),
      event: [mockEventCompany],
    },
    {
      date: mockDate("1916", "19 November"),
      event: [mockEventDescription],
    },
  ],
  1917: [
    {
      date: mockDate("1917", "8 August"),
      event: [mockEventDescription],
    },
    {
      date: mockDate("1917", "8 August"),
      event: [deathEvent, mockEventBuried, mockEventGrave],
    },
  ],
});

export const mockFrontEventsWithDiedOfDisease: Record<string, Event[]> =
  mockDeathEvent(mockEventDiedOfDisease);

export const mockFrontEventsWithKilledInAction: Record<string, Event[]> =
  mockDeathEvent(mockEventKilledInAction);

export const mockFrontEventsWithDiedOfWounds: Record<string, Event[]> =
  mockDeathEvent(mockEventDiedOfWounds);

export const mockFrontEventsWithDiedOfAccident: Record<string, Event[]> =
  mockDeathEvent(mockEventDiedOfAccident);

export const mockFrontEvents: Record<string, Event[]> = {
  1915: [
    {
      date: mockDate("1915", "26 January"),
      event: [mockEventEnlisted],
    },
    {
      date: mockDate("1915", "14 February"),
      event: [mockEventTrained],
    },
    {
      date: mockDate("1915", "4 May"),
      event: [mockEventTitleAndDescription],
    },
  ],
  1916: [
    {
      date: mockDate("1916", "19 November"),
      event: [mockEventDescription],
    },
    {
      date: mockDate("1916", "12 December"),
      event: [mockEventCompany],
    },
  ],
  1917: [
    {
      date: mockDate("1917", "9 April"),
      event: [mockEventTitleAndDescription, mockEventCompany],
    },
    {
      date: mockDate("1917", "8 August"),
      event: [mockEventDescription],
    },
  ],
  1918: [
    {
      date: mockDate("1918", "3 March"),
      event: [mockEventTitleAndDescription],
    },
    {
      date: mockDate("1918", "13 October"),
      event: [mockEventDescription],
    },
  ],
  1919: [
    {
      date: mockDate("1919", "4 April"),
      event: [mockEventTitleAndDescription],
    },
    {
      date: mockDate("1919", "12 July"),
      event: [mockEventDescription],
    },
  ],
};

export const mockFrontEventsWithCompanyEvents = {
  "1915": [
    {
      date: {
        dayMonth: "1 September",
        year: "1915",
      },
      event: [
        {
          description: "Something happened",
          image: null,
          title: "Enlisted",
        },
      ],
    },
    {
      date: {
        dayMonth: "10 October",
        year: "1915",
      },
      event: [
        {
          description: "Something happened",
          image: null,
          title: "Trained",
        },
      ],
    },
  ],
  "1916": [
    {
      date: {
        dayMonth: "13 June",
        year: "1916",
      },
      event: [
        {
          description: "Something happened",
          image: null,
          title: null,
        },
      ],
    },
    {
      date: {
        dayMonth: "11 November",
        year: "1916",
      },
      event: [
        {
          description: "Something major happened",
          image: "major.jpg",
          title: "Major event",
        },
      ],
    },
  ],
  "1917": [
    {
      date: {
        dayMonth: "26 January",
        year: "1917",
      },
      event: [
        {
          description: "Something happened",
          image: null,
          title: null,
        },
      ],
    },
    {
      date: {
        dayMonth: "9 April",
        year: "1917",
      },
      event: [
        {
          description: "Something major happened",
          image: "major.jpg",
          title: "Major event",
        },
      ],
    },
    {
      date: {
        dayMonth: "28 June",
        year: "1917",
      },
      event: [
        {
          description: "Something happened",
          image: null,
          title: null,
        },
      ],
    },
  ],
};

export const mockFrontEventsWithTransferred = {
  ...mockFrontEventsWithCompanyEvents,
  "1917": [
    ...mockFrontEventsWithCompanyEvents["1917"],
    {
      date: {
        dayMonth: "28 September",
        year: "1917",
      },
      event: [
        {
          description: "Something happened",
          image: null,
          title: "Transferred",
        },
      ],
    },
  ],
  "1918": [
    {
      date: {
        dayMonth: "10 August",
        year: "1918",
      },
      event: [
        {
          description: "Something happened",
          image: null,
          title: "Killed in action",
        },
        {
          description: "Something happened",
          image: null,
          title: "Buried",
        },
        {
          description: "Something happened",
          image: null,
          title: "Grave reference",
        },
      ],
    },
  ],
};

export const mockFrontEventsWithDeathAfterEndOfService = {
  ...mockFrontEventsWithCompanyEvents,
  "1917": [
    ...mockFrontEventsWithCompanyEvents["1917"],
    {
      date: {
        dayMonth: "28 September",
        year: "1917",
      },
      event: [
        {
          description: "Something happened",
          image: null,
          title: "End of Service",
        },
      ],
    },
  ],
  "1918": [
    {
      date: {
        dayMonth: "2 December",
        year: "1918",
      },
      event: [
        {
          description: "Something happened",
          image: null,
          title: "Died of disease",
        },
      ],
    },
  ],
};

export function mockFrontEventsWithTransferToNzAndEndOfService(end: string) {
  return {
    ...mockFrontEventsWithCompanyEvents,
    "1917": [
      ...mockFrontEventsWithCompanyEvents["1917"],
      {
        date: {
          dayMonth: "28 September",
          year: "1917",
        },
        event: [
          {
            description: "Something happened",
            image: null,
            title: "Transfer to New Zealand",
          },
        ],
      },
    ],
    "1918": [
      {
        date: {
          dayMonth: "28 June",
          year: "1918",
        },
        event: [
          {
            description: "Something happened",
            image: null,
            title: null,
          },
        ],
      },
      {
        date: {
          dayMonth: "2 December",
          year: "1918",
        },
        event: [
          {
            description: "Something happened",
            image: null,
            title: end,
          },
        ],
      },
    ],
  };
}
