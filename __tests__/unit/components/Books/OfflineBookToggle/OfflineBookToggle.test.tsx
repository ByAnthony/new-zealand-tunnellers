import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { OfflineBookToggle } from "@/components/Books/OfflineBookToggle/OfflineBookToggle";

describe("OfflineBookToggle", () => {
  let originalCaches: PropertyDescriptor | undefined;
  let originalServiceWorker: PropertyDescriptor | undefined;
  let originalFetch: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalCaches = Object.getOwnPropertyDescriptor(window, "caches");
    originalServiceWorker = Object.getOwnPropertyDescriptor(
      navigator,
      "serviceWorker",
    );
    originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  });

  afterEach(() => {
    if (originalCaches) {
      Object.defineProperty(window, "caches", originalCaches);
    } else {
      Reflect.deleteProperty(window, "caches");
    }

    if (originalServiceWorker) {
      Object.defineProperty(navigator, "serviceWorker", originalServiceWorker);
    } else {
      Reflect.deleteProperty(navigator, "serviceWorker");
    }

    if (originalFetch) {
      Object.defineProperty(globalThis, "fetch", originalFetch);
    } else {
      Reflect.deleteProperty(globalThis, "fetch");
    }
  });

  test("renders nothing when service worker setup fails", async () => {
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: { open: jest.fn() },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockRejectedValue(new Error("Unsupported")),
      },
    });

    const { container } = render(
      <OfflineBookToggle locale="en" pagePaths={[]} />,
    );

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  test("renders the toggle when offline support is available", async () => {
    const cache = { match: jest.fn().mockResolvedValue(undefined) };
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: { open: jest.fn().mockResolvedValue(cache) },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockResolvedValue(undefined),
        ready: Promise.resolve(undefined),
      },
    });

    render(<OfflineBookToggle locale="en" pagePaths={[]} />);

    await waitFor(() =>
      expect(
        screen.getByRole("checkbox", { name: "Read offline" }),
      ).toBeEnabled(),
    );
  });

  test("uses the saved appearance when the offline copy is complete", async () => {
    const cache = {
      match: jest
        .fn()
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(["/book/chapter-1/"]),
        })
        .mockResolvedValueOnce(true),
    };
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: { open: jest.fn().mockResolvedValue(cache) },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockResolvedValue(undefined),
        ready: Promise.resolve(undefined),
      },
    });

    render(<OfflineBookToggle locale="en" pagePaths={[]} />);

    const toggle = await screen.findByRole("checkbox", {
      name: "Read offline",
    });
    await waitFor(() => expect(toggle).toBeChecked());
    expect(toggle.closest("label")).toHaveClass("saved");
  });

  test("moves the switch off immediately when removing the offline copy", async () => {
    const cache = {
      match: jest
        .fn()
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(["/book/chapter-1/"]),
        })
        .mockResolvedValueOnce(true),
    };
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        open: jest.fn().mockResolvedValue(cache),
        delete: jest.fn(() => new Promise<boolean>(() => {})),
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockResolvedValue(undefined),
        ready: Promise.resolve(undefined),
      },
    });

    render(<OfflineBookToggle locale="en" pagePaths={[]} />);

    const toggle = await screen.findByRole("checkbox", {
      name: "Read offline",
    });
    await waitFor(() => expect(toggle).toBeChecked());
    fireEvent.click(toggle);

    expect(toggle).not.toBeChecked();
    expect(toggle).toBeDisabled();
    const progress = await screen.findByRole("progressbar");
    expect(progress).toHaveAttribute("aria-valuenow", "100");
    await waitFor(
      () => expect(progress).toHaveAttribute("aria-valuenow", "0"),
      { timeout: 1500 },
    );
  });

  test("keeps its label fixed and shows page progress while saving", async () => {
    const cache = {
      match: jest.fn().mockResolvedValue(undefined),
      put: jest.fn(),
    };
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        open: jest.fn().mockResolvedValue(cache),
        delete: jest.fn().mockResolvedValue(true),
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockResolvedValue(undefined),
        ready: Promise.resolve(undefined),
      },
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: jest.fn(() => new Promise<Response>(() => {})),
    });

    render(<OfflineBookToggle locale="en" pagePaths={["/book/chapter-1/"]} />);

    const toggle = await screen.findByRole("checkbox", {
      name: "Read offline",
    });
    await waitFor(() => expect(toggle).toBeEnabled());
    fireEvent.click(toggle);

    expect(await screen.findByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    const labels = screen.getAllByText("Read offline");
    expect(labels).toHaveLength(2);
    expect(labels[0]).toHaveClass("progressLabel");
    expect(labels[1]).toHaveClass("accentLabel");
    expect(toggle).not.toBeChecked();
    expect(toggle).toBeDisabled();
  });

  test("continues progress through downloaded assets", async () => {
    const cache = {
      match: jest.fn().mockResolvedValue(undefined),
      put: jest.fn(),
    };
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        open: jest.fn().mockResolvedValue(cache),
        delete: jest.fn().mockResolvedValue(true),
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockResolvedValue(undefined),
        ready: Promise.resolve(undefined),
      },
    });

    const pageResponse = {
      ok: true,
      clone: () => pageResponse,
      text: jest
        .fn()
        .mockResolvedValue(
          '<img src="/image-one.jpg"><img src="/image-two.jpg"><img src="https://external.example/image.jpg">',
        ),
    } as unknown as Response;
    const imageResponse = {
      ok: true,
      clone: () => imageResponse,
      headers: { get: jest.fn().mockReturnValue("image/jpeg") },
    } as unknown as Response;
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(pageResponse)
      .mockResolvedValueOnce(imageResponse)
      .mockImplementation(() => new Promise<Response>(() => {}));
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    render(<OfflineBookToggle locale="en" pagePaths={["/book/chapter-1/"]} />);

    const toggle = await screen.findByRole("checkbox", {
      name: "Read offline",
    });
    await waitFor(() => expect(toggle).toBeEnabled());
    fireEvent.click(toggle);

    await waitFor(() =>
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "75",
      ),
    );
    expect(
      fetchMock.mock.calls.some(([url]) =>
        new URL(String(url), window.location.origin).origin.startsWith(
          "https://external.example",
        ),
      ),
    ).toBe(false);
  });

  test("shows a visible error and allows retry after a page download fails", async () => {
    const cache = {
      match: jest.fn().mockResolvedValue(undefined),
      put: jest.fn(),
    };
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        open: jest.fn().mockResolvedValue(cache),
        delete: jest.fn().mockResolvedValue(true),
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockResolvedValue(undefined),
        ready: Promise.resolve(undefined),
      },
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: jest.fn().mockResolvedValue({ ok: false }),
    });

    render(<OfflineBookToggle locale="en" pagePaths={["/book/chapter-1/"]} />);

    const toggle = await screen.findByRole("checkbox", {
      name: "Read offline",
    });
    await waitFor(() => expect(toggle).toBeEnabled());
    fireEvent.click(toggle);

    expect(
      await screen.findByText(
        "Download failed. Check your connection and try again.",
      ),
    ).toHaveAttribute("role", "status");
    expect(toggle).toBeEnabled();
    expect(toggle).not.toBeChecked();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
