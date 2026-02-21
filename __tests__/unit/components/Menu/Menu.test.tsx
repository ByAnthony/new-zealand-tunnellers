import { fireEvent, render, screen } from "@testing-library/react";
import { mockTunnellersData } from "__tests__/unit/utils/mocks/mockTunnellers";

import { Menu } from "@/components/Menu/Menu";

jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useRouter: jest.fn(),
}));

const mockedUseRouter = require("next/navigation").useRouter;

mockedUseRouter.mockReturnValue({
  refresh: jest.fn(),
});

describe("Menu", () => {
  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      refresh: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("matches the snapshot", () => {
    const { asFragment } = render(<Menu tunnellers={mockTunnellersData} />);

    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the component correctly", () => {
    render(<Menu tunnellers={mockTunnellersData} />);

    const nextButton = screen.getByRole("link", {
      name: "Go to the Homepage",
    });
    expect(nextButton).toHaveAttribute("href", "/");

    const search = screen.getByRole("textbox");
    expect(search).toBeInTheDocument();
    expect(search).toHaveAttribute("placeholder", "Search for a Tunneller");
  });

  test("can input a name", () => {
    render(<Menu tunnellers={mockTunnellersData} />);

    const search = screen.getByRole("textbox");
    fireEvent.click(search);
    fireEvent.change(search, {
      target: { value: "John Doe" },
    });

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toHaveClass("surname");
    expect(screen.getByText("(1886-1952)")).toBeInTheDocument();
    expect(screen.getAllByRole("link")[1]).toHaveAttribute(
      "href",
      "/tunnellers/1",
    );
  });

  test("becomes invisible on scrolling down", () => {
    render(<Menu tunnellers={mockTunnellersData} />);
    expect(screen.getByTestId("menu")).toHaveClass("menu");

    fireEvent.scroll(window, { target: { scrollY: 100 } });
    expect(screen.getByTestId("menu")).toHaveClass("menu hidden");
  });

  test("becomes visible on scrolling up", () => {
    render(<Menu tunnellers={mockTunnellersData} />);
    expect(screen.getByTestId("menu")).toHaveClass("menu");

    fireEvent.scroll(window, { target: { scrollY: 100 } });
    expect(screen.getByTestId("menu")).toHaveClass("menu hidden");

    fireEvent.scroll(window, { target: { scrollY: 75 } });
    expect(screen.getByTestId("menu")).toHaveClass("menu");
  });

  describe("Dropdown", () => {
    test("can close the dropdown with outside click", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(screen.getByTestId("dropdown")).toBeInTheDocument();

      fireEvent.mouseDown(document.body);
      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });

    test("should not close the dropdown when click on the search bar", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(screen.getByTestId("dropdown")).toBeInTheDocument();

      fireEvent.mouseDown(search);
      expect(screen.getByTestId("dropdown")).toBeInTheDocument();
    });

    test("should not open dropdown if no input", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);

      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });

    test("should reopen dropdown if input present", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(screen.getByTestId("dropdown")).toBeInTheDocument();

      fireEvent.mouseDown(document.body);
      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();

      fireEvent.click(search);
      expect(screen.getByTestId("dropdown")).toBeInTheDocument();
    });

    test("can click on tunnellers link", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(screen.getByTestId("dropdown")).toBeInTheDocument();

      const tunnellersLink = screen.getByRole("link", {
        name: "See all Tunnellers →",
      });
      fireEvent.click(tunnellersLink);

      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });

    test("can clear name and close the dropdown", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(screen.getByTestId("dropdown")).toBeInTheDocument();

      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "" },
      });
      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });

    test("no dropdown when name not found", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe Smith" },
      });

      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });
  });

  describe("Clear Button", () => {
    test("can clear the search input", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(screen.getByTestId("dropdown")).toBeInTheDocument();

      const clearButton = screen.getByRole("button", {
        name: "Clear search input",
      });
      expect(clearButton).toBeInTheDocument();

      fireEvent.click(clearButton);

      expect(
        screen.getByPlaceholderText("Search for a Tunneller"),
      ).toBeInTheDocument();
      expect(screen.queryByRole("list")).toBeNull();
      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });

    test("clear button replace magnifier icon", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      expect(
        screen.getByRole("img", {
          name: "Type a name to search for a Tunneller",
        }),
      ).toBeInTheDocument();

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(
        screen.queryByRole("img", {
          name: "Type a name to search for a Tunneller",
        }),
      ).not.toBeInTheDocument();

      const clearButton = screen.getByRole("button", {
        name: "Clear search input",
      });
      expect(clearButton).toBeInTheDocument();
    });

    test("clears the input field and focuses it", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const input = screen.getByPlaceholderText(
        "Search for a Tunneller",
      ) as HTMLInputElement;

      fireEvent.change(input, { target: { value: "John" } });
      expect(input.value).toBe("John");

      const clearButton = screen.getByRole("button", {
        name: "Clear search input",
      });
      fireEvent.click(clearButton);

      expect(input.value).toBe("");
      expect(input).toHaveFocus();
    });
  });
});
