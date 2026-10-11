import { render, screen, waitFor } from "@testing-library/react";

import { OfflineBookToggle } from "@/components/Books/OfflineBookToggle/OfflineBookToggle";

describe("OfflineBookToggle", () => {
  let originalCaches: PropertyDescriptor | undefined;
  let originalServiceWorker: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalCaches = Object.getOwnPropertyDescriptor(window, "caches");
    originalServiceWorker = Object.getOwnPropertyDescriptor(
      navigator,
      "serviceWorker",
    );
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
});
