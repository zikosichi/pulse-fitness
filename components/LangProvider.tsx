"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Bi, Lang } from "@/lib/content";

/* -------------------------------------------------------------------------
   Language lives outside React: it comes from ?lang= or localStorage, both
   of which only exist in the browser. useSyncExternalStore lets the server
   render Georgian and the client correct itself without a hydration
   mismatch — and without setState inside an effect.
   ------------------------------------------------------------------------- */

const STORAGE_KEY = "pulse-lang";
const listeners = new Set<() => void>();
let current: Lang | null = null;

function read(): Lang {
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (fromUrl === "en" || fromUrl === "ka") return fromUrl;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "ka") return saved;
  } catch {
    /* private mode */
  }
  return "ka";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): Lang {
  if (current === null) current = read();
  return current;
}

/** Georgian is the audience default, so it is what gets prerendered. */
function getServerSnapshot(): Lang {
  return "ka";
}

function write(next: Lang) {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* preference just won't persist */
  }
  listeners.forEach((fn) => fn());
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (b: Bi) => string };

const LangCtx = createContext<Ctx>({
  lang: "ka",
  setLang: () => {},
  t: (b) => b.ka,
});

export const useLang = () => useContext(LangCtx);

export function LangProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => write(l), []);
  const t = useCallback((b: Bi) => b[lang], [lang]);

  return (
    <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>
  );
}
