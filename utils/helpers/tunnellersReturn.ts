export type RollView = "list" | "map";

const ROLL_VIEW_KEY = "roll:view";
const TUNNELLERS_RETURN_KEY = "tunnellers:return";

function readStorage(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorage(
  storage: Storage | undefined,
  key: string,
  value: string,
) {
  try {
    storage?.setItem(key, value);
  } catch {
    return;
  }
}

function getUrlView(url: string): RollView {
  try {
    return new URL(url, window.location.origin).searchParams.get("view") ===
      "map"
      ? "map"
      : "list";
  } catch {
    return "list";
  }
}

function withMapView(url: string): string {
  const [path, hash = ""] = url.split("#");
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("view", "map");
  const search = params.toString();

  return `${pathname}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`;
}

export function saveRollView(view: RollView) {
  if (typeof window === "undefined") return;

  writeStorage(window.sessionStorage, ROLL_VIEW_KEY, view);
}

export function saveTunnellersReturnUrl(url: string) {
  if (typeof window === "undefined") return;

  writeStorage(window.localStorage, TUNNELLERS_RETURN_KEY, url);
  saveRollView(getUrlView(url));
}

export function getTunnellersReturnUrl(fallbackUrl: string): string {
  if (typeof window === "undefined") return fallbackUrl;

  const storedView = readStorage(window.sessionStorage, ROLL_VIEW_KEY);
  const storedReturnUrl = readStorage(
    window.localStorage,
    TUNNELLERS_RETURN_KEY,
  );

  if (storedView === "map") {
    return storedReturnUrl && getUrlView(storedReturnUrl) === "map"
      ? storedReturnUrl
      : withMapView(fallbackUrl);
  }

  if (storedView === "list") {
    return storedReturnUrl && getUrlView(storedReturnUrl) === "list"
      ? storedReturnUrl
      : fallbackUrl;
  }

  return storedReturnUrl ?? fallbackUrl;
}
