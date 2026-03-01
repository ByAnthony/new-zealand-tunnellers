const STORAGE_KEY = "book-reading-progress";

const normalize = (pathname: string): string => {
  const noQueryOrHash = pathname.split("#")[0].split("?")[0];
  return noQueryOrHash.replace(/^\/+|\/+$/g, "").toLowerCase();
};

export const saveChapterProgress = (
  pathname: string,
  progress: number,
): void => {
  try {
    const normalizedPath = normalize(pathname);
    const stored = localStorage.getItem(STORAGE_KEY);
    const data: Record<string, number> = stored ? JSON.parse(stored) : {};
    data[normalizedPath] = Math.round(progress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("[saveChapterProgress] Error:", error);
  }
};

export const getChapterProgress = (pathname: string): number => {
  try {
    const normalizedPath = normalize(pathname);
    const stored = localStorage.getItem(STORAGE_KEY);
    const data: Record<string, number> = stored ? JSON.parse(stored) : {};
    return data[normalizedPath] ?? 0;
  } catch {
    return 0;
  }
};
