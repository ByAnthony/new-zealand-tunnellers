import { render } from "@testing-library/react";

import { TimelineEvents } from "@/components/Timeline/TimelineEvents/TimelineEvents";
import { mockMilitaryYears } from "@/test-utils/mocks/mockTunneller";

test("should render TimelineEvents", () => {
  const { asFragment } = render(
    <TimelineEvents militaryYears={mockMilitaryYears} />,
  );

  expect(asFragment()).toMatchSnapshot();
});
