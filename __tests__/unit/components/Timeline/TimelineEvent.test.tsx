import { render, screen } from "@testing-library/react";
import {
  mockEventBuried,
  mockEventCompany,
  mockEventDescription,
  mockEventDiedOfAccident,
  mockEventDiedOfDisease,
  mockEventDiedOfWounds,
  mockEventEnlisted,
  mockEventGrave,
  mockEventKilledInAction,
  mockEventPosted,
  mockEventTitleAndDescription,
  mockEventTrained,
} from "__tests__/unit/utils/mocks/mockFrontEvents";

import { TimelineEvent } from "@/components/Timeline/TimelineEvent/TimelineEvent";

test("should render a timeline", () => {
  render(
    <TimelineEvent
      event={[
        mockEventCompany,
        mockEventDescription,
        mockEventEnlisted,
        mockEventPosted,
        mockEventTrained,
        mockEventTitleAndDescription,
      ]}
      ageAtEnlistment={32}
    />,
  );

  expect(screen.getByText("Enlisted at the age of 32")).toBeInTheDocument();
  expect(screen.getByText("Main Body")).toBeInTheDocument();

  expect(screen.getByText(/Posted/)).toBeInTheDocument();
  expect(screen.getByText("Reinforcement")).toBeInTheDocument();

  expect(screen.getByText("Trained")).toBeInTheDocument();
  expect(screen.getByText("Military Camp, Somewhere")).toBeInTheDocument();

  expect(screen.getByText("Major Event")).toBeInTheDocument();
  expect(screen.getByText("Something happened")).toBeInTheDocument();

  expect(screen.getByText("Something happened that day")).toBeInTheDocument();

  const image = screen.getByRole("img", { name: "Image for The Company" });
  expect(image).toHaveAttribute("alt", "Image for The Company");
  expect(image).toHaveAttribute("src", "/images/roll/image.jpg");
  expect(
    screen.getByText("Something happened that day for the Company"),
  ).toBeInTheDocument();
});

describe("TimelineEvent with killed in action", () => {
  test("should render killed in action event with event and extra description", () => {
    render(
      <TimelineEvent
        event={[mockEventDescription, mockEventKilledInAction]}
        ageAtEnlistment={null}
      />,
    );

    expect(screen.getByText("Something happened that day")).toBeInTheDocument();

    expect(screen.getByText("Killed in action")).toBeInTheDocument();
    expect(screen.getByText("Killed on the battlefield")).toBeInTheDocument();
    expect(
      screen.getByText(/(Baraffles, Rebreuve-Ranchicourt)/),
    ).toBeInTheDocument();
  });

  test("should render killed in action event when extra description is null", () => {
    render(
      <TimelineEvent
        event={[
          mockEventDescription,
          { ...mockEventKilledInAction, extraDescription: null },
        ]}
        ageAtEnlistment={null}
      />,
    );

    expect(screen.getByText("Something happened that day")).toBeInTheDocument();

    expect(screen.getByText("Killed in action")).toBeInTheDocument();
    expect(screen.getByText("Killed on the battlefield")).toBeInTheDocument();
    expect(
      screen.queryByText(/(Baraffles, Rebreuve-Ranchicourt)/),
    ).not.toBeInTheDocument();
  });
});

describe("TimelineEvent with died of wounds", () => {
  test("should render died of wounds event", () => {
    render(
      <TimelineEvent
        event={[mockEventDescription, mockEventDiedOfWounds]}
        ageAtEnlistment={null}
      />,
    );

    expect(screen.getByText("Something happened that day")).toBeInTheDocument();

    expect(screen.getByText("Died of wounds")).toBeInTheDocument();
    expect(
      screen.getByText("Somewhere on the battlefield"),
    ).toBeInTheDocument();
  });
});

describe("TimelineEvent with died of disease", () => {
  test("should render died of disease event with event and extra description", () => {
    render(
      <TimelineEvent
        event={[mockEventDescription, mockEventDiedOfDisease]}
        ageAtEnlistment={null}
      />,
    );

    expect(screen.getByText("Something happened that day")).toBeInTheDocument();

    expect(screen.getByText("Died of disease")).toBeInTheDocument();
    expect(screen.getByText("Military Hospital")).toBeInTheDocument();
    expect(screen.getByText("(Pneumonia)")).toBeInTheDocument();
  });

  test("should render died of disease event with only event when extra description is null", () => {
    render(
      <TimelineEvent
        event={[
          mockEventDescription,
          { ...mockEventDiedOfDisease, extraDescription: null },
        ]}
        ageAtEnlistment={null}
      />,
    );

    expect(screen.getByText("Something happened that day")).toBeInTheDocument();

    expect(screen.getByText("Died of disease")).toBeInTheDocument();
    expect(screen.getByText("Military Hospital")).toBeInTheDocument();
    expect(screen.queryByText("(Pneumonia)")).not.toBeInTheDocument();
  });
});

describe("TimelineEvent with died of accident", () => {
  test("should render died of accident event", () => {
    render(
      <TimelineEvent
        event={[mockEventDescription, mockEventDiedOfAccident]}
        ageAtEnlistment={null}
      />,
    );

    expect(screen.getByText("Something happened that day")).toBeInTheDocument();

    expect(screen.getByText("Died of accident")).toBeInTheDocument();
    expect(screen.getByText("Fatal accident")).toBeInTheDocument();
  });
});

describe("TimelineEvent with buried and grave reference", () => {
  test("should render died of wounds event", () => {
    render(
      <TimelineEvent
        event={[
          mockEventBuried,
          mockEventDescription,
          mockEventDiedOfWounds,
          mockEventGrave,
        ]}
        ageAtEnlistment={null}
      />,
    );

    expect(screen.getByText("Something happened that day")).toBeInTheDocument();

    expect(screen.getByText("Died of wounds")).toBeInTheDocument();
    expect(
      screen.getByText("Somewhere on the battlefield"),
    ).toBeInTheDocument();

    expect(screen.getByText("Buried")).toBeInTheDocument();
    expect(screen.getByText("Cemetery, France")).toBeInTheDocument();

    expect(screen.getByText("Grave reference")).toBeInTheDocument();
    expect(screen.getByText("1 A 26")).toBeInTheDocument();
  });
});
