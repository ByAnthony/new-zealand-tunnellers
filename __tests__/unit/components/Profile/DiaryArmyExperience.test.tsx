import { render, screen } from "@testing-library/react";
import {
  mockArmyExperience,
  mockArmyExperienceList,
} from "__tests__/unit/utils/mocks/mockTunneller";

import { DiaryArmyExperience } from "@/components/Profile/ProfileDiary/DiaryArmyExperience/DiaryArmyExperience";

const mockId = 1;

const component = (
  <DiaryArmyExperience
    tunnellerId={mockId}
    armyExperience={mockArmyExperienceList}
  />
);

test("renders the component correctly", () => {
  const { asFragment } = render(component);

  expect(asFragment()).toMatchSnapshot();
});

test("renders army experience when known", () => {
  render(component);

  expect(screen.getByText("NZ Infantry")).toBeInTheDocument();
  expect(screen.getByText("12 months in New Zealand")).toBeInTheDocument();
});

test("renders army experience when country is United Kingdom", () => {
  const mockComponent = (
    <DiaryArmyExperience
      tunnellerId={mockId}
      armyExperience={[
        {
          ...mockArmyExperience,
          country: "United Kingdom",
        },
      ]}
    />
  );

  render(mockComponent);

  expect(screen.getByText("NZ Infantry")).toBeInTheDocument();
  expect(
    screen.getByText("12 months in the United Kingdom"),
  ).toBeInTheDocument();
});

test("renders army experience when duration unknown", () => {
  const mockComponent = (
    <DiaryArmyExperience
      tunnellerId={mockId}
      armyExperience={[
        {
          ...mockArmyExperience,
          duration: null,
        },
      ]}
    />
  );

  render(mockComponent);

  expect(screen.getByText("NZ Infantry")).toBeInTheDocument();
  expect(screen.getByText("New Zealand")).toBeInTheDocument();
});

test("renders army experience when duration unknown and country is United Kingdom", () => {
  const mockComponent = (
    <DiaryArmyExperience
      tunnellerId={mockId}
      armyExperience={[
        {
          ...mockArmyExperience,
          duration: null,
          country: "United Kingdom",
        },
      ]}
    />
  );

  render(mockComponent);

  expect(screen.getByText("NZ Infantry")).toBeInTheDocument();
  expect(screen.getByText("United Kingdom")).toBeInTheDocument();
  expect(screen.queryByText("the United Kingdom")).not.toBeInTheDocument();
});

test("renders army experience when country unknown", () => {
  const mockComponent = (
    <DiaryArmyExperience
      tunnellerId={mockId}
      armyExperience={[
        {
          ...mockArmyExperience,
          country: null,
        },
      ]}
    />
  );

  render(mockComponent);

  expect(screen.getByText("NZ Infantry")).toBeInTheDocument();
  expect(screen.getByText("12 months")).toBeInTheDocument();
});

test("renders army experience when country and duration unknown", () => {
  const mockComponent = (
    <DiaryArmyExperience
      tunnellerId={mockId}
      armyExperience={[
        {
          ...mockArmyExperience,
          country: null,
          duration: null,
        },
      ]}
    />
  );

  render(mockComponent);

  expect(screen.getByText("NZ Infantry")).toBeInTheDocument();
  expect(screen.queryByText("12 months")).not.toBeInTheDocument();
  expect(screen.queryByText("New Zealand")).not.toBeInTheDocument();
});

test("renders conflict experience", () => {
  const mockComponent = (
    <DiaryArmyExperience
      tunnellerId={mockId}
      armyExperience={[
        {
          ...mockArmyExperience,
          unit: "Other",
          country: null,
          conflict: "South Africa War",
          duration: "2 years",
        },
      ]}
    />
  );

  render(mockComponent);

  expect(screen.getByText("South Africa War")).toBeInTheDocument();
  expect(screen.getByText("2 years")).toBeInTheDocument();
});

test("renders conflict experience when duration unknown", () => {
  const mockComponent = (
    <DiaryArmyExperience
      tunnellerId={mockId}
      armyExperience={[
        {
          ...mockArmyExperience,
          unit: "Other",
          country: null,
          conflict: "South Africa War",
          duration: null,
        },
      ]}
    />
  );

  render(mockComponent);

  expect(screen.getByText("South Africa War")).toBeInTheDocument();
  expect(screen.queryByText("2 years")).not.toBeInTheDocument();
});

test("renders conflict experience when unit known", () => {
  const mockComponent = (
    <DiaryArmyExperience
      tunnellerId={mockId}
      armyExperience={[
        {
          ...mockArmyExperience,
          unit: "NZ Infantry",
          country: null,
          conflict: "South Africa War",
          duration: null,
        },
      ]}
    />
  );

  render(mockComponent);

  expect(screen.getByText("South Africa War")).toBeInTheDocument();
  expect(screen.getByText("NZ Infantry")).toBeInTheDocument();
});

test("does not render army experience when unknown", () => {
  render(<DiaryArmyExperience tunnellerId={mockId} armyExperience={[]} />);

  expect(screen.queryByRole("list")).not.toBeInTheDocument();
});
