"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CaveData } from "@/utils/database/queries/cavesQuery";
import { SubwayData } from "@/utils/database/queries/subwaysQuery";
import { WorkData } from "@/utils/database/queries/worksQuery";

const EXIT_DURATION_DEFAULT = 150;
const EXIT_DURATION_SLIDE = 250;
const EXIT_DURATION_FADE = 300;

export function useWorksMapSelectionState() {
  const [displayedWork, setDisplayedWork] = useState<WorkData | null>(null);
  const [displayedCave, setDisplayedCave] = useState<CaveData | null>(null);
  const [displayedSubway, setDisplayedSubway] = useState<SubwayData | null>(
    null,
  );
  const [isExiting, setIsExiting] = useState(false);
  const [stackIndex, setStackIndex] = useState(0);
  const [stackTotal, setStackTotal] = useState(0);
  const [animType, setAnimType] = useState<
    "default" | "fade" | "slide-next" | "slide-prev"
  >("default");

  const displayedWorkRef = useRef<WorkData | null>(null);
  const displayedCaveRef = useRef<CaveData | null>(null);
  const displayedSubwayRef = useRef<SubwayData | null>(null);
  const stackedWorksRef = useRef<WorkData[]>([]);
  const stackIndexRef = useRef(0);
  const pendingStackIndexRef = useRef<number | null>(null);
  const nextWorkRef = useRef<WorkData | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitDurationRef = useRef(EXIT_DURATION_DEFAULT);

  const selectWork = useCallback((work: WorkData | null) => {
    if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);

    if (!displayedWorkRef.current) {
      displayedWorkRef.current = work;
      setDisplayedWork(work);
      if (pendingStackIndexRef.current !== null) {
        setStackIndex(pendingStackIndexRef.current);
        pendingStackIndexRef.current = null;
      }
      return;
    }

    nextWorkRef.current = work;
    setIsExiting(true);
    exitTimeoutRef.current = setTimeout(() => {
      displayedWorkRef.current = nextWorkRef.current;
      setDisplayedWork(nextWorkRef.current);
      setIsExiting(false);
      if (pendingStackIndexRef.current !== null) {
        setStackIndex(pendingStackIndexRef.current);
        pendingStackIndexRef.current = null;
      }
    }, exitDurationRef.current);
  }, []);

  const showWorkStack = useCallback(
    (
      stackWorks: WorkData[],
      nextAnimType: "fade" | "slide-next" | "slide-prev" = "fade",
    ) => {
      stackedWorksRef.current = stackWorks;
      stackIndexRef.current = 0;
      setStackIndex(0);
      setStackTotal(stackWorks.length);
      setAnimType(nextAnimType);
      exitDurationRef.current =
        nextAnimType === "fade" ? EXIT_DURATION_FADE : EXIT_DURATION_SLIDE;
      selectWork(stackWorks[0] ?? null);
    },
    [selectWork],
  );

  const showSingleWork = useCallback(
    (work: WorkData) => {
      stackedWorksRef.current = [work];
      stackIndexRef.current = 0;
      setStackIndex(0);
      setStackTotal(1);
      setAnimType("fade");
      exitDurationRef.current = EXIT_DURATION_FADE;
      selectWork(work);
    },
    [selectWork],
  );

  const navigateWorkStack = useCallback(
    (direction: 1 | -1) => {
      const stack = stackedWorksRef.current;
      if (stack.length <= 1) return;

      const newIndex =
        (stackIndexRef.current + direction + stack.length) % stack.length;
      stackIndexRef.current = newIndex;
      setAnimType(direction === 1 ? "slide-next" : "slide-prev");
      exitDurationRef.current = EXIT_DURATION_SLIDE;
      pendingStackIndexRef.current = newIndex;
      selectWork(stack[newIndex]);
    },
    [selectWork],
  );

  const clearWorkSelection = useCallback(() => {
    stackedWorksRef.current = [];
    stackIndexRef.current = 0;
    setStackIndex(0);
    setStackTotal(0);
    selectWork(null);
  }, [selectWork]);

  const setDisplayedCaveSelection = useCallback((cave: CaveData | null) => {
    displayedCaveRef.current = cave;
    setDisplayedCave(cave);
  }, []);

  const setDisplayedSubwaySelection = useCallback(
    (subway: SubwayData | null) => {
      displayedSubwayRef.current = subway;
      setDisplayedSubway(subway);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, []);

  return {
    displayedWork,
    displayedWorkRef,
    displayedCave,
    displayedCaveRef,
    displayedSubway,
    displayedSubwayRef,
    isExiting,
    stackIndex,
    stackTotal,
    animType,
    stackedWorksRef,
    selectWork,
    showWorkStack,
    showSingleWork,
    navigateWorkStack,
    clearWorkSelection,
    setDisplayedCaveSelection,
    setDisplayedSubwaySelection,
  };
}
