import { render, screen } from "@testing-library/react";

import { DiaryMedal } from "@/components/Profile/ProfileDiary/DiaryMedal/DiaryMedal";
import {
  mockBritishWarMedal,
  mockMedals,
  mockVictoryMedal,
} from "__tests__/unit/utils/mocks/mockTunneller";

const component = <DiaryMedal medals={mockMedals} />;

test("renders the component correctly", () => {
  const { asFragment } = render(component);

  expect(asFragment()).toMatchSnapshot();
});

test("renders British War and Victory Medals correctly", () => {
  render(component);

  expect(screen.getByText("British War Medal")).toBeInTheDocument();
  expect(screen.getAllByRole("img")[0].getAttribute("alt")).toEqual(
    "British War Medal ribbon",
  );
  expect(screen.getAllByRole("img")[0].getAttribute("src")).toEqual(
    "/images/roll/medals/british-war-medal.png",
  );
  expect(screen.getByText("Victory Medal")).toBeInTheDocument();
  expect(screen.getAllByRole("img")[1].getAttribute("alt")).toEqual(
    "Victory Medal ribbon",
  );
  expect(screen.getAllByRole("img")[1].getAttribute("src")).toEqual(
    "/images/roll/medals/victory-medal.png",
  );
});

test("renders Military Medal correctly", () => {
  const mockMilitaryMedal = {
    name: "Military Medal",
    country: "United Kingdom",
    image: "military-medal.png",
    citation: "For bravery in the field",
  };

  const mockComponent = (
    <DiaryMedal
      medals={[
        { ...mockBritishWarMedal },
        { ...mockVictoryMedal },
        { ...mockMilitaryMedal },
      ]}
    />
  );

  render(mockComponent);

  expect(screen.getByText("British War Medal")).toBeInTheDocument();
  expect(screen.getAllByRole("img")[0].getAttribute("alt")).toEqual(
    "British War Medal ribbon",
  );
  expect(screen.getAllByRole("img")[0].getAttribute("src")).toEqual(
    "/images/roll/medals/british-war-medal.png",
  );
  expect(screen.getByText("Victory Medal")).toBeInTheDocument();
  expect(screen.getAllByRole("img")[1].getAttribute("alt")).toEqual(
    "Victory Medal ribbon",
  );
  expect(screen.getAllByRole("img")[1].getAttribute("src")).toEqual(
    "/images/roll/medals/victory-medal.png",
  );
  expect(screen.getByText("Military Medal")).toBeInTheDocument();
  expect(screen.getAllByRole("img")[2].getAttribute("alt")).toEqual(
    "Military Medal ribbon",
  );
  expect(screen.getAllByRole("img")[2].getAttribute("src")).toEqual(
    "/images/roll/medals/military-medal.png",
  );
  expect(screen.getByText("For bravery in the field.")).toBeInTheDocument();
});

test("renders Foreign Medal with country correctly", () => {
  const mockForeignMedal = {
    name: "Medal for Steadfastness and Loyalty",
    country: "Romania",
    image: "steadfastness-loyalty-medal.png",
    citation:
      "For distinguished services rendered during the course of the campaign",
  };

  const mockComponent = (
    <DiaryMedal
      medals={[
        { ...mockBritishWarMedal },
        { ...mockVictoryMedal },
        { ...mockForeignMedal },
      ]}
    />
  );

  render(mockComponent);

  expect(
    screen.getByText("Medal for Steadfastness and Loyalty (Romania)"),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("img")[2].getAttribute("alt")).toEqual(
    "Medal for Steadfastness and Loyalty ribbon",
  );
  expect(screen.getAllByRole("img")[2].getAttribute("src")).toEqual(
    "/images/roll/medals/steadfastness-loyalty-medal.png",
  );
  expect(
    screen.getByText(
      "For distinguished services rendered during the course of the campaign.",
    ),
  ).toBeInTheDocument();
});

test("does not render the component when medals unknown", () => {
  const mockComponent = <DiaryMedal medals={[]} />;

  const { container } = render(mockComponent);

  expect(container).toBeEmptyDOMElement();
});
