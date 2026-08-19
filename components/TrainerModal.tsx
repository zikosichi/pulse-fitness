"use client";

import Image from "next/image";
import type { MouseEventHandler } from "react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useLang } from "./LangProvider";
import { CallButton, Close } from "./bits";
import { ui, type Trainer } from "@/lib/content";

/* The panel a trainer card morphs into. A native <dialog> so the focus trap,
   Esc and the inert background come from the platform rather than from us —
   Esc is intercepted only so closing runs through the same view transition
   the close button does.

   The dialog itself is a transparent full-screen host: the dim is a real
   child element, not ::backdrop, because Chrome does not capture the top
   layer's backdrop in a view transition and it would snap on at full
   strength while the panel was still growing. As an ordinary element with
   its own transition name it fades in step with the morph. */
export default function TrainerModal({
  trainer,
  onClose,
  onBook,
}: {
  trainer: Trainer;
  onClose: () => void;
  onBook: MouseEventHandler<HTMLAnchorElement>;
}) {
  const { t } = useLang();
  const ref = useRef<HTMLDialogElement>(null);
  const text = trainer.bio ?? (trainer.short ? [trainer.short] : null);

  /* showModal has to run synchronously with the mount: opening happens inside
     the view-transition callback, and the dialog must already be in the top
     layer when the browser takes its "after" snapshot. Focus goes to the
     dialog rather than the first control, so the trainer's name is announced
     instead of the call button. */
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !el.open) {
      el.showModal();
      el.focus();
    }
  }, []);

  /* showModal does not lock the page behind it. The padding keeps the layout
     from jumping left where the scrollbar takes up room. */
  useEffect(() => {
    const html = document.documentElement;
    const gutter = window.innerWidth - html.clientWidth;
    const overflow = html.style.overflow;
    const pad = html.style.paddingRight;
    html.style.overflow = "hidden";
    if (gutter > 0) html.style.paddingRight = `${gutter}px`;
    return () => {
      html.style.overflow = overflow;
      html.style.paddingRight = pad;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="tsheet"
      tabIndex={-1}
      aria-labelledby="tmodal-name"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="tsheet__scrim" onClick={() => onClose()} />

      <div className="tmodal">
        <div className="tmodal__inner">
          <div className="tmodal__aside">
            <div className="tmodal__media">
              <Image
                src={trainer.photo}
                alt={t(trainer.name)}
                width={640}
                height={800}
                sizes="(max-width: 860px) 100vw, 340px"
                quality={82}
              />
              <span
                className={`tcard__badge${trainer.head ? " tcard__badge--lead" : ""}`}
              >
                {t(trainer.role)}
              </span>
            </div>
            <div className="tmodal__stats">
              {trainer.stats.map((s) => (
                <div key={s.v + s.k.en}>
                  <b>{s.v}</b>
                  <span>{t(s.k)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="tmodal__body">
            <div className="tmodal__head">
              <h3 id="tmodal-name">{t(trainer.name)}</h3>
              {trainer.specialty && (
                <p className="tmodal__spec">{t(trainer.specialty)}</p>
              )}
            </div>
            {/* Everything with no counterpart on the card is grouped so the
                morph can hold it back until the box has nearly arrived. */}
            <div className="tmodal__detail">
              {text && (
                <div className="tmodal__text">
                  {text.map((p) => (
                    <p key={p.en}>{t(p)}</p>
                  ))}
                </div>
              )}
              <CallButton
                label={ui.bookSession}
                className="tmodal__cta"
                onClick={onBook}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          className="tmodal__close"
          onClick={() => onClose()}
          aria-label={t(ui.less)}
        >
          <Close />
        </button>
      </div>
    </dialog>
  );
}
