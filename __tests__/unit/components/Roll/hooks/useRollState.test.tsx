import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { useRollState } from "@/components/Roll/hooks/useRollState";
import { mockTunnellers } from "@/test-utils/mocks/mockTunnellers";

const mockReplace = jest.fn();
let mockSearchParams = new URLSearchParams();
const originalReplaceState = window.history.replaceState.bind(window.history);

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ replace: mockReplace }),
}));

function RollStateHarness({
  preserveMapParams = false,
}: {
  preserveMapParams?: boolean;
}) {
  const { handleResetFilters, rollFiltersProps } = useRollState({
    tunnellers: mockTunnellers,
    locale: "en",
    preserveMapParams,
  });

  return (
    <div>
      <button onClick={rollFiltersProps.handleSliderDragStart}>
        start drag
      </button>
      <button
        onClick={() => rollFiltersProps.handleBirthSliderChange([1886, 1886])}
      >
        change birth years
      </button>
      <button onClick={() => rollFiltersProps.handleDetachmentFilter(1)}>
        toggle detachment
      </button>
      <button onClick={() => rollFiltersProps.handleMaritalStatusFilter(1)}>
        toggle marital status
      </button>
      <button onClick={rollFiltersProps.handleSliderDragComplete}>
        complete drag
      </button>
      <button onClick={handleResetFilters}>reset filters</button>
      <div data-testid="birth-range">
        {rollFiltersProps.startBirthYear}-{rollFiltersProps.endBirthYear}
      </div>
    </div>
  );
}

describe("useRollState", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockSearchParams = new URLSearchParams();
    window.scrollTo = jest.fn();
    window.history.replaceState = jest.fn((data, unused, url) =>
      originalReplaceState(data, unused, url),
    );
    originalReplaceState(null, "", "/");
  });

  test("updates the URL with history state while a year slider drag is in progress", async () => {
    render(<RollStateHarness />);

    fireEvent.click(screen.getByText("start drag"));
    fireEvent.click(screen.getByText("change birth years"));

    expect(screen.getByTestId("birth-range")).toHaveTextContent("1886-1886");
    expect(mockReplace).not.toHaveBeenCalled();
    expect(window.history.replaceState).toHaveBeenCalledTimes(1);
    expect(window.history.replaceState).toHaveBeenCalledWith(
      null,
      "",
      expect.stringContaining("?birth-min=1886&birth-max=1886"),
    );

    fireEvent.click(screen.getByText("complete drag"));

    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  test("updates the URL with history state when a non-slider filter is clicked", async () => {
    render(<RollStateHarness />);

    fireEvent.click(screen.getByText("toggle detachment"));

    await waitFor(() => {
      expect(window.history.replaceState).toHaveBeenCalledWith(
        null,
        "",
        expect.stringContaining("?detachment=main-body"),
      );
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  test("preserves map query params when syncing filter state on the map", async () => {
    mockSearchParams = new URLSearchParams("view=map");
    originalReplaceState(null, "", "/?view=map");

    render(<RollStateHarness preserveMapParams />);

    fireEvent.click(screen.getByText("toggle detachment"));

    await waitFor(() => {
      expect(window.history.replaceState).toHaveBeenCalledWith(
        null,
        "",
        expect.stringContaining("?view=map&detachment=main-body"),
      );
    });
  });

  test("removes stale map query params when syncing filter state on the list", async () => {
    mockSearchParams = new URLSearchParams("view=map");
    originalReplaceState(null, "", "/?view=map");

    render(<RollStateHarness />);

    fireEvent.click(screen.getByText("toggle detachment"));

    await waitFor(() => {
      expect(window.history.replaceState).toHaveBeenCalledWith(
        null,
        "",
        expect.stringContaining("?detachment=main-body"),
      );
    });
    expect(window.location.search).not.toContain("view=map");
  });

  test("resetting filters immediately removes stale filters and map params on the list", async () => {
    mockSearchParams = new URLSearchParams(
      "view=map&detachment=main-body&marital-status=single",
    );
    originalReplaceState(
      null,
      "",
      "/?view=map&detachment=main-body&marital-status=single",
    );

    render(<RollStateHarness />);

    fireEvent.click(screen.getByText("reset filters"));

    await waitFor(() => {
      expect(window.location.search).toBe("");
    });
  });

  test("removes marital status from the URL when the selected status is toggled off", async () => {
    mockSearchParams = new URLSearchParams("marital-status=single");
    originalReplaceState(null, "", "/?marital-status=single");

    render(<RollStateHarness />);

    fireEvent.click(screen.getByText("toggle marital status"));

    await waitFor(() => {
      expect(window.location.search).toBe("");
    });
  });
});
