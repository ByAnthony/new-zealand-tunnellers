import { useEffect, useState } from "react";

type WindowDimentions = {
  width: number | undefined;
  height: number | undefined;
};

export const useWindowDimensions = (): WindowDimentions => {
  const [windowDimensions, setWindowDimensions] = useState<WindowDimentions>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize(): void {
      // window genuinely doesn't exist on the server,
      // so state must start undefined and sync after mount.
      // eslint-disable-next-line @eslint-react/set-state-in-effect
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return (): void => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
};
