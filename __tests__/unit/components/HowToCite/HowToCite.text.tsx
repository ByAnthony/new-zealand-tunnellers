import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { HowToCite } from "@/components/HowToCite/HowToCite";

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

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<HowToCite />);

    fireEvent.click(screen.getByRole("button", { name: "Copy to clipboard" }));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to copy: ",
        expect.any(Error),
      );
    });

    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });
});
