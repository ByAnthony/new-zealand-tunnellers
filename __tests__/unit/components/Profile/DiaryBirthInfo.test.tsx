import { render, screen } from "@testing-library/react";
import { findElementWithText } from "__tests__/unit/utils/findElementWithText";
import { mockBirth } from "__tests__/unit/utils/mocks/mockTunneller";

import { DiaryBirth } from "@/components/Profile/ProfileDiary/DiaryBirthInfo/DiaryBirthInfo";

const component = <DiaryBirth birth={mockBirth} />;

test("renders the component correctly", () => {
  const { asFragment } = render(component);

  expect(asFragment()).toMatchSnapshot();
});

test("renders birth date and country when known", () => {
  render(component);

  const birthCountry = findElementWithText("Born in New Zealand");
  const birthDate = findElementWithText("18 December 1886");

  expect(birthCountry).toBeInTheDocument();
  expect(birthDate).toBeInTheDocument();
});

test("renders birth date when known but not birth country when unknown", () => {
  const mockComponent = (
    <DiaryBirth
      birth={{
        ...mockBirth,
        country: null,
      }}
    />
  );

  render(mockComponent);

  const birthTitle = findElementWithText("Born");
  const birthDate = findElementWithText("18 December 1886");

  expect(birthTitle).toBeInTheDocument();
  expect(birthDate).toBeInTheDocument();
});

test("renders birth country when known but not birth date when unknown", () => {
  const mockComponent = (
    <DiaryBirth
      birth={{
        ...mockBirth,
        date: null,
      }}
    />
  );

  render(mockComponent);

  const birthCountry = findElementWithText("Born in New Zealand");

  expect(birthCountry).toBeInTheDocument();
  expect(screen.queryByText("18 December 1886")).not.toBeInTheDocument();
});

test("does not render the component when birth date and country are unknown", () => {
  const { container } = render(
    <DiaryBirth
      birth={{
        ...mockBirth,
        date: null,
        country: null,
      }}
    />,
  );

  expect(container).toBeEmptyDOMElement();
});
