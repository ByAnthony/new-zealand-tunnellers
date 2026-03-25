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

  test("saves return URL when a link is clicked", () => {
    render(<RollDetails listOfTunnellers={tunnellers} />);

    fireEvent.click(screen.getByRole("link"));

    expect(localStorage.getItem("tunnellers:return")).toBe("http://localhost/");
  });

  test("saves both scroll position and return URL together", () => {
    render(<RollDetails listOfTunnellers={tunnellers} />);

    fireEvent.click(screen.getByRole("link"));

    expect(localStorage.getItem("roll:scrollY")).toBe("0");
    expect(localStorage.getItem("tunnellers:return")).not.toBeNull();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
