"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import WaitlistModal from "./WaitlistModal";

/**
 * WaitlistProvider — mounts the single shared WaitlistModal and exposes
 * `openWaitlist()` / `closeWaitlist()` to any descendant via `useWaitlist()`.
 *
 * Mounted once in app/layout.tsx so the header and every page can trigger the
 * same waitlist form (the real, backend-wired CTA) instead of dead anchors.
 */

type WaitlistContextValue = {
  openWaitlist: () => void;
  closeWaitlist: () => void;
};

const WaitlistContext = createContext<WaitlistContextValue | null>(null);

export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openWaitlist = useCallback(() => setIsOpen(true), []);
  const closeWaitlist = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ openWaitlist, closeWaitlist }),
    [openWaitlist, closeWaitlist]
  );

  return (
    <WaitlistContext.Provider value={value}>
      {children}
      <WaitlistModal isOpen={isOpen} onClose={closeWaitlist} />
    </WaitlistContext.Provider>
  );
}

export function useWaitlist(): WaitlistContextValue {
  const ctx = useContext(WaitlistContext);
  if (!ctx) {
    throw new Error("useWaitlist must be used within a <WaitlistProvider>");
  }
  return ctx;
}
