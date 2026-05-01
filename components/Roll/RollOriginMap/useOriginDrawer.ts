import { useCallback, useEffect, useRef, useState } from "react";

import { OriginMarker } from "./originMapMarkers";

const DRAWER_ANIMATION_MS = 900;

export function useOriginDrawer() {
  const drawerCloseTimeoutRef = useRef<number | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<OriginMarker | null>(
    null,
  );
  const [renderedOrigin, setRenderedOrigin] = useState<OriginMarker | null>(
    null,
  );
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);

  const clearDrawerCloseTimeout = useCallback(() => {
    if (drawerCloseTimeoutRef.current === null) return;
    window.clearTimeout(drawerCloseTimeoutRef.current);
    drawerCloseTimeoutRef.current = null;
  }, []);

  const openOriginDrawer = useCallback(
    (origin: OriginMarker) => {
      clearDrawerCloseTimeout();
      setRenderedOrigin(origin);
      setSelectedOrigin(origin);
      setIsDrawerClosing(false);
    },
    [clearDrawerCloseTimeout],
  );

  const closeOriginDrawer = useCallback(() => {
    clearDrawerCloseTimeout();
    if (!renderedOrigin && !selectedOrigin) return;
    setSelectedOrigin(null);
    setIsDrawerClosing(true);
    drawerCloseTimeoutRef.current = window.setTimeout(() => {
      setRenderedOrigin(null);
      setIsDrawerClosing(false);
      drawerCloseTimeoutRef.current = null;
    }, DRAWER_ANIMATION_MS);
  }, [clearDrawerCloseTimeout, renderedOrigin, selectedOrigin]);

  useEffect(() => {
    return clearDrawerCloseTimeout;
  }, [clearDrawerCloseTimeout]);

  useEffect(() => {
    document.body.classList.toggle(
      "roll-origin-drawer-open",
      selectedOrigin !== null,
    );

    return () => {
      document.body.classList.remove("roll-origin-drawer-open");
    };
  }, [selectedOrigin]);

  return {
    closeOriginDrawer,
    isDrawerClosing,
    openOriginDrawer,
    renderedOrigin,
    selectedOrigin,
  };
}
