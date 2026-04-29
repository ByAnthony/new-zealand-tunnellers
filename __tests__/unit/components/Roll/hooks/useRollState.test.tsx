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

function RollStateHarness() {
  const { rollFiltersProps } = useRollState({
    tunnellers: mockTunnellers,
    locale: "en",
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
      <button onClick={rollFiltersProps.handleSliderDragComplete}>
        complete drag
      </button>
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
});
