"use client";

import Image from "next/image";
import { useLang } from "./LangProvider";
import { classes, proof, trainers } from "@/lib/content";

/* One card straddling the seam between the two grounds. Every figure is one
   we can stand behind, and each carries its own kind of evidence rather
   than asserting a bare number: the trainers show their faces, the classes
   list themselves. */
export default function Proof() {
  const { t } = useLang();
  const shown = classes.slice(0, 4);
  const rest = classes.length - shown.length;

  return (
    <section className="proof">
      <div className="wrap">
        <div className="proof__card">
          <div className="proof__item">
            <b className="proof__fig accent">{proof.first.figure}</b>
            <span className="proof__label">{t(proof.first.label)}</span>
            <span className="proof__note">{t(proof.first.note)}</span>
          </div>

          <div className="proof__item">
            <b className="proof__fig">{proof.trainers.figure}</b>
            <span className="proof__label">{t(proof.trainers.label)}</span>
            <div className="facepile">
              {trainers.map((tr) => (
                <Image
                  key={tr.id}
                  src={tr.photo}
                  alt={t(tr.name)}
                  width={44}
                  height={44}
                  sizes="44px"
                />
              ))}
            </div>
          </div>

          <div className="proof__item">
            <b className="proof__fig">{proof.classes.figure}</b>
            <span className="proof__label">{t(proof.classes.label)}</span>
            <div className="chips">
              {shown.map((c) => (
                <span key={c.name.en}>{t(c.name)}</span>
              ))}
              {rest > 0 && <span>+{rest}</span>}
            </div>
          </div>

          <div className="proof__item">
            <b className="proof__fig">{proof.hours.figure}</b>
            <span className="proof__label">{t(proof.hours.label)}</span>
            <span className="proof__note">{proof.hours.detail}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
