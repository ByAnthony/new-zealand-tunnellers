import { fireEvent, render, screen } from "@testing-library/react";
import { usePathname, useSearchParams } from "next/navigation";

import { Footer } from "@/components/Footer/Footer";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

const component = <Footer />;
const mockUsePathname = jest.mocked(usePathname);
const mockUseSearchParams = jest.mocked(useSearchParams);

describe("Footer", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  test("matches the snapshot", () => {
    const { asFragment } = render(component);

    expect(asFragment()).toMatchSnapshot();
  });

  test("can scroll to top of the page", () => {
    global.scrollTo = jest.fn();

    render(component);
    fireEvent.click(screen.getByRole("button"));

    expect(global.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test("does not render on the works map", () => {
    mockUsePathname.mockReturnValue("/maps/tunnellers-works");

    const { container } = render(component);

    expect(container).toBeEmptyDOMElement();
  });

  test("does not render on the roll origin map", () => {
    mockUsePathname.mockReturnValue("/tunnellers");
    mockUseSearchParams.mockReturnValue(new URLSearchParams("view=map"));

    const { container } = render(component);

    expect(container).toBeEmptyDOMElement();
  });
});
