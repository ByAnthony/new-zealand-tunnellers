"use client";

import { useSyncExternalStore } from "react";

import { getTunnellersReturnUrl } from "@/utils/helpers/tunnellersReturn";

const subscribeToNothing = () => () => {};

export function useStoredReturnUrl(fallbackUrl: string) {
  return useSyncExternalStore(
    subscribeToNothing,
    () => getTunnellersReturnUrl(fallbackUrl),
    () => fallbackUrl,
  );
}
