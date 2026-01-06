import { render, screen } from "@testing-library/react";

import { ProfileSummary } from "@/components/Profile/ProfileSummary/ProfileSummary";
import { findElementWithText } from "__tests__/unit/utils/findElementWithText";
import {
  mockSummary,
  mockEmbarkationUnit,
  mockEnlistment,
} from "__tests__/unit/utils/mocks/mockTunneller";

const component = (
  <ProfileSummary
    summary={mockSummary}
    embarkationUnit={mockEmbarkationUnit}
    enlistment={mockEnlistment}
    image={null}
  />
);

test("renders the component correctly", () => {
  const { asFragment } = render(component);

  expect(asFragment()).toMatchSnapshot();
});

test("renders unit and section correctly", () => {
  render(component);

  expect(findElementWithText("Main Body (Section No.2)")).toBeInTheDocument();
});

test("renders only unit when section unknown", () => {
  const mockComponent = (
    <ProfileSummary
      summary={mockSummary}
      embarkationUnit={{
        ...mockEmbarkationUnit,
        detachment: "1st Reinforcements",
        section: null,
      }}
      enlistment={mockEnlistment}
      image={null}
    />
  );
  render(mockComponent);

  expect(screen.getByText("1st Reinforcements")).toBeInTheDocument();
  expect(screen.queryByText("Section No.2")).not.toBeInTheDocument();
});

test("renders rank and serial correctly", () => {
  render(component);

  expect(screen.getByText("Sapper")).toBeInTheDocument();
  expect(screen.getByText("1/1000")).toBeInTheDocument();
});

test("renders image when known", () => {
  const mockComponent = (
    <ProfileSummary
      summary={mockSummary}
      embarkationUnit={mockEmbarkationUnit}
      enlistment={mockEnlistment}
      image={{
        url: "1-1000.jpg",
        source: {
          aucklandLibraries: null,
          archives: null,
          family: "Doe",
          newspaper: null,
          book: null,
        },
      }}
    />
  );
  render(mockComponent);

  expect(screen.getByRole("img").getAttribute("alt")).toEqual(
    "Portrait of John Smith",
  );
  expect(screen.getByRole("img").getAttribute("src")).toEqual(
    "/images/roll/tunnellers/1-1000.jpg",
  );
});

test("renders Corps when known", () => {
  const mockComponent = (
    <ProfileSummary
      summary={mockSummary}
      embarkationUnit={{
        ...mockEmbarkationUnit,
        attachedCorps: "Pay Corps",
      }}
      enlistment={mockEnlistment}
      image={null}
    />
  );
  render(mockComponent);

  expect(screen.getByText("Pay Corps")).toBeInTheDocument();
});
