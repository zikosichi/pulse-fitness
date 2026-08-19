"use client";

import Image from "next/image";
import { useLang } from "./LangProvider";
import { footer, nav } from "@/lib/content";

export default function Footer() {
  const { t } = useLang();

  return (
    <>
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__top">
            <div className="footer__brand">
              <a href="#top" aria-label="Pulse Fitness">
                <Image
                  src="/brand/logo.png"
                  alt="Pulse Fitness"
                  width={124}
                  height={47}
                />
              </a>
              <p>{t(footer.tagline)}</p>
            </div>

            <nav className="footer__links" aria-label={t(footer.tagline)}>
              {nav.map((n) => (
                <a key={n.href} href={n.href}>
                  {t(n.label)}
                </a>
              ))}
            </nav>
          </div>

          <span className="footer__rule" aria-hidden="true" />

          <div className="footer__bottom">
            <span>© {new Date().getFullYear()} Pulse Fitness</span>
            <span>{t(footer.place)}</span>
          </div>
        </div>
      </footer>

      {/* Oversized wordmark, cropped by its own container. Decorative. */}
      <div className="ghost" aria-hidden="true">
        <span>PULSE FITNESS</span>
      </div>
    </>
  );
}
