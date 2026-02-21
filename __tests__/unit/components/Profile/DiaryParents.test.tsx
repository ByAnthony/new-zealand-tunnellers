import { render, screen } from "@testing-library/react";
import { mockParents } from "__tests__/unit/utils/mocks/mockTunneller";

import { DiaryParents } from "@/components/Profile/ProfileDiary/DiaryParents/DiaryParents";

const component = <DiaryParents parents={mockParents} />;

test("renders the component correctly", () => {
  const { asFragment } = render(component);

  expect(asFragment()).toMatchSnapshot();
});

test("renders parents when known", () => {
  render(component);

  expect(screen.getByText("Parents")).toBeInTheDocument();
  expect(screen.getByText("Mother")).toBeInTheDocument();
  expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  expect(screen.getByText("Father")).toBeInTheDocument();
  expect(screen.getByText("John Doe")).toBeInTheDocument();
});

test("renders only mother when father unknown", () => {
  const mockComponent = (
    <DiaryParents parents={{ ...mockParents, father: null }} />
  );

  render(mockComponent);

  expect(screen.queryByText("Parents")).not.toBeInTheDocument();
  expect(screen.getByText("Parent")).toBeInTheDocument();
  expect(screen.getByText("Mother")).toBeInTheDocument();
  expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  expect(screen.queryByText("Father")).not.toBeInTheDocument();
  expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
});

test("renders only father when father unknown", () => {
  const mockComponent = (
    <DiaryParents parents={{ ...mockParents, mother: null }} />
  );

  render(mockComponent);

  expect(screen.queryByText("Parents")).not.toBeInTheDocument();
  expect(screen.getByText("Parent")).toBeInTheDocument();
  expect(screen.queryByText("Mother")).not.toBeInTheDocument();
  expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument();
  expect(screen.getByText("Father")).toBeInTheDocument();
  expect(screen.getByText("John Doe")).toBeInTheDocument();
});

test("does not render the component when parents are unknown", () => {
  const { container } = render(
    <DiaryParents
      parents={{
        ...mockParents,
        mother: null,
        father: null,
      }}
    />,
  );

  expect(container).toBeEmptyDOMElement();
});
