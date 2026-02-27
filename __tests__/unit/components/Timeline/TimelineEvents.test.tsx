import { render } from "@testing-library/react";
import { mockMilitaryYears } from "__tests__/unit/utils/mocks/mockTunneller";

import { TimelineEvents } from "@/components/Timeline/TimelineEvents/TimelineEvents";

test("should render TimelineEvents", () => {
  const { asFragment } = render(
    <TimelineEvents militaryYears={mockMilitaryYears} />,
  );

  expect(asFragment()).toMatchSnapshot();
});
