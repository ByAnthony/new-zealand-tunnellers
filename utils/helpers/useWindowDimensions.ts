import { useSyncExternalStore } from "react";

type WindowDimentions = {
  width: number | undefined;
  height: number | undefined;
};

const subscribeToWindowResize = (onStoreChange: () => void) => {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
};

const getWindowDimensions = () => `${window.innerWidth}:${window.innerHeight}`;

const getServerWindowDimensions = (): null => null;

export const useWindowDimensions = (): WindowDimentions => {
  const dimensions = useSyncExternalStore(
    subscribeToWindowResize,
    getWindowDimensions,
    getServerWindowDimensions,
  );
  if (dimensions === null) return { width: undefined, height: undefined };

  const [width, height] = dimensions.split(":").map(Number);
  return { width, height };
};
