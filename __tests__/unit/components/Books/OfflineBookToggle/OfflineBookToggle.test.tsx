import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { OfflineBookToggle } from "@/components/Books/OfflineBookToggle/OfflineBookToggle";

describe("OfflineBookToggle", () => {
  const savedMarkerKey = "nzt-offline-book-saved-v1-en";
  let originalCaches: PropertyDescriptor | undefined;
  let originalServiceWorker: PropertyDescriptor | undefined;
  let originalLocks: PropertyDescriptor | undefined;
  let originalFetch: PropertyDescriptor | undefined;
  let originalResponse: PropertyDescriptor | undefined;
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
    originalResponse = Object.getOwnPropertyDescriptor(globalThis, "Response");
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

    if (originalResponse) {
      Object.defineProperty(globalThis, "Response", originalResponse);
    } else {
      Reflect.deleteProperty(globalThis, "Response");
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
    expect(toggle.closest("label")?.parentElement).toHaveClass("interactive");
    await waitFor(() =>
      expect(register).toHaveBeenCalledWith("/service-worker.js"),
    );
  });

  test("clears only unfinished caches for the current locale before downloading", async () => {
    const unfinishedNames = [
      "nzt-offline-book-v1-en",
      "nzt-offline-book-v1-en-abandoned",
    ];
    const completedName = "nzt-offline-book-v1-en-completed";
    const otherLocaleName = "nzt-offline-book-v1-fr-abandoned";
    const unrelatedName = "other-cache";
    const unfinishedCache = {
      match: jest.fn().mockResolvedValue(undefined),
    };
    const completedCache = {
      match: jest.fn().mockResolvedValue({ json: async () => [] }),
    };
    const cacheMap = new Map([
      ...unfinishedNames.map((name) => [name, unfinishedCache] as const),
      [otherLocaleName, unfinishedCache],
      [unrelatedName, unfinishedCache],
    ]);
    const deleteMock = jest.fn(async (name: string) => cacheMap.delete(name));
    const openMock = jest.fn(async (name: string) => cacheMap.get(name));
    const register = jest.fn(() => new Promise(() => {}));
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        keys: jest.fn(async () => [...cacheMap.keys()]),
        open: openMock,
        delete: deleteMock,
      },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        getRegistration: jest.fn().mockResolvedValue(undefined),
        register,
      },
    });

    render(<OfflineBookToggle locale="en" pagePaths={["/book/chapter-1/"]} />);

    const toggle = screen.getByRole("checkbox", { name: "Read offline" });
    await waitFor(() => expect(toggle).toBeEnabled());
    cacheMap.set(completedName, completedCache);
    fireEvent.click(toggle);

    await waitFor(() =>
      expect(register).toHaveBeenCalledWith("/service-worker.js"),
    );
    expect(deleteMock.mock.calls).toEqual(
      unfinishedNames.map((name) => [name]),
    );
    for (const callOrder of deleteMock.mock.invocationCallOrder) {
      expect(callOrder).toBeLessThan(register.mock.invocationCallOrder[0]);
    }
    expect([...cacheMap.keys()]).toEqual([
      otherLocaleName,
      unrelatedName,
      completedName,
    ]);
    expect(openMock).not.toHaveBeenCalledWith(otherLocaleName);
    expect(openMock).not.toHaveBeenCalledWith(unrelatedName);
    expect(completedCache.match).toHaveBeenCalledWith(
      new URL("/__offline-book-cache__/manifest-en", window.location.origin),
    );
  });

  test("restores the saved marker while keeping the control hidden during verification", () => {
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
    expect(toggle.closest("label")?.parentElement).toHaveClass("checking");
    expect(toggle.closest("label")?.parentElement).toHaveAttribute(
      "aria-busy",
      "true",
    );
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
    const container = toggle.closest("label")?.parentElement;
    expect(container).not.toHaveClass("checking");
    expect(container).not.toHaveClass("interactive");
    expect(container).toHaveAttribute("aria-busy", "false");
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

  test("downloads pages and assets, replaces old caches, and detects the saved copy on remount", async () => {
    const response = (body: string, contentType: string) => ({
      ok: true,
      text: async () => body,
      json: async (): Promise<string[]> => JSON.parse(body),
      headers: { get: () => contentType },
      clone() {
        return this;
      },
    });
    type CachedResponse = ReturnType<typeof response>;
    const origin = window.location.origin;
    const manifestUrl = `${origin}/__offline-book-cache__/manifest-en`;
    const pagePaths = ["/book/", "/book/chapter-1/"];
    const resources = new Map([
      [
        `${origin}/book/`,
        response(
          '<link rel="stylesheet" href="/book.css"><img src="/cover.jpg" srcset="/cover.jpg 1x, /cover-large.jpg 2x">',
          "text/html",
        ),
      ],
      [
        `${origin}/book/chapter-1/`,
        response('<script src="/book.js"></script>', "text/html"),
      ],
      [
        `${origin}/book.css`,
        response(
          '@font-face { src: url("/book.woff2"); } body { background: url("/paper.png"); }',
          "text/css",
        ),
      ],
      [`${origin}/cover.jpg`, response("cover", "image/jpeg")],
      [`${origin}/cover-large.jpg`, response("large cover", "image/jpeg")],
      [`${origin}/book.js`, response("book script", "text/javascript")],
      [`${origin}/book.woff2`, response("font", "font/woff2")],
      [`${origin}/paper.png`, response("paper", "image/png")],
    ]);
    const previousName = "nzt-offline-book-v1-en-previous";
    const otherLocaleName = "nzt-offline-book-v1-fr-previous";
    const previousEntries = new Map([
      [manifestUrl, response("[]", "application/json")],
    ]);
    const cacheEntries = new Map<string, Map<string, CachedResponse>>();
    const cacheKey = (url: string | URL) => new URL(url, origin).href;
    const publicationAtDeletion: boolean[] = [];
    const deleteMock = jest.fn(async (name: string) => {
      const newEntries = [...cacheEntries.entries()].find(
        ([cacheName]) =>
          cacheName !== previousName && cacheName !== otherLocaleName,
      )?.[1];
      publicationAtDeletion.push(newEntries?.has(manifestUrl) ?? false);
      return cacheEntries.delete(name);
    });
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        keys: async () => [...cacheEntries.keys()],
        open: async (name: string) => {
          let entries = cacheEntries.get(name);
          if (!entries) {
            entries = new Map<string, CachedResponse>();
            cacheEntries.set(name, entries);
          }
          const storedEntries = entries;
          return {
            match: async (url: string | URL) =>
              storedEntries.get(cacheKey(url)),
            put: async (url: string | URL, value: CachedResponse) => {
              storedEntries.set(cacheKey(url), value);
            },
          };
        },
        delete: deleteMock,
      },
    });
    Object.defineProperty(globalThis, "Response", {
      configurable: true,
      value: jest.fn((body: string) => response(body, "application/json")),
    });
    const fetchMock = jest.fn(async (url: URL) => {
      const resource = resources.get(url.href);
      if (!resource) throw new Error(`Unexpected download: ${url.href}`);
      return resource;
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        getRegistration: jest.fn().mockResolvedValue(undefined),
        register: jest.fn().mockResolvedValue(undefined),
        ready: Promise.resolve(undefined),
      },
    });

    const { unmount } = render(
      <OfflineBookToggle locale="en" pagePaths={pagePaths} />,
    );
    const toggle = screen.getByRole("checkbox", { name: "Read offline" });
    await waitFor(() => expect(toggle).toBeEnabled());
    cacheEntries.set(previousName, previousEntries);
    cacheEntries.set(otherLocaleName, new Map());
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(toggle).toBeEnabled();
      expect(toggle).toBeChecked();
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(window.localStorage.getItem(savedMarkerKey)).toBe("true");
    expect(deleteMock.mock.calls).toEqual([[previousName]]);
    expect(publicationAtDeletion).toEqual([true]);
    expect(cacheEntries.has(otherLocaleName)).toBe(true);
    const savedEntries = [...cacheEntries.entries()].find(([name]) =>
      name.startsWith("nzt-offline-book-v1-en-"),
    )?.[1];
    expect(savedEntries).toBeDefined();
    expect([...(savedEntries?.keys() ?? [])].sort()).toEqual(
      [...resources.keys(), manifestUrl].sort(),
    );
    expect((await savedEntries?.get(manifestUrl)?.json())?.sort()).toEqual(
      [...resources.keys()].sort(),
    );
    expect(fetchMock).toHaveBeenCalledTimes(resources.size);
    for (const [url, resource] of resources) {
      expect(await savedEntries?.get(url)?.text()).toBe(await resource.text());
    }

    unmount();
    window.localStorage.removeItem(savedMarkerKey);
    render(<OfflineBookToggle locale="en" pagePaths={pagePaths} />);
    const restoredToggle = screen.getByRole("checkbox", {
      name: "Read offline",
    });
    await waitFor(() => {
      expect(restoredToggle).toBeEnabled();
      expect(restoredToggle).toBeChecked();
    });
    expect(window.localStorage.getItem(savedMarkerKey)).toBe("true");
    expect(fetchMock).toHaveBeenCalledTimes(resources.size);
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
        keys: jest.fn().mockResolvedValue([]),
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
      match: jest.fn(async (url: string | URL) =>
        String(url).includes("/__offline-book-cache__/manifest-en")
          ? {
              json: jest.fn().mockResolvedValue(["/book/chapter-1/"]),
            }
          : true,
      ),
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
