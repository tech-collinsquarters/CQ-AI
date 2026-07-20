"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type RightPanelContextValue = {
  content: ReactNode | null;
  setContent: (content: ReactNode | null) => void;
};

const RightPanelContext = createContext<RightPanelContextValue | null>(null);

export function RightPanelProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode | null>(null);

  const value = useMemo<RightPanelContextValue>(
    () => ({ content, setContent }),
    [content],
  );

  return (
    <RightPanelContext.Provider value={value}>
      {children}
    </RightPanelContext.Provider>
  );
}

export function useRightPanel() {
  const context = useContext(RightPanelContext);
  if (!context) {
    throw new Error("useRightPanel must be used within a RightPanelProvider");
  }
  return context;
}

/**
 * Publishes `content` into the shell's right panel while the calling
 * component is mounted, clearing it on unmount so other pages fall back to
 * the panel's empty state.
 */
export function useRightPanelContent(content: ReactNode | null) {
  const { setContent } = useRightPanel();

  useEffect(() => {
    setContent(content);
    return () => setContent(null);
  }, [content, setContent]);
}
