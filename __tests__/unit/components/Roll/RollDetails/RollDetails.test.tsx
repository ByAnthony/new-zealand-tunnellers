import { fireEvent, render, screen } from "@testing-library/react";
import { mockTunnellers } from "__tests__/unit/utils/mocks/mockTunnellers";

import { RollDetails } from "@/components/Roll/RollDetails/RollDetails";

const tunnellers = [mockTunnellers.D[0]];

describe("RollDetails", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("saves scroll position when a link is clicked", () => {
    render(<RollDetails listOfTunnellers={tunnellers} />);

    fireEvent.click(screen.getByRole("link"));

    expect(localStorage.getItem("roll:scrollY")).toBe("0");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
