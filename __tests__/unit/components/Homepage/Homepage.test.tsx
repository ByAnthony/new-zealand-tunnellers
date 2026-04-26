import { render, act } from "@testing-library/react";

import { HomePage } from "@/components/HomePage/HomePage";
import { mockHistory } from "@/test-utils/mocks/mockHistory";
import * as useWindowDimensionsHook from "@/utils/helpers/useWindowDimensions";

jest.mock("@/utils/helpers/useWindowDimensions");

describe("Homepage", () => {
  const mockHomepage = {
    historyChapters: mockHistory,
  };

  const renderWithMockedDimensions = (width: number, height: number) => {
    (useWindowDimensionsHook.useWindowDimensions as jest.Mock).mockReturnValue({
      width,
      height,
    });

    return render(<HomePage homepage={mockHomepage} />);
  };

  test("matches the snapshot for mobile viewport", async () => {
    const { asFragment } = renderWithMockedDimensions(500, 800);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    expect(asFragment()).toMatchSnapshot();
  });

  test("matches the snapshot for tablet/desktop viewports", async () => {
    const { asFragment } = renderWithMockedDimensions(600, 800);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
