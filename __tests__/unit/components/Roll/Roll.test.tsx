import { fireEvent, screen, render, within } from "@testing-library/react";
import { mockTunnellers } from "__tests__/unit/utils/mocks/mockTunnellers";

import { Roll } from "@/components/Roll/Roll";
import { AttachedCorpsBadge } from "@/components/Roll/RollDetails/RollDetails";

async function renderRoll() {
  const utils = render(<Roll tunnellers={mockTunnellers} />);
  await screen.findByText("Filters");
  return utils;
}

describe("Roll", () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = jest.fn();
  });

  test("matches the snapshot", async () => {
    const { asFragment } = await renderRoll();

    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the title", async () => {
    await renderRoll();

    expect(screen.getByText(/The New Zealand/)).toBeInTheDocument();
    expect(screen.getByText(/Tunnellers/)).toBeInTheDocument();
  });

  test("renders the total filtered results", async () => {
    await renderRoll();

    expect(screen.getByText(/4 results/)).toBeInTheDocument();
  });

  test("renders the RollAlphabet component when there are filtered results", async () => {
    await renderRoll();

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

  test("renders the RollNoResults component when there are no filtered results", async () => {
    const emptyTunnellers = {};
    render(<Roll tunnellers={emptyTunnellers} />);
    await screen.findByText("Filters");

    expect(screen.getByText(/0 result/)).toBeInTheDocument();
    expect(
      screen.getByText("Sorry, no profile matches your filters"),
    ).toBeInTheDocument();
  });

  test("should filter the detachment", async () => {
    await renderRoll();

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

  test("should filter the corps", async () => {
    await renderRoll();

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

  test("should filter Sapper rank", async () => {
    await renderRoll();

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

  test("should filter Other ranks", async () => {
    await renderRoll();

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

  test("should filter unknown birth years", async () => {
    await renderRoll();

    const checkbox = screen.getByRole("checkbox", {
      name: "Unknown birth year",
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

  test("should filter unknown death years", async () => {
    await renderRoll();

    const checkbox = screen.getByRole("checkbox", {
      name: "Unknown death year",
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

  describe("filter button badge", () => {
    test("does not show badge when no filters are active", async () => {
      await renderRoll();
      const filterButton = screen.getByRole("button", { name: "Filters" });
      expect(within(filterButton).queryByText(/^\d+$/)).not.toBeInTheDocument();
    });

    test("shows badge with count 1 when detachment filter is active", async () => {
      await renderRoll();
      fireEvent.click(
        screen.getByRole("checkbox", { name: "2nd Reinforcements" }),
      );
      const filterButton = screen.getByRole("button", { name: /Filters/ });
      expect(within(filterButton).getByText("1")).toBeInTheDocument();
    });

    test("shows badge with count 2 when detachment and corps filters are active", async () => {
      await renderRoll();
      fireEvent.click(
        screen.getByRole("checkbox", { name: "2nd Reinforcements" }),
      );
      fireEvent.click(screen.getByRole("checkbox", { name: "Army Pay Corps" }));
      const filterButton = screen.getAllByRole("button", {
        name: /Filters/,
      })[0];
      expect(within(filterButton).getByText("2")).toBeInTheDocument();
    });

    test("does not count birth year when all years are selected by default", async () => {
      await renderRoll();
      const filterButton = screen.getByRole("button", { name: "Filters" });
      expect(within(filterButton).queryByText(/^\d+$/)).not.toBeInTheDocument();
    });

    test("shows badge count 1 when unknown birth year is unchecked", async () => {
      await renderRoll();
      fireEvent.click(
        screen.getByRole("checkbox", { name: "Unknown birth year" }),
      );
      const filterButton = screen.getByRole("button", { name: /Filters/ });
      expect(within(filterButton).getByText("1")).toBeInTheDocument();
    });

    test("shows badge count 1 when unknown death year is unchecked", async () => {
      await renderRoll();
      fireEvent.click(
        screen.getByRole("checkbox", { name: "Unknown death year" }),
      );
      const filterButton = screen.getByRole("button", { name: /Filters/ });
      expect(within(filterButton).getByText("1")).toBeInTheDocument();
    });

    test("removes badge when filters are reset", async () => {
      await renderRoll();
      fireEvent.click(
        screen.getByRole("checkbox", { name: "2nd Reinforcements" }),
      );
      fireEvent.click(screen.getByText("Reset filters"));
      const filterButton = screen.getByRole("button", { name: "Filters" });
      expect(within(filterButton).queryByText(/^\d+$/)).not.toBeInTheDocument();
    });
  });

  describe("reset filters button", () => {
    test("is disabled by default when no filters are active", async () => {
      await renderRoll();
      expect(
        screen.getByRole("button", { name: "Reset filters" }),
      ).toBeDisabled();
    });

    test("is enabled when a filter is active", async () => {
      await renderRoll();
      fireEvent.click(
        screen.getByRole("checkbox", { name: "2nd Reinforcements" }),
      );
      expect(
        screen.getByRole("button", { name: "Reset filters" }),
      ).toBeEnabled();
    });

    test("becomes disabled again after resetting filters", async () => {
      await renderRoll();
      fireEvent.click(
        screen.getByRole("checkbox", { name: "2nd Reinforcements" }),
      );
      fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
      expect(
        screen.getByRole("button", { name: "Reset filters" }),
      ).toBeDisabled();
    });

    test("resets filters and restores results when clicked", async () => {
      await renderRoll();
      fireEvent.click(
        screen.getByRole("checkbox", { name: "2nd Reinforcements" }),
      );
      expect(screen.getByText("1 result")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
      expect(screen.getByText("4 results")).toBeInTheDocument();
    });
  });

  test("renders the RollFilter component for desktop view", async () => {
    await renderRoll();

    expect(screen.getByText("Detachments")).toBeInTheDocument();
    expect(screen.getByText("Corps")).toBeInTheDocument();
    expect(screen.getByText("Birth")).toBeInTheDocument();
    expect(screen.getByText("Death")).toBeInTheDocument();
    expect(screen.getByText("Ranks")).toBeInTheDocument();
  });

  test("should filter Tunnelling Corps shows only tunnellers without attached corps", async () => {
    await renderRoll();

    const checkbox = screen.getByRole("checkbox", { name: "Tunnelling Corps" });
    fireEvent.click(checkbox);

    expect(screen.getByText("3 results")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: "Driver Army Pay Corps Marty McFly 5th Reinforcements ?-†? →",
      }),
    ).not.toBeInTheDocument();
  });

  describe("localStorage", () => {
    test("restores valid detachment filter from localStorage on mount", async () => {
      localStorage.setItem(
        "filters",
        JSON.stringify({
          detachment: [2],
          corps: [],
          ranks: {
            Officers: [],
            "Non-Commissioned Officers": [],
            "Other Ranks": [],
          },
          birthYear: ["1886", "1897"],
          unknownBirthYear: "unknown",
          deathYear: ["1935", "1952"],
          unknownDeathYear: "unknown",
        }),
      );

      await renderRoll();

      expect(screen.getByText("1 result")).toBeInTheDocument();
    });

    test("falls back to default filters when localStorage has invalid field types", async () => {
      localStorage.setItem(
        "filters",
        JSON.stringify({
          detachment: "not-an-array",
          corps: 42,
          birthYear: null,
          unknownBirthYear: 999,
          deathYear: "wrong-type",
          unknownDeathYear: true,
        }),
      );

      await renderRoll();

      expect(screen.getByText("4 results")).toBeInTheDocument();
    });

    test("restores current page from localStorage", async () => {
      localStorage.setItem("page", "1");

      await renderRoll();

      expect(screen.getByText("4 results")).toBeInTheDocument();
    });

    test("ignores NaN page from localStorage", async () => {
      localStorage.setItem("page", "abc");

      await renderRoll();

      expect(screen.getByText("4 results")).toBeInTheDocument();
    });
  });
});

describe("AttachedCorpsBadge", () => {
  test("renders correctly with given props", () => {
    render(<AttachedCorpsBadge attachedCorps="Engineers" />);

    const badgeElement = screen.getByText("Engineers");
    expect(badgeElement).toBeInTheDocument();
  });
});
