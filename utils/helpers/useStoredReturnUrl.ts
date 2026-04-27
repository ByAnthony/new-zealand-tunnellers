"use client";

import { useSyncExternalStore } from "react";

const subscribeToNothing = () => () => {};

export function useStoredReturnUrl(fallbackUrl: string) {
  return useSyncExternalStore(
    subscribeToNothing,
    () => localStorage.getItem("tunnellers:return") ?? fallbackUrl,
    () => fallbackUrl,
  );
}
