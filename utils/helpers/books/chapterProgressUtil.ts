const STORAGE_KEY = "book-reading-progress";
export const CHAPTER_PROGRESS_EVENT = "chapter-progress-update";

const normalize = (pathname: string) => pathname.replace(/\/$/, "");

export const saveChapterProgress = (
  pathname: string,
  progress: number,
): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const data: Record<string, number> = stored ? JSON.parse(stored) : {};
    data[normalize(pathname)] = Math.round(progress);
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
    return data[normalize(pathname)] ?? 0;
  } catch {
    return 0;
  }
};
