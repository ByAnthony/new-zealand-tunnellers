import { render, screen } from "@testing-library/react";
import { useTranslations } from "next-intl";

import { TimelineEvents } from "@/components/Timeline/TimelineEvents/TimelineEvents";
import { mockMilitaryYears } from "@/test-utils/mocks/mockTunneller";
import { MilitaryYears } from "@/types/tunneller";

beforeEach(() => {
  (useTranslations as jest.Mock).mockImplementation((namespace: string) => {
    if (namespace !== "timeline") {
      return (key: string) => key;
    }

    return (key: string, values?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        year: "Year {year}",
        enlisted: "Enlisted",
        posted: "Posted",
        trained: "Trained",
        killedInAction: "Killed in action",
        diedOfWounds: "Died of wounds",
        diedOfDisease: "Died of disease",
        diedOfAccident: "Died of accident",
        buried: "Buried",
        graveReference: "Grave reference",
        demobilization: "Demobilisation",
        endOfService: "End of Service",
        endOfServiceUK: "End of Service in the United Kingdom",
        transferToEngland: "Transfer to England",
        transferToNewZealand: "Transfer to New Zealand",
        transferred: "Transferred",
        "months.June": "June",
        companyEventAlt: "Image for {title}",
        companyEventAltFallback: "Company event",
      };

      if (key === "enlistedAtAge") {
        return `${values?.title} at the age of ${values?.age}`;
      }

      const translation = translations[key];
      if (!translation) return key;

      if (!values) return translation;
      return translation.replace(/\{(\w+)\}/g, (_match, token: string) =>
        String(values[token] ?? `{${token}}`),
      );
    };
  });
});

test("should render TimelineEvents", () => {
  const { asFragment } = render(
    <TimelineEvents militaryYears={mockMilitaryYears} />,
  );

  expect(asFragment()).toMatchSnapshot();
});

test("renders mixed semantic-key timeline content end to end", () => {
  const militaryYears: MilitaryYears = {
    ...mockMilitaryYears,
    enlistment: {
      ...mockMilitaryYears.enlistment,
      ageAtEnlistment: 32,
    },
    frontEvents: {
      "1917": [
        {
          date: { year: "1917", dayMonth: "9 April" },
          event: [
            {
              description: "Main Body",
              title: null,
              titleKey: "Enlisted",
              image: null,
            },
            {
              description: "Military Camp, Somewhere",
              title: null,
              titleKey: "Trained",
              image: null,
            },
          ],
        },
        {
          date: { year: "1917", dayMonth: "15 May" },
          event: [
            {
              description: "Reinforcement",
              title: null,
              titleKey: "Posted",
              image: null,
            },
          ],
        },
        {
          date: { year: "1917", dayMonth: "28 June" },
          event: [
            {
              description: "HMNZT 300 Ulimaroa",
              title: null,
              titleKey: "Transfer to New Zealand",
              image: null,
            },
          ],
        },
      ],
      "1918": [
        {
          date: { year: "1918", dayMonth: "10 August" },
          event: [
            {
              description: "Killed on the battlefield",
              title: null,
              titleKey: "Killed in action",
              image: null,
              extraDescription: "Baraffles, Rebreuve-Ranchicourt",
            },
            {
              description: "Cemetery, France",
              title: null,
              titleKey: "Buried",
              image: null,
            },
            {
              description: "1 A 26",
              title: null,
              titleKey: "Grave reference",
              image: null,
            },
          ],
        },
        {
          date: { year: "1918", dayMonth: "2 December" },
          event: [
            {
              description: "",
              descriptionKey: "endOfServiceUK",
              title: null,
              titleKey: "Demobilization",
              image: null,
            },
          ],
        },
      ],
    },
  };

  render(<TimelineEvents militaryYears={militaryYears} />);

  expect(
    screen.getByRole("heading", { level: 2, name: "Year 1917" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 2, name: "Year 1918" }),
  ).toBeInTheDocument();
  expect(screen.getByText("9 April")).toBeInTheDocument();
  expect(screen.getByText("15 May")).toBeInTheDocument();
  expect(screen.getByText("10 August")).toBeInTheDocument();

  expect(screen.getByText("Enlisted at the age of 32")).toBeInTheDocument();
  expect(screen.getByText("Posted at the age of 32")).toBeInTheDocument();
  expect(screen.getByText("Reinforcement")).toBeInTheDocument();
  expect(screen.getByText("Trained")).toBeInTheDocument();
  expect(screen.getByText("Transfer to New Zealand")).toBeInTheDocument();
  expect(screen.getByText("Killed in action")).toBeInTheDocument();
  expect(screen.getByText("Buried")).toBeInTheDocument();
  expect(screen.getByText("Grave reference")).toBeInTheDocument();
  expect(screen.getByText("Demobilisation")).toBeInTheDocument();
  expect(
    screen.getByText("End of Service in the United Kingdom"),
  ).toBeInTheDocument();
});
