import { useEffect, useState } from "react";

type WindowDimentions = {
  width: number | undefined;
  height: number | undefined;
};

export const useWindowDimensions = (): WindowDimentions => {
  const [windowDimensions, setWindowDimensions] = useState<WindowDimentions>(
    () => ({
      width: typeof window === "undefined" ? undefined : window.innerWidth,
      height: typeof window === "undefined" ? undefined : window.innerHeight,
    }),
  );

  useEffect(() => {
    function handleResize(): void {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    return (): void => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
};
