"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useState, type CSSProperties } from "react";
import lab from "../lab.module.css";
import s from "./buttons.module.css";
import Specimen, { FX, type Fx } from "./Specimen";

/* The knobs reach the CSS as custom properties, which React's CSSProperties
   does not model. */
type Vars = CSSProperties & Record<`--${string}`, string | number>;

const SIZES = {
  sm: { "--bh": "44px", "--bp": "24px", "--bf": "14px" },
  md: { "--bh": "52px", "--bp": "30px", "--bf": "15px" },
  lg: { "--bh": "56px", "--bp": "32px", "--bf": "16px" },
} as const;

const COPY = {
  ka: { call: "დარეკე", classes: "ნახე ვარჯიშები", line: "წყალტუბოს პირველი სპორტდარბაზი" },
  en: { call: "Call", classes: "View classes", line: "Tskaltubo's first gym" },
} as const;

const BATCHES = [
  { id: 2 as const, title: "Batch 02", note: "Light across the face, real depth, material." },
  { id: 1 as const, title: "Batch 01", note: "The first pass, kept for reference." },
];

const GROUNDS = [
  ["ink", "Ink (section)"],
  ["two", "Ink 2 (alt section)"],
  ["deep", "Ink deep (footer)"],
  ["photo", "Over the hero photo"],
] as const;

export default function ButtonLab() {
  const [base, setBase] = useState<"solid" | "ghost">("solid");
  const [ground, setGround] = useState<(typeof GROUNDS)[number][0]>("ink");
  const [size, setSize] = useState<keyof typeof SIZES>("md");
  const [lang, setLang] = useState<keyof typeof COPY>("ka");
  const [hold, setHold] = useState(false);
  const [still, setStill] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [gain, setGain] = useState(1);
  const [pick, setPick] = useState<Fx>("shine");

  const copy = COPY[lang];
  const root: Vars = { ...SIZES[size], "--speed": speed, "--gain": gain };

  return (
    <div className={s.lab} style={root} data-still={still ? "" : undefined}>
      <header className={s.bar}>
        <h1>Buttons — hover lab</h1>
        <p>
          Seventeen treatments for the CTA, all on the same shell so only the
          effect differs. Batch 02 leaves the electric brief alone and goes
          after <em>light across the face</em>, physical depth and material
          instead; batch 01 is the first pass, kept underneath for reference.
          Sibling of the <Link href="/lab">pulse line lab</Link>.
        </p>
      </header>

      <div className={s.tools}>
        <div className={lab.row}>
          {(["solid", "ghost"] as const).map((b) => (
            <button key={b} type="button" className={lab.chip}
                    data-on={base === b ? "" : undefined} onClick={() => setBase(b)}>
              {b === "solid" ? "Solid" : "Ghost"}
            </button>
          ))}
        </div>

        <div className={lab.row}>
          {(Object.keys(SIZES) as Array<keyof typeof SIZES>).map((k) => (
            <button key={k} type="button" className={lab.chip}
                    data-on={size === k ? "" : undefined} onClick={() => setSize(k)}>
              {k.toUpperCase()}
            </button>
          ))}
        </div>

        <label className={lab.field}>
          <span>Ground</span>
          <select value={ground} onChange={(e) => setGround(e.target.value as typeof ground)}>
            {GROUNDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>

        <div className={lab.row}>
          <button type="button" className={lab.chip}
                  data-on={lang === "ka" ? "" : undefined}
                  onClick={() => setLang(lang === "ka" ? "en" : "ka")}>
            {lang === "ka" ? "ქართული" : "English"}
          </button>
          <button type="button" className={lab.chip}
                  data-on={hold ? "" : undefined} onClick={() => setHold((v) => !v)}>
            {hold ? "Hover held" : "Hold hover"}
          </button>
          <button type="button" className={lab.chip}
                  data-on={still ? "" : undefined} onClick={() => setStill((v) => !v)}>
            {still ? "Frozen" : "Freeze"}
          </button>
        </div>

        <label className={`${lab.slider} ${s.grow}`}>
          <span>Speed<b>{speed.toFixed(2)}×</b></span>
          <input type="range" min={0.2} max={2.5} step={0.05} value={speed}
                 onChange={(e) => setSpeed(+e.target.value)} />
        </label>

        <label className={`${lab.slider} ${s.grow}`}>
          <span>Glow<b>{gain.toFixed(2)}×</b></span>
          <input type="range" min={0} max={2} step={0.05} value={gain}
                 onChange={(e) => setGain(+e.target.value)} />
        </label>
      </div>

      <div className={s.grid} data-ground={ground}>
        {BATCHES.map((b) => (
          <Fragment key={b.id}>
            <h2 className={s.batch}>{b.title}<span>{b.note}</span></h2>
            {FX.filter((f) => f.batch === b.id).map((f) => (
              <section key={f.key} className={s.cell}>
                <h3>
                  {f.name}
                  <button type="button" data-pick={pick === f.key ? "" : undefined}
                          onClick={() => setPick(f.key)}>
                    {pick === f.key ? "in situ ✓" : "in situ"}
                  </button>
                </h3>

                <div className={s.stage}>
                  <Specimen fx={f.key} base={base} label={copy.call}
                            hold={hold} speed={still ? 0 : speed} gain={gain} />
                </div>

                <p className={s.note}>{f.note}</p>
              </section>
            ))}
          </Fragment>
        ))}
      </div>

      {/* The only test that counts: the pair, at hero size, over the photo the
          hero actually uses. Effects that look great on a flat ground go to
          mush here. */}
      <section className={s.situ} style={SIZES.lg as Vars}>
        <Image src="/space/hero-boxing.jpg" alt="" fill sizes="100vw" quality={70} />
        <small>In situ — {FX.find((f) => f.key === pick)?.name}</small>
        <p>{copy.line}</p>
        <div className={s.situRow}>
          <Specimen fx={pick} base="solid" label={copy.call}
                    hold={hold} speed={still ? 0 : speed} gain={gain} />
          <Specimen fx={pick} base="ghost" label={copy.classes} icon={false}
                    hold={hold} speed={still ? 0 : speed} gain={gain} />
        </div>
      </section>
    </div>
  );
}
