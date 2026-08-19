"use client";

import type { MouseEventHandler } from "react";
import { useLang } from "./LangProvider";
import { mapLink, telHref } from "@/lib/config";
import { ui, type Bi } from "@/lib/content";

/* The ECG line from the logo, used as the nav's mark. It flatlines and
   spikes once — the same rule the section divider follows. */
export function PulseMark() {
  return (
    <svg
      className="nav__mark"
      width="30"
      height="26"
      viewBox="0 0 30 26"
      aria-hidden="true"
    >
      <path
        d="M1 14 H8 L10.5 17.5 L14.5 3 L18 24 L20.5 14 H29"
        fill="none"
        strokeWidth="2.2"
      />
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.7.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.7.1.4 0 .8-.2 1l-2.2 2.1Z" />
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

export function Check() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m4.5 12.5 5 5 10-11"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Arrows pushing out of the corners — the trainer card's "open me" mark. */
export function Expand() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"
        fill="none"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Close() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Arrow({ back }: { back?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d={back ? "M10 3 L5 8 L10 13" : "M6 3 L11 8 L6 13"}
        fill="none"
        strokeWidth={back ? 1.6 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A value the gym has not supplied yet. Visible on purpose. */
export function Tbd({ label }: { label: Bi }) {
  const { t } = useLang();
  return <span className="tbd">{t(label)}</span>;
}

/** Falls back to the contact section until a real number exists. */
export function CallButton({
  size = "md",
  variant = "pulse",
  icon = true,
  label,
  className,
  onClick,
}: {
  size?: "sm" | "md" | "lg";
  variant?: "pulse" | "outline";
  icon?: boolean;
  label?: Bi;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  const { t } = useLang();
  const mod = size === "sm" ? " btn--sm" : size === "lg" ? " btn--lg" : "";
  return (
    <a
      className={`btn btn--${variant}${mod}${className ? ` ${className}` : ""}`}
      href={telHref ?? "#contact"}
      onClick={onClick}
    >
      {icon && size !== "sm" && <PhoneIcon />}
      <span>{t(label ?? ui.call)}</span>
    </a>
  );
}

export function MapButton({ label }: { label: Bi }) {
  const { t } = useLang();
  return (
    <a
      className="btn btn--ghost btn--lg"
      href={mapLink ?? "#contact"}
      {...(mapLink ? { target: "_blank", rel: "noopener" } : {})}
    >
      <PinIcon />
      <span>{t(label)}</span>
    </a>
  );
}
