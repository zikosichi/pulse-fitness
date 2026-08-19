"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLang } from "./LangProvider";
import { Expand } from "./bits";
import TrainerModal from "./TrainerModal";
import { trainers, trainersMeta, ui, type Trainer } from "@/lib/content";

/* Clicking anywhere on a card morphs it into the centred profile panel.

   The morph is a view transition, and the thing that makes it read as one
   object rather than a picture being stretched is that every piece carries
   its own shared name: the photograph becomes the panel's photograph, the
   name block becomes the heading, the stat row becomes the stat row. The
   browser then moves each part to its counterpart instead of scaling one
   flat snapshot of the whole card. The green mark has no counterpart, so it
   simply fades.

   Names are painted onto the card imperatively rather than through state,
   because they have to be on the element before the browser takes its
   "before" snapshot, and handed to the panel inside the update callback —
   two elements holding one name at capture time aborts the transition. */
const PARTS: ReadonlyArray<readonly [string | null, string]> = [
  [null, "trainer-panel"],
  [".tcard__media", "trainer-photo"],
  [".tcard__badge", "trainer-badge"],
  [".tcard__more", "trainer-mark"],
  [".tcard__id", "trainer-name"],
  [".tcard__foot", "trainer-stats"],
];

/* The corner radius is deliberately stripped from whichever box is being
   captured. A radius baked into a snapshot is stretched along with it — the
   card's 18px arc is drawn at nearly 60px once the box reaches full width,
   which is what makes the corners look wrong on the way across. Flattened
   here, the radius comes from the transition group instead and holds at 18px
   the whole way. Only the card being opened is touched; its three neighbours
   keep their corners in the page snapshot. */
function paint(card: HTMLElement | undefined, on: boolean) {
  if (!card) return;
  for (const [sel, name] of PARTS) {
    const el = sel ? card.querySelector<HTMLElement>(sel) : card;
    if (on) el?.style.setProperty("view-transition-name", name);
    else el?.style.removeProperty("view-transition-name");
  }
  if (on) card.style.setProperty("border-radius", "0");
  else card.style.removeProperty("border-radius");
}

interface ViewTransitions {
  startViewTransition?(update: () => void): { finished: Promise<unknown> };
}

const vt = () => document as unknown as ViewTransitions;

const canMorph = () =>
  typeof vt().startViewTransition === "function" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Trainers() {
  const { t } = useLang();
  const [open, setOpen] = useState<Trainer | null>(null);
  const cards = useRef(new Map<string, HTMLElement>());
  const painted = useRef<HTMLElement>(undefined);

  function repaint(card: HTMLElement | undefined) {
    paint(painted.current, false);
    painted.current = card;
    paint(card, true);
  }

  function openCard(tr: Trainer) {
    const card = cards.current.get(tr.id);
    if (!canMorph()) {
      setOpen(tr);
      return;
    }
    const html = document.documentElement;
    html.classList.add("tmorph");
    repaint(card);
    const run = vt().startViewTransition!(() => {
      // The "before" snapshot is taken — hand every name to the panel.
      repaint(undefined);
      flushSync(() => setOpen(tr));
    });
    const done = () => html.classList.remove("tmorph");
    run.finished.then(done, done);
  }

  /* `then` runs once the panel has finished collapsing — booking uses it to
     scroll on, which has to wait: the morph lands on the card's position, and
     scrolling the page out from under it mid-flight would send the panel to
     the wrong place. preventScroll on the focus call for the same reason. */
  function closeCard(then?: () => void) {
    if (!open) return;
    const card = cards.current.get(open.id);
    // Guarded: closeCard doubles as an onClick, and React hands those a click
    // event — truthy, but not callable.
    const next = typeof then === "function" ? then : undefined;
    const finish = () => {
      if (next) next();
      else
        card
          ?.querySelector<HTMLButtonElement>(".tcard__hit")
          ?.focus({ preventScroll: true });
    };

    if (!canMorph()) {
      setOpen(null);
      finish();
      return;
    }
    const html = document.documentElement;
    html.classList.add("tmorph");
    const run = vt().startViewTransition!(() => {
      flushSync(() => setOpen(null));
      repaint(card);
    });
    const done = () => {
      html.classList.remove("tmorph");
      repaint(undefined);
      finish();
    };
    run.finished.then(done, done);
  }

  /* The panel's CTA falls back to #contact while there is no phone number on
     file. Left alone it jumps the page with the panel still open on top of
     it, so intercept: collapse first, then travel. Once a real number is
     configured the href becomes tel: and this steps aside to let it dial. */
  function book(e: React.MouseEvent<HTMLAnchorElement>) {
    const href = e.currentTarget.getAttribute("href") ?? "";
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const target = document.getElementById(href.slice(1));
    closeCard(() => {
      // No behaviour argument: the page's own scroll-behavior applies, which
      // is already turned off under prefers-reduced-motion.
      target?.scrollIntoView();
      target?.focus({ preventScroll: true });
    });
  }

  return (
    <section className="sec sec--alt" id="trainers">
      <div className="wrap">
        <div className="sec-head trainers__head">
          <h2>{t(trainersMeta.title)}</h2>
          <p>{t(trainersMeta.lede)}</p>
        </div>

        <div className="deck">
          {trainers.map((tr) => (
            <article
              className="tcard"
              key={tr.id}
              ref={(el) => {
                if (el) cards.current.set(tr.id, el);
                else cards.current.delete(tr.id);
              }}
            >
              <div className="tcard__media">
                <Image
                  src={tr.photo}
                  alt={t(tr.name)}
                  width={640}
                  height={800}
                  sizes="(max-width: 600px) 100vw, (max-width: 1180px) 50vw, 302px"
                  quality={82}
                />
                <span
                  className={`tcard__badge${tr.head ? " tcard__badge--lead" : ""}`}
                >
                  {t(tr.role)}
                </span>
                <span className="tcard__more" aria-hidden="true">
                  <Expand />
                </span>
              </div>

              <div className="tcard__id">
                <h3>{t(tr.name)}</h3>
                {tr.specialty && <p>{t(tr.specialty)}</p>}
              </div>

              <span className="tcard__spacer" />

              <div className="tcard__foot">
                {tr.stats.map((s) => (
                  <div key={s.v + s.k.en}>
                    <b>{s.v}</b>
                    <span>{t(s.k)}</span>
                  </div>
                ))}
              </div>

              {/* Over the whole card, so the name can stay a heading — a
                  <button> is not allowed to wrap one. */}
              <button
                type="button"
                className="tcard__hit"
                onClick={() => openCard(tr)}
                aria-haspopup="dialog"
                aria-label={`${t(tr.name)} — ${t(ui.fullBio)}`}
              />
            </article>
          ))}
        </div>
      </div>

      {open && (
        <TrainerModal trainer={open} onClose={closeCard} onBook={book} />
      )}
    </section>
  );
}
