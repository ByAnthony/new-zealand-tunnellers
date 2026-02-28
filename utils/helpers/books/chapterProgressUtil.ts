const STORAGE_KEY = "book-reading-progress";

export const saveChapterProgress = (
  pathname: string,
  progress: number,
): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const data: Record<string, number> = stored ? JSON.parse(stored) : {};
    data[pathname] = Math.round(progress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable
  }
};

export const getChapterProgress = (pathname: string): number => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return 0;
    const data: Record<string, number> = JSON.parse(stored);
    return data[pathname] ?? 0;
  } catch {
    return 0;
  }
};
