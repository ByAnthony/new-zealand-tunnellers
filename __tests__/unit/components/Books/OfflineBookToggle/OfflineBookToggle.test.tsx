import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { OfflineBookToggle } from "@/components/Books/OfflineBookToggle/OfflineBookToggle";

describe("OfflineBookToggle", () => {
  const savedMarkerKey = "nzt-offline-book-saved-v1-en";
  let originalCaches: PropertyDescriptor | undefined;
  let originalServiceWorker: PropertyDescriptor | undefined;
  let originalLocks: PropertyDescriptor | undefined;
  let originalFetch: PropertyDescriptor | undefined;
  let originalMatchMedia: PropertyDescriptor | undefined;

  beforeEach(() => {
    window.localStorage.removeItem(savedMarkerKey);
    originalCaches = Object.getOwnPropertyDescriptor(window, "caches");
    originalServiceWorker = Object.getOwnPropertyDescriptor(
      navigator,
      "serviceWorker",
    );
    originalLocks = Object.getOwnPropertyDescriptor(navigator, "locks");
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: (_name: string, callback: () => Promise<void>) => callback(),
      },
    });
    originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
    originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");
  });

  afterEach(() => {
    window.localStorage.removeItem(savedMarkerKey);
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

    if (originalLocks) {
      Object.defineProperty(navigator, "locks", originalLocks);
    } else {
      Reflect.deleteProperty(navigator, "locks");
    }

    if (originalFetch) {
      Object.defineProperty(globalThis, "fetch", originalFetch);
    } else {
      Reflect.deleteProperty(globalThis, "fetch");
    }

    if (originalMatchMedia) {
      Object.defineProperty(window, "matchMedia", originalMatchMedia);
    } else {
      Reflect.deleteProperty(window, "matchMedia");
    }
  });

  test("shows a download error when service worker registration fails", async () => {
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        keys: jest.fn().mockResolvedValue([]),
        open: jest.fn(),
        delete: jest.fn().mockResolvedValue(true),
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockRejectedValue(new Error("Unsupported")),
        getRegistration: jest.fn().mockResolvedValue(undefined),
      },
    });

    render(<OfflineBookToggle locale="en" pagePaths={[]} />);
    const toggle = await screen.findByRole("checkbox", {
      name: "Read offline",
    });
    await waitFor(() => expect(toggle).toBeEnabled());
    fireEvent.click(toggle);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Download failed",
    );
  });

  test("renders the toggle when offline support is available", async () => {
    const cache = { match: jest.fn().mockResolvedValue(undefined) };
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        keys: jest.fn().mockResolvedValue(["nzt-offline-book-v1-en"]),
        open: jest.fn().mockResolvedValue(cache),
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockResolvedValue(undefined),
        getRegistration: jest.fn().mockResolvedValue(undefined),
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

  test("allows a first-time download before a service worker is ready", async () => {
    const cache = {
      match: jest.fn().mockResolvedValue(undefined),
      put: jest.fn(),
    };
    const register = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        keys: jest.fn().mockResolvedValue(["nzt-offline-book-v1-en"]),
        open: jest.fn().mockResolvedValue(cache),
        delete: jest.fn().mockResolvedValue(true),
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        getRegistration: jest.fn().mockResolvedValue(undefined),
        register,
        ready: new Promise(() => {}),
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

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Saving page 0 of 1",
    );
    expect(register).toHaveBeenCalledWith("/service-worker.js");
  });

  test("shows the switch on immediately from the saved marker while cache is checked", () => {
    window.localStorage.setItem(savedMarkerKey, "true");
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        keys: jest.fn().mockResolvedValue(["nzt-offline-book-v1-en"]),
        open: jest.fn(() => new Promise(() => {})),
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        getRegistration: jest.fn().mockResolvedValue({}),
        ready: new Promise(() => {}),
      },
    });

    render(<OfflineBookToggle locale="en" pagePaths={[]} />);

    const toggle = screen.getByRole("checkbox", { name: "Read offline" });
    expect(toggle).toBeChecked();
    expect(toggle).toBeDisabled();
  });

  test("renders server-confirmed saved state as checked before cache verification", () => {
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        keys: jest.fn().mockResolvedValue(["nzt-offline-book-v1-en"]),
        open: jest.fn(() => new Promise(() => {})),
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        getRegistration: jest.fn().mockResolvedValue({}),
        ready: new Promise(() => {}),
      },
    });

    render(
      <OfflineBookToggle locale="en" pagePaths={[]} initiallySaved={true} />,
    );

    const toggle = screen.getByRole("checkbox", { name: "Read offline" });
    expect(toggle).toBeChecked();
    expect(toggle).toBeDisabled();
  });

  test("clears a stale saved marker when the offline cache is missing", async () => {
    window.localStorage.setItem(savedMarkerKey, "true");
    const cache = { match: jest.fn().mockResolvedValue(undefined) };
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        keys: jest.fn().mockResolvedValue(["nzt-offline-book-v1-en"]),
        open: jest.fn().mockResolvedValue(cache),
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        getRegistration: jest.fn().mockResolvedValue(undefined),
        ready: Promise.resolve(undefined),
      },
    });

    render(<OfflineBookToggle locale="en" pagePaths={[]} />);

    const toggle = screen.getByRole("checkbox", { name: "Read offline" });
    expect(toggle).toBeChecked();
    await waitFor(() => expect(toggle).toBeEnabled());
    expect(toggle).not.toBeChecked();
    expect(window.localStorage.getItem(savedMarkerKey)).toBeNull();
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
      value: {
        keys: jest.fn().mockResolvedValue(["nzt-offline-book-v1-en"]),
        open: jest.fn().mockResolvedValue(cache),
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockResolvedValue(undefined),
        getRegistration: jest.fn().mockResolvedValue(undefined),
        ready: Promise.resolve(undefined),
      },
    });

    render(<OfflineBookToggle locale="en" pagePaths={[]} />);

    const toggle = await screen.findByRole("checkbox", {
      name: "Read offline",
    });
    await waitFor(() => expect(toggle).toBeChecked());
    expect(toggle.closest("label")).toHaveClass("toggle");
    expect(toggle.closest("label")).not.toHaveClass("saved");
    expect(screen.getByText("✓")).toBeInTheDocument();
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
        keys: jest.fn().mockResolvedValue(["nzt-offline-book-v1-en"]),
        open: jest.fn().mockResolvedValue(cache),
        delete: jest.fn(() => new Promise<boolean>(() => {})),
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockResolvedValue(undefined),
        getRegistration: jest.fn().mockResolvedValue(undefined),
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
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  test("keeps its label fixed and announces page progress while saving", async () => {
    const cache = {
      match: jest.fn().mockResolvedValue(undefined),
      put: jest.fn(),
    };
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        keys: jest.fn().mockResolvedValue(["nzt-offline-book-v1-en"]),
        open: jest.fn().mockResolvedValue(cache),
        delete: jest.fn().mockResolvedValue(true),
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockResolvedValue(undefined),
        getRegistration: jest.fn().mockResolvedValue(undefined),
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

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Saving page 0 of 1",
    );
    expect(await screen.findByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    expect(screen.getByText("Read offline")).toHaveClass("label");
    expect(toggle).toBeChecked();
    expect(toggle).toBeDisabled();
  });

  test("announces asset status while downloading assets", async () => {
    const cache = {
      match: jest.fn().mockResolvedValue(undefined),
      put: jest.fn(),
    };
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        keys: jest.fn().mockResolvedValue(["nzt-offline-book-v1-en"]),
        open: jest.fn().mockResolvedValue(cache),
        delete: jest.fn().mockResolvedValue(true),
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockResolvedValue(undefined),
        getRegistration: jest.fn().mockResolvedValue(undefined),
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
      expect(screen.getByRole("status")).toHaveTextContent("Saving images..."),
    );
    expect(
      Number(screen.getByRole("progressbar").getAttribute("aria-valuenow")),
    ).toBeGreaterThan(50);
    expect(toggle).toBeChecked();
    expect(
      fetchMock.mock.calls.some(([url]) =>
        new URL(String(url), window.location.origin).origin.startsWith(
          "https://external.example",
        ),
      ),
    ).toBe(false);
  });

  test("shows a download error and retries downloading", async () => {
    const cache = {
      match: jest.fn().mockResolvedValue(undefined),
      put: jest.fn(),
    };
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        keys: jest.fn().mockResolvedValue(["nzt-offline-book-v1-en"]),
        open: jest.fn().mockResolvedValue(cache),
        delete: jest.fn().mockResolvedValue(true),
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockResolvedValue(undefined),
        getRegistration: jest.fn().mockResolvedValue(undefined),
        ready: Promise.resolve(undefined),
      },
    });
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: false })
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

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Download failed",
    );
    const retry = screen.getByRole("button", { name: "Retry download" });
    fireEvent.click(retry);
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Saving page 0 of 1",
    );
    expect(await screen.findByRole("progressbar")).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(
      screen.queryByRole("button", { name: "Retry download" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Retry download" }),
    ).not.toBeInTheDocument();
  });

  test("shows the download error when the failed cache cannot be cleared", async () => {
    const cache = { match: jest.fn().mockResolvedValue(undefined) };
    const deleteMock = jest
      .fn()
      .mockRejectedValue(new Error("Unable to remove cache"));
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        keys: jest.fn().mockResolvedValue(["nzt-offline-book-v1-en"]),
        open: jest.fn().mockResolvedValue(cache),
        delete: deleteMock,
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockResolvedValue(undefined),
        getRegistration: jest.fn().mockResolvedValue(undefined),
        ready: Promise.resolve(undefined),
      },
    });
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<OfflineBookToggle locale="en" pagePaths={[]} />);

    const toggle = await screen.findByRole("checkbox", {
      name: "Read offline",
    });
    await waitFor(() => expect(toggle).toBeEnabled());
    fireEvent.click(toggle);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Download failed",
    );
    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to clear an incomplete offline book cache",
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });

  test("preserves a saved copy when a later download fails", async () => {
    const savedCacheName = "nzt-offline-book-v1-en";
    const savedCache = {
      match: jest
        .fn()
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(["/book/chapter-1/"]),
        })
        .mockResolvedValueOnce(true),
    };
    const incompleteCache = {
      match: jest.fn().mockResolvedValue(undefined),
      put: jest.fn(),
    };
    const cacheMap = new Map<string, Cache>();
    const deleteMock = jest.fn(async (cacheName: string) =>
      cacheMap.delete(cacheName),
    );
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        keys: jest.fn(async () => [...cacheMap.keys()]),
        open: jest.fn(async (cacheName: string) => {
          if (!cacheMap.has(cacheName)) {
            cacheMap.set(cacheName, incompleteCache as unknown as Cache);
          }
          return cacheMap.get(cacheName);
        }),
        delete: deleteMock,
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockResolvedValue(undefined),
        getRegistration: jest.fn().mockResolvedValue(undefined),
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
    cacheMap.set(savedCacheName, savedCache as unknown as Cache);
    fireEvent.click(toggle);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Download failed",
    );
    expect(cacheMap.has(savedCacheName)).toBe(true);
    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(deleteMock.mock.calls[0][0]).not.toBe(savedCacheName);
  });

  test("shows a removal error and retries removing", async () => {
    const cache = {
      match: jest
        .fn()
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(["/book/chapter-1/"]),
        })
        .mockResolvedValueOnce(true),
    };
    const deleteMock = jest
      .fn()
      .mockRejectedValueOnce(new Error("Unable to remove cache"))
      .mockResolvedValue(true);
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        keys: jest.fn().mockResolvedValue(["nzt-offline-book-v1-en"]),
        open: jest.fn().mockResolvedValue(cache),
        delete: deleteMock,
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: jest.fn().mockResolvedValue(undefined),
        getRegistration: jest.fn().mockResolvedValue(undefined),
        ready: Promise.resolve(undefined),
      },
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: jest.fn().mockReturnValue({ matches: true }),
    });

    render(<OfflineBookToggle locale="en" pagePaths={[]} />);

    const toggle = await screen.findByRole("checkbox", {
      name: "Read offline",
    });
    await waitFor(() => expect(toggle).toBeChecked());
    fireEvent.click(toggle);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Removal failed",
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry removal" }));
    await waitFor(() => expect(deleteMock).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(
        screen.getByRole("checkbox", { name: "Read offline" }),
      ).not.toBeChecked(),
    );
  });
});
