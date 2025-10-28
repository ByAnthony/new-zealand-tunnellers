import { fireEvent, screen, render } from "@testing-library/react";

import { Roll } from "@/components/Roll/Roll";
import { AttachedCorpsBadge } from "@/components/Roll/RollDetails/RollDetails";
import { mockTunnellers } from "__tests__/unit/utils/mocks/mockTunnellers";

describe("Roll", () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = jest.fn();
  });

  test("matches the snapshot", async () => {
    const { asFragment } = render(<Roll tunnellers={mockTunnellers} />);

    await screen.findByText("Filters");
    await screen.getByRole("link", {
      name: "Sapper Emmett Brown Main Body ?-1935 →",
    });

    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the title", () => {
    render(<Roll tunnellers={mockTunnellers} />);
    expect(screen.getByText(/The New Zealand/)).toBeInTheDocument();
    expect(screen.getByText(/Tunnellers/)).toBeInTheDocument();
  });

  test("renders the total filtered results", () => {
    render(<Roll tunnellers={mockTunnellers} />);
    expect(screen.getByText(/4 results/)).toBeInTheDocument();
  });

  test("renders the RollAlphabet component when there are filtered results", () => {
    render(<Roll tunnellers={mockTunnellers} />);
    expect(
      screen.getByRole("link", {
        name: "Sapper Emmett Brown Main Body ?-1935 →",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Sapper John Doe Main Body 1886-1952 →",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Driver Army Pay Corps Marty McFly 5th Reinforcements ?-†? →",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Sapper Biff Tanen 2nd Reinforcements 1897-†? →",
      }),
    ).toBeInTheDocument();
  });

  test("renders the RollNoResults component when there are no filtered results", () => {
    const emptyTunnellers = {};
    render(<Roll tunnellers={emptyTunnellers} />);
    expect(
      screen.getByText("Sorry, no profile matches your filters"),
    ).toBeInTheDocument();
  });

  test("should filter the detachment", () => {
    render(<Roll tunnellers={mockTunnellers} />);
    const checkbox = screen.getByRole("checkbox", {
      name: "2nd Reinforcements",
    });
    fireEvent.click(checkbox);
    expect(
      screen.queryByRole("link", {
        name: "Sapper Emmett Brown Main Body ?-1935 →",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: "Sapper John Doe Main Body 1886-1952 →",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: "Driver Army Pay Corps Marty McFly 5th Reinforcements ?-†? →",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Sapper Biff Tanen 2nd Reinforcements 1897-†? →",
      }),
    ).toBeInTheDocument();
  });

  test("should filter the corps", () => {
    render(<Roll tunnellers={mockTunnellers} />);
    const checkbox = screen.getByRole("checkbox", {
      name: "Army Pay Corps",
    });
    fireEvent.click(checkbox);
    expect(
      screen.queryByRole("link", {
        name: "Sapper Emmett Brown Main Body ?-1935 →",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: "Sapper John Doe Main Body 1886-1952 →",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Driver Army Pay Corps Marty McFly 5th Reinforcements ?-†? →",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: "Sapper Biff Tanen 2nd Reinforcements 1897-†? →",
      }),
    ).not.toBeInTheDocument();
  });

  test("should filter Sapper rank", () => {
    render(<Roll tunnellers={mockTunnellers} />);
    const checkbox = screen.getByRole("checkbox", {
      name: "Sapper",
    });
    fireEvent.click(checkbox);
    expect(
      screen.getByRole("link", {
        name: "Sapper Emmett Brown Main Body ?-1935 →",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Sapper John Doe Main Body 1886-1952 →",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: "Driver Army Pay Corps Marty McFly 5th Reinforcements ?-†? →",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Sapper Biff Tanen 2nd Reinforcements 1897-†? →",
      }),
    ).toBeInTheDocument();
  });

  test("should filter Other ranks", () => {
    render(<Roll tunnellers={mockTunnellers} />);
    const checkbox = screen.getByRole("checkbox", {
      name: "Other Ranks",
    });
    fireEvent.click(checkbox);
    expect(screen.getByText("4 results")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Sapper Emmett Brown Main Body ?-1935 →",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Sapper John Doe Main Body 1886-1952 →",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Driver Army Pay Corps Marty McFly 5th Reinforcements ?-†? →",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Sapper Biff Tanen 2nd Reinforcements 1897-†? →",
      }),
    ).toBeInTheDocument();
  });

  test("should filter unknown birth years", () => {
    render(<Roll tunnellers={mockTunnellers} />);
    const checkbox = screen.getByRole("checkbox", {
      name: "Includes unknown birth year",
    });
    fireEvent.click(checkbox);
    expect(screen.getByText("2 results")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: "Sapper Emmett Brown Main Body ?-1935 →",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Sapper John Doe Main Body 1886-1952 →",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: "Driver Army Pay Corps Marty McFly 5th Reinforcements ?-†? →",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Sapper Biff Tanen 2nd Reinforcements 1897-†? →",
      }),
    ).toBeInTheDocument();
  });

  test("should filter unknown death years", () => {
    render(<Roll tunnellers={mockTunnellers} />);
    const checkbox = screen.getByRole("checkbox", {
      name: "Includes unknown death year",
    });
    fireEvent.click(checkbox);
    expect(screen.getByText("2 results")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Sapper Emmett Brown Main Body ?-1935 →",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Sapper John Doe Main Body 1886-1952 →",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: "Driver Army Pay Corps Marty McFly 5th Reinforcements ?-†? →",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: "Sapper Biff Tanen 2nd Reinforcements 1897-†? →",
      }),
    ).not.toBeInTheDocument();
  });

  test("calls handleResetFilters when the reset filter button is clicked", () => {
    render(<Roll tunnellers={mockTunnellers} />);
    const checkbox = screen.getByRole("checkbox", {
      name: "2nd Reinforcements",
    });
    fireEvent.click(checkbox);
    expect(screen.getByText("1 result")).toBeInTheDocument();
    const resetButton = screen.getByText("Reset filters");
    fireEvent.click(resetButton);
    expect(screen.getByText("4 results")).toBeInTheDocument();
  });

  test("renders the RollFilter component for desktop view", () => {
    render(<Roll tunnellers={mockTunnellers} />);
    expect(screen.getByText("Detachments")).toBeInTheDocument();
    expect(screen.getByText("Corps")).toBeInTheDocument();
    expect(screen.getByText("Birth Years")).toBeInTheDocument();
    expect(screen.getByText("Death Years")).toBeInTheDocument();
    expect(screen.getByText("Ranks")).toBeInTheDocument();
  });
});

describe("AttachedCorpsBadge", () => {
  test("renders correctly with given props", () => {
    render(<AttachedCorpsBadge attachedCorps="Engineers" />);
    const badgeElement = screen.getByText("Engineers");
    expect(badgeElement).toBeInTheDocument();
  });
});
