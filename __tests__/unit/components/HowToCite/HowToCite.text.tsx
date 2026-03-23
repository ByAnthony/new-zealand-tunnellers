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
  test("shows English success alert on clipboard copy", async () => {
    jest.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);

    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<HowToCite />);

    fireEvent.click(screen.getByRole("button", { name: "Copy to clipboard" }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "How to cite has been copied to clipboard",
      );
    });

    alertSpy.mockRestore();
    jest.restoreAllMocks();
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

  test("shows French success alert on clipboard copy", async () => {
    jest.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);

    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<HowToCite locale="fr" />);

    fireEvent.click(
      screen.getByRole("button", { name: "Copier dans le presse-papiers" }),
    );

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Comment citer a été copié dans le presse-papiers",
      );
    });

    alertSpy.mockRestore();
    jest.restoreAllMocks();
  });

  test("shows French error alert on clipboard failure", async () => {
    jest
      .spyOn(navigator.clipboard, "writeText")
      .mockRejectedValue(new Error("Clipboard error"));

    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<HowToCite locale="fr" />);

    fireEvent.click(
      screen.getByRole("button", { name: "Copier dans le presse-papiers" }),
    );

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Échec de la copie dans le presse-papiers. Veuillez essayer de sélectionner et de copier le texte manuellement.",
      );
    });

    alertSpy.mockRestore();
    jest.restoreAllMocks();
  });

  test("console error is called in development mode when clipboard fails", async () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      writable: true,
      configurable: true,
    });

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
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      writable: true,
      configurable: true,
    });
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

  test("renders chapter citation with chapter number and title", () => {
    render(
      <HowToCite
        pathname="/books/kiwis-dig-tunnels-too/chapter-1-the-tunnellers-from-the-antipodes"
        locale="en"
      />,
    );

    expect(
      screen.getByText(/Chapter 1: The tunnellers from the antipodes/),
    ).toBeInTheDocument();
  });

  test("renders tunneller citation without timeline", () => {
    const tunneller: Summary = {
      serial: "1/1000",
      name: { forename: "John", surname: "Smith" },
      birth: "1886",
      death: "1966",
    };

    render(
      <HowToCite summary={tunneller} tunnellerSlug="harry-corrin--4_1415" />,
    );

    expect(screen.getByText(/John Smith/)).toBeInTheDocument();
  });

  test("renders non-chapter citation for a prologue path", () => {
    render(
      <HowToCite
        pathname="/fr/books/kiwis-dig-tunnels-too/prologue"
        locale="fr"
      />,
    );

    expect(screen.getByText(/Prologue/)).toBeInTheDocument();
  });

  test("renders empty citation title when pathname resolves to no segment", () => {
    render(<HowToCite pathname="/" locale="en" />);

    expect(screen.getByText(/Anthony Byledbal/)).toBeInTheDocument();
  });

  test("renders timeline citation for a tunneller", () => {
    const tunneller: Summary = {
      serial: "1/1000",
      name: { forename: "John", surname: "Smith" },
      birth: "1886",
      death: "1966",
    };

    render(
      <HowToCite
        summary={tunneller}
        timeline={true}
        tunnellerSlug="harry-corrin--4_1415"
      />,
    );

    expect(
      screen.getByText(/World War I Timeline of John Smith/),
    ).toBeInTheDocument();
  });

  test("renders French timeline citation with French prefix", () => {
    const tunneller: Summary = {
      serial: "1/1000",
      name: { forename: "John", surname: "Smith" },
      birth: "1886",
      death: "1966",
    };

    render(
      <HowToCite
        summary={tunneller}
        timeline={true}
        tunnellerSlug="harry-corrin--4_1415"
        locale="fr"
      />,
    );

    expect(
      screen.getByText(/Chronologie de la guerre de John Smith/),
    ).toBeInTheDocument();
  });

  test("English URL has no locale prefix for tunneller profile", () => {
    render(<HowToCite tunnellerSlug="harry-corrin--4_1415" locale="en" />);

    expect(screen.getByText(/nztunnellers/)).toBeInTheDocument();
    expect(screen.queryByText(/\/en\//)).not.toBeInTheDocument();
  });

  test("French URL includes /fr/ prefix for tunneller profile", () => {
    render(<HowToCite tunnellerSlug="harry-corrin--4_1415" locale="fr" />);

    expect(screen.getByText(/\/fr\//)).toBeInTheDocument();
  });

  test("French URL includes /fr/ prefix for timeline", () => {
    const tunneller: Summary = {
      serial: "1/1000",
      name: { forename: "John", surname: "Smith" },
      birth: "1886",
      death: "1966",
    };

    render(
      <HowToCite
        summary={tunneller}
        timeline={true}
        tunnellerSlug="harry-corrin--4_1415"
        locale="fr"
      />,
    );

    expect(screen.getByText(/\/fr\//)).toBeInTheDocument();
  });

  test("French URL includes /fr/ prefix for history chapter", () => {
    render(<HowToCite title="The Tunnellers" locale="fr" />);

    expect(screen.getByText(/\/fr\//)).toBeInTheDocument();
  });

  test("French URL includes /fr/ prefix for pathname", () => {
    render(
      <HowToCite
        pathname="/fr/books/kiwis-dig-tunnels-too/chapter-1"
        locale="fr"
      />,
    );

    expect(screen.getByText(/\/fr\//)).toBeInTheDocument();
  });
});
