import { render, screen } from "@testing-library/react";
import { mockAfterWarDeath } from "__tests__/unit/utils/mocks/mockDeath";
import { mockDeath } from "__tests__/unit/utils/mocks/mockTunneller";

import { DiaryDied } from "@/components/Profile/ProfileDiary/DiaryDied/DiaryDied";

describe("Death War", () => {
  const component = <DiaryDied death={mockDeath} />;

  test("renders the component correctly", () => {
    const { asFragment } = render(component);

    expect(asFragment()).toMatchSnapshot();
  });

  test("renders age and date when known", () => {
    render(component);

    expect(screen.getByText("Died at the age of 89")).toBeInTheDocument();
    expect(screen.getByText("13 October 1926")).toBeInTheDocument();
  });

  test("renders date when age unknown", () => {
    const mockComponent = (
      <DiaryDied death={{ ...mockDeath, ageAtDeath: null }} />
    );

    render(mockComponent);

    expect(screen.queryByText("Died at the age of 89")).not.toBeInTheDocument();
    expect(screen.getByText("13 October 1926")).toBeInTheDocument();
  });
});

describe("Post War Death", () => {
  const component = <DiaryDied death={mockAfterWarDeath} />;

  test("renders the component correctly", () => {
    const { asFragment } = render(component);

    expect(asFragment()).toMatchSnapshot();
  });

  test("renders age and date when known", () => {
    render(component);

    expect(screen.getByText("Died at the age of 89")).toBeInTheDocument();
    expect(screen.getByText("13 October 1926")).toBeInTheDocument();
  });

  test("renders date when age unknown", () => {
    const mockComponent = (
      <DiaryDied death={{ ...mockAfterWarDeath, ageAtDeath: null }} />
    );

    render(mockComponent);

    expect(screen.queryByText("Died at the age of 89")).not.toBeInTheDocument();
    expect(screen.getByText("13 October 1926")).toBeInTheDocument();
  });
});

test("does not render the component when unknown", () => {
  const { container } = render(<DiaryDied death={null} />);

  expect(container).toBeEmptyDOMElement();
});
