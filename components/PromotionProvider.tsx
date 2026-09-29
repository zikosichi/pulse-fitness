"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { PROMOTION_END } from "@/lib/presale/promotion";

const PromotionClock = createContext(0);
export function PromotionProvider({ initialNow, children }: { initialNow: number; children: React.ReactNode }) {
  const [now, setNow] = useState(initialNow);
  useEffect(() => {
    const mountedAt = Date.now();
    const sync = () => setNow(initialNow + Date.now() - mountedAt);
    const remaining = PROMOTION_END - initialNow;
    const timer = remaining > 0 ? setTimeout(sync, Math.min(remaining + 1, 2_147_483_647)) : undefined;
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [initialNow]);
  return <PromotionClock.Provider value={now}>{children}</PromotionClock.Provider>;
}
export const usePromotionTime = () => useContext(PromotionClock);
