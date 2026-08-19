"use client";

import { useEffect, useState } from "react";
import { useLang } from "./LangProvider";
import { CallButton, PulseMark } from "./bits";
import { nav, ui } from "@/lib/content";

/* A floating pill rather than an edge bar. The artboard only ever shows it
   over the hero, but it is fixed so it survives the scroll — this page's
   day job is a business card and the call button has to stay reachable. */
export default function Nav() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const sections = nav
      .map((n) => document.querySelector(n.href))
      .filter((el): el is Element => Boolean(el));
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Close the sheet when the viewport grows back past the breakpoint,
  // otherwise it stays mounted-but-open behind the desktop layout.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const sync = () => mq.matches && setOpen(false);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <header className="nav">
      <div className="nav__pill">
        <a href="#top" aria-label="Pulse Fitness">
          <PulseMark />
        </a>

        <nav
          id="navLinks"
          className={`nav__links${open ? " is-open" : ""}`}
          aria-label="Main"
        >
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className={active === n.href ? "is-active" : undefined}
              onClick={() => setOpen(false)}
            >
              {t(n.label)}
            </a>
          ))}
        </nav>

        <span className="nav__spacer" />
        <span className="nav__sep" aria-hidden="true" />

        <div className="langtoggle" role="group" aria-label="Language / ენა">
          <button
            type="button"
            className={lang === "ka" ? "is-on" : undefined}
            aria-pressed={lang === "ka"}
            onClick={() => setLang("ka")}
          >
            KA
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            className={lang === "en" ? "is-on" : undefined}
            aria-pressed={lang === "en"}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </div>

        <CallButton size="sm" className="nav__cta" />

        <button
          className="burger"
          aria-expanded={open}
          aria-controls="navLinks"
          aria-label={t(ui.menu)}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
