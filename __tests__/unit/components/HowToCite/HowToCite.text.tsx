import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { HowToCite } from "@/components/HowToCite/HowToCite";
import type { Summary } from "@/types/tunneller";

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue("Mocked write text"),
    readText: jest.fn().mockResolvedValue("Mocked clipboard text"),
  },
});

global.alert = jest.fn();

describe("HowToCite", () => {
  test("clipboard copy", async () => {
    render(<HowToCite />);

    fireEvent.click(screen.getByRole("button", { name: "Copy to clipboard" }));
    await navigator.clipboard.writeText("Test text");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Test text");
  });

  test("clipboard read", async () => {
    render(<HowToCite />);

    fireEvent.click(screen.getByRole("button", { name: "Copy to clipboard" }));
    const text = await navigator.clipboard.readText();
    expect(text).toBe("Mocked clipboard text");
  });

  test("clipboard error", async () => {
    jest
      .spyOn(navigator.clipboard, "writeText")
      .mockRejectedValue(new Error("Clipboard error"));

    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<HowToCite />);

    fireEvent.click(screen.getByRole("button", { name: "Copy to clipboard" }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Failed to copy to clipboard. Please try selecting and copying the text manually.",
      );
    });

    alertSpy.mockRestore();
    jest.restoreAllMocks();
  });

  test("console error is called in development mode when clipboard fails", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    jest
      .spyOn(navigator.clipboard, "writeText")
      .mockRejectedValue(new Error("Clipboard error"));

    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<HowToCite />);

    fireEvent.click(screen.getByRole("button", { name: "Copy to clipboard" }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Failed to copy to clipboard. Please try selecting and copying the text manually.",
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to copy: ",
        expect.any(Error),
      );
    });

    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  test("renders chapter citation with only a chapter number when path has no title", () => {
    render(
      <HowToCite
        pathname="/books/kiwis-dig-tunnels-too/chapter-1"
        locale="en"
      />,
    );

    expect(screen.getByText(/Chapter 1:/)).toBeInTheDocument();
  });

  test("renders non-chapter citation for a prologue path", () => {
    render(
      <HowToCite
        pathname="/books/les-kiwis-aussi-creusent-des-tunnels/prologue"
        locale="fr"
      />,
    );

    expect(screen.getByText(/Prologue/)).toBeInTheDocument();
  });

  test("renders timeline citation for a tunneller", () => {
    const tunneller: Summary = {
      serial: "1/1000",
      name: { forename: "John", surname: "Smith" },
      birth: "1886",
      death: "1966",
    };

    render(<HowToCite summary={tunneller} timeline={true} id={1} />);

    expect(
      screen.getByText(/World War I Timeline of John Smith/),
    ).toBeInTheDocument();
  });
});
