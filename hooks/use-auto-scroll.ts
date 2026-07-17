"use client";

import { useCallback, useEffect, useRef } from "react";

export function useAutoScroll<T extends HTMLElement>(deps: unknown[]) {
  const containerRef = useRef<T>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom(deps.length === 0 ? "instant" : "smooth");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps drive scroll triggers
  }, deps);

  return { containerRef, bottomRef, scrollToBottom };
}
