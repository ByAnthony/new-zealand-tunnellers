import {
  fireEvent,
  screen,
  render,
  within,
  waitFor,
} from "@testing-library/react";

import { Roll } from "@/components/Roll/Roll";
import { AttachedCorpsBadge } from "@/components/Roll/RollDetails/RollDetails";
import { mockTunnellers } from "@/test-utils/mocks/mockTunnellers";

const mockReplace = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ replace: mockReplace }),
}));

async function renderRoll() {
  const utils = render(<Roll tunnellers={mockTunnellers} />);
  await screen.findByText("Filters");
  return utils;
}

describe("Roll", () => {
  beforeEach(() => {
    localStorage.clear();
    mockSearchParams = new URLSearchParams();
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

  test("reverses the roll order when sort button is clicked", async () => {
    await renderRoll();

    const before = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => {
        return heading.textContent;
      });
    expect(before).toEqual(["B", "D", "M", "T"]);

    fireEvent.click(screen.getByRole("button", { name: "Z to A" }));

    const after = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => {
        return heading.textContent;
      });
    expect(after).toEqual(["T", "M", "D", "B"]);
    expect(screen.getByRole("button", { name: "A to Z" })).toBeInTheDocument();
  });

  test("resets to page 1 when sort order changes", async () => {
    mockSearchParams = new URLSearchParams("page=2");

    await renderRoll();

    const sortButtons = screen.getAllByRole("button", { name: "Z to A" });
    fireEvent.click(sortButtons[0]);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("?sort=desc", {
        scroll: false,
      });
    });
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

  describe("URL params", () => {
    test("restores valid detachment filter from URL params on mount", async () => {
      mockSearchParams = new URLSearchParams("detachment=2nd-reinforcements");

      await renderRoll();

      expect(screen.getByText("1 result")).toBeInTheDocument();
    });

    test("shows all results when no filter params in URL", async () => {
      await renderRoll();

      expect(screen.getByText("4 results")).toBeInTheDocument();
    });

    test("restores current page from URL params", async () => {
      mockSearchParams = new URLSearchParams("page=1");

      await renderRoll();

      expect(screen.getByText("4 results")).toBeInTheDocument();
    });

    test("ignores invalid page param from URL", async () => {
      mockSearchParams = new URLSearchParams("page=abc");

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
