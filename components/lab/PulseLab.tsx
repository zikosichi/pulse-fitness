"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import PulseCanvas from "@/components/pulse/PulseCanvas";
import { DEFAULTS, type Settings } from "@/components/pulse/settings";
import { CONTROLS, DEBUG_MODES, PRESETS } from "./controls";
import s from "./lab.module.css";

export default function PulseLab() {
  const [set, setSet] = useState<Settings>(DEFAULTS);
  const [debug, setDebug] = useState(0);
  const [paused, setPaused] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [mark, setMark] = useState(0);          // overlay opacity
  const [overlay, setOverlay] = useState<"wordmark" | "logo">("wordmark");
  const [glowFront, setGlowFront] = useState(true);
  const [fps, setFps] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [fit, setFit] = useState({ scale: 0, x: 0, y: 0 });
  const [copied, setCopied] = useState(false);

  const groups = useMemo(() => {
    const g = new Map<string, typeof CONTROLS[number][]>();
    for (const c of CONTROLS) g.set(c.group, [...(g.get(c.group) ?? []), c]);
    return [...g];
  }, []);

  const onFit = useCallback((f: { scale: number; x: number; y: number }) => setFit(f), []);
  const onFps = useCallback((f: number) => setFps(f), []);
  const onError = useCallback((m: string) => setErr(m), []);

  const copy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(set, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className={s.lab}>
      <header className={s.bar}>
        <h1>Pulse line — WebGL lab</h1>
        <p>
          The ECG centreline from the logo, lit as a signed-distance field.
          Filaments are sampled in <em>path space</em>, so they run along the
          line and travel around the spike.
        </p>
      </header>

      <div className={`${s.stage}${glowFront && mark > 0 ? ` ${s.glowFront}` : ""}`}>
        {err ? (
          <p className={s.err}>{err}</p>
        ) : (
          <PulseCanvas
            settings={set}
            debug={debug}
            paused={paused}
            zoom={zoom}
            onFps={onFps}
            onError={onError}
            onFit={onFit}
          />
        )}

        {/* Laid over the shader with the identical transform, so the two are
            in exact register.
              wordmark — the duplicate with the ECG line stripped, which is the
                         real composite: the lit line replaces the drawn one.
              logo     — the untouched original, kept as the alignment check.
                         If the glow does not sit on its green line, the fit is
                         wrong. */}
        {mark > 0 && fit.scale > 0 && (
          <Image
            src={overlay === "wordmark"
              ? "/brand/pulse-fitness-wordmark.svg"
              : "/brand/pulse-fitness-logo.svg"}
            alt=""
            width={1283}
            height={511}
            className={s.overlay}
            style={{
              opacity: mark,
              transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})`,
            }}
          />
        )}

        <p className={s.fps} data-slow={fps > 0 && fps < 50 ? "" : undefined}>
          {fps} fps
        </p>
      </div>

      <aside className={s.panel}>
        <div className={s.row}>
          {Object.keys(PRESETS).map((name) => (
            <button
              key={name}
              type="button"
              className={s.chip}
              onClick={() => setSet({ ...DEFAULTS, ...PRESETS[name] })}
            >
              {name}
            </button>
          ))}
        </div>

        <div className={s.row}>
          <button type="button" className={s.chip} onClick={() => setPaused((p) => !p)}>
            {paused ? "Play" : "Freeze"}
          </button>
          <button type="button" className={s.chip} onClick={copy}>
            {copied ? "Copied" : "Copy JSON"}
          </button>
          <button type="button" className={s.chip} onClick={() => setSet(DEFAULTS)}>
            Reset
          </button>
        </div>

        <label className={s.field}>
          <span>View</span>
          <select value={debug} onChange={(e) => setDebug(+e.target.value)}>
            {DEBUG_MODES.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
        </label>

        <label className={s.slider}>
          <span>Zoom<b>{zoom.toFixed(2)}</b></span>
          <input type="range" min={0.4} max={4} step={0.05} value={zoom}
                 onChange={(e) => setZoom(+e.target.value)} />
        </label>

        <label className={s.field}>
          <span>Overlay</span>
          <select value={overlay} onChange={(e) => setOverlay(e.target.value as "wordmark" | "logo")}>
            <option value="wordmark">Wordmark (no pulse)</option>
            <option value="logo">Full logo (alignment)</option>
          </select>
        </label>

        <label className={s.slider}>
          <span>Overlay opacity<b>{mark.toFixed(2)}</b></span>
          <input type="range" min={0} max={1} step={0.02} value={mark}
                 onChange={(e) => setMark(+e.target.value)} />
        </label>

        <div className={s.row}>
          <button type="button" className={s.chip} data-on={glowFront ? "" : undefined}
                  onClick={() => setGlowFront((v) => !v)}>
            {glowFront ? "Glow over letters" : "Letters over glow"}
          </button>
        </div>

        {groups.map(([group, items]) => (
          <section key={group}>
            <h2>{group}</h2>
            {items.map((c) => (
              <label key={c.key} className={s.slider} title={c.hint}>
                <span>
                  {c.label}
                  <b>{set[c.key] >= 100 ? set[c.key].toFixed(0) : set[c.key].toFixed(3)}</b>
                </span>
                <input
                  type="range"
                  min={c.min} max={c.max} step={c.step}
                  value={set[c.key]}
                  onChange={(e) => setSet((v) => ({ ...v, [c.key]: +e.target.value }))}
                />
                {c.hint && <i>{c.hint}</i>}
              </label>
            ))}
          </section>
        ))}
      </aside>
    </div>
  );
}
