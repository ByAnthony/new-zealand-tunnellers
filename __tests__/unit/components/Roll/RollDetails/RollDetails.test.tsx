import { fireEvent, render, screen } from "@testing-library/react";

import { RollDetails } from "@/components/Roll/RollDetails/RollDetails";
import { mockTunnellers } from "@/test-utils/mocks/mockTunnellers";

const tunnellers = [mockTunnellers.D[0]];

describe("RollDetails", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
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
    expect(sessionStorage.getItem("roll:view")).toBe("list");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
