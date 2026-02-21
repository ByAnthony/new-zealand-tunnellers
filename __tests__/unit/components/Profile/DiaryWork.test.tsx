import { render, screen } from "@testing-library/react";
import { mockEmployment } from "__tests__/unit/utils/mocks/mockTunneller";

import { DiaryWork } from "@/components/Profile/ProfileDiary/DiaryWork/DiaryWork";

const component = <DiaryWork employment={mockEmployment} />;

test("renders the component correctly", () => {
  const { asFragment } = render(component);

  expect(asFragment()).toMatchSnapshot();
});

test("renders employment when known", () => {
  render(component);

  expect(screen.getByText("Work")).toBeInTheDocument();
  expect(screen.getByText("Occupation")).toBeInTheDocument();
  expect(screen.getByText("Goldminer")).toBeInTheDocument();
  expect(screen.getByText("Employer")).toBeInTheDocument();
  expect(screen.getByText("Goldmining Company")).toBeInTheDocument();
});

test("renders only occupation when employer unknown", () => {
  const mockComponent = (
    <DiaryWork
      employment={{
        ...mockEmployment,
        employer: null,
      }}
    />
  );

  render(mockComponent);

  expect(screen.getByText("Work")).toBeInTheDocument();
  expect(screen.getByText("Occupation")).toBeInTheDocument();
  expect(screen.getByText("Goldminer")).toBeInTheDocument();
  expect(screen.queryByText("Employer")).not.toBeInTheDocument();
  expect(screen.queryByText("Goldmining Company")).not.toBeInTheDocument();
});

test("does not render employment when unknown", () => {
  const { container } = render(
    <DiaryWork
      employment={{
        ...mockEmployment,
        occupation: null,
        employer: null,
      }}
    />,
  );

  expect(container).toBeEmptyDOMElement();
});
