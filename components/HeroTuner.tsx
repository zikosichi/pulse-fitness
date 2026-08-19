"use client";

/* Tuning rig for the hero pulse line, in place over the real photograph at the
   real size. Off by default — reach it at /?tune in development.

   Deliberately one self-contained file with inline styles: it touches no
   shared CSS and nothing else references it, so it can sit here indefinitely
   without cost, and deleting it is one file plus the `Tuner` lines in
   HeroMark.tsx.

   It cannot reach production: HeroMark only imports it when NODE_ENV is
   development, so `next build` never pulls it into the graph. */

import { useState } from "react";
import type { Settings } from "@/components/pulse/settings";
import { HERO_SETTINGS } from "@/components/pulse/settings";
import { CONTROLS } from "@/components/lab/controls";

const panel: React.CSSProperties = {
  position: "fixed", top: 96, right: 16, zIndex: 9999,
  width: 232, maxHeight: "calc(100dvh - 128px)", overflowY: "auto",
  padding: "10px 12px 14px",
  background: "#050C09E6", backdropFilter: "blur(12px)",
  border: "1px solid #FFFFFF1F", borderRadius: 12,
  font: "11px/1.4 ui-sans-serif, system-ui", color: "#B4C0BA",
};
const head: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  gap: 8, marginBottom: 8,
};
const btn: React.CSSProperties = {
  padding: "4px 8px", font: "inherit", color: "#C6D2CC", cursor: "pointer",
  background: "transparent", border: "1px solid #FFFFFF29", borderRadius: 6,
};
const row: React.CSSProperties = { display: "block", marginBottom: 7 };
const cap: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 6 };
const val: React.CSSProperties = { color: "#3DC26C", fontVariantNumeric: "tabular-nums" };
const range: React.CSSProperties = { width: "100%", accentColor: "#3DC26C", height: 14 };

type Props = { value: Settings; onChange: (s: Settings) => void };

export default function HeroTuner({ value, onChange }: Props) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  if (!open) {
    return (
      <button type="button" style={{ ...panel, width: "auto", padding: "6px 10px" }}
              onClick={() => setOpen(true)}>
        tune
      </button>
    );
  }

  return (
    <div style={panel}>
      <div style={head}>
        <strong style={{ color: "#FFF", fontWeight: 600, letterSpacing: ".08em" }}>HERO</strong>
        <span style={{ display: "flex", gap: 4 }}>
          <button type="button" style={btn} onClick={copy}>{copied ? "ok" : "copy"}</button>
          <button type="button" style={btn} onClick={() => onChange(HERO_SETTINGS)}>reset</button>
          <button type="button" style={btn} onClick={() => setOpen(false)}>×</button>
        </span>
      </div>

      {CONTROLS.filter((c) => c.key !== "scale").map((c) => (
        <label key={c.key} style={row} title={c.hint}>
          <span style={cap}>
            {c.label}
            <b style={val}>
              {value[c.key] >= 100 ? value[c.key].toFixed(0) : value[c.key].toFixed(3)}
            </b>
          </span>
          <input
            type="range"
            style={range}
            min={c.min} max={c.max} step={c.step}
            value={value[c.key]}
            onChange={(e) => onChange({ ...value, [c.key]: +e.target.value })}
          />
        </label>
      ))}
    </div>
  );
}
