import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { useRollState } from "@/components/Roll/hooks/useRollState";
import { mockTunnellers } from "@/test-utils/mocks/mockTunnellers";

const mockReplace = jest.fn();
let mockSearchParams = new URLSearchParams();

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
  });

  test("does not sync the URL while a year slider drag is in progress", async () => {
    render(<RollStateHarness />);

    fireEvent.click(screen.getByText("start drag"));
    fireEvent.click(screen.getByText("change birth years"));

    expect(screen.getByTestId("birth-range")).toHaveTextContent("1886-1886");
    expect(mockReplace).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("complete drag"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledTimes(1);
    });
  });
});
