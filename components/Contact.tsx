"use client";

import { useState } from "react";
import { useLang } from "./LangProvider";
import { CallButton, MapButton, Tbd } from "./bits";
import { config, mapLink } from "@/lib/config";
import { contact, ui } from "@/lib/content";

/* Where the decision gets made. Phone, address and hours are plain DOM and
   never depend on a script — if everything else fails this still works.

   The section takes tabIndex -1 so focus can follow a script-driven jump here
   — the trainer panel's booking button — without joining the tab order. */
export default function Contact() {
  const { t, lang } = useLang();
  const [live, setLive] = useState(false);
  const address = config.address[lang];

  return (
    <section className="sec" id="contact" tabIndex={-1}>
      <div className="wrap contact">
        <div className="contact__copy">
          <h2>{t(contact.title)}</h2>

          <dl className="contact__fields">
            <div className="contact__field">
              <dt>{t(ui.address)}</dt>
              <dd>{address ?? <Tbd label={ui.addressPlaceholder} />}</dd>
              {config.plusCode && (
                <dd className="contact__pluscode">
                  <b>{config.plusCode}</b>
                  <i aria-hidden="true" />
                  <span>{t(ui.plusCode)}</span>
                </dd>
              )}
            </div>

            <div className="contact__pair">
              <div className="contact__field">
                <dt>{t(ui.hours)}</dt>
                <dd>{t(ui.everyDay)}</dd>
              </div>
              <div className="contact__field">
                <dt>{t(ui.phone)}</dt>
                <dd>
                  {config.phoneDisplay ? (
                    <a href={`tel:${config.phone}`}>{config.phoneDisplay}</a>
                  ) : (
                    <span className="contact__tel">{contact.phoneMask}</span>
                  )}
                </dd>
              </div>
            </div>
          </dl>

          <div className="contact__actions">
            <CallButton size="lg" label={contact.cta} />
            <MapButton label={ui.openMaps} />
          </div>

          {config.socials.instagram || config.socials.facebook ? (
            <div className="contact__actions">
              {config.socials.instagram && (
                <a href={config.socials.instagram} target="_blank" rel="noopener">
                  Instagram
                </a>
              )}
              {config.socials.facebook && (
                <a href={config.socials.facebook} target="_blank" rel="noopener">
                  Facebook
                </a>
              )}
            </div>
          ) : (
            <Tbd label={ui.socialsPlaceholder} />
          )}
        </div>

        <div className={`contact__map${live ? " is-live" : ""}`}>
          {config.mapEmbed ? (
            <>
              <iframe
                src={config.mapEmbed}
                title={t(contact.title)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* The embed scroll-zooms on wheel, which would trap the page
                  scroll halfway down a one-pager. It stays inert until it is
                  asked for. */}
              <button
                type="button"
                className="contact__veil"
                aria-label={t(ui.mapActivate)}
                onClick={() => setLive(true)}
                tabIndex={live ? -1 : 0}
              >
                <span className="contact__pin">
                  <i aria-hidden="true" />
                  <b>{address ?? t(ui.addressPlaceholder)}</b>
                  <span className="contact__coords">
                    <b>{config.plusCode}</b>
                    <i aria-hidden="true" />
                    <span>{config.coords}</span>
                  </span>
                  <span className="contact__mapnote">{t(ui.mapActivate)}</span>
                </span>
              </button>
            </>
          ) : (
            <a
              className="contact__pin"
              href={mapLink ?? "#contact"}
              {...(mapLink ? { target: "_blank", rel: "noopener" } : {})}
            >
              <i aria-hidden="true" />
              <b>{address ?? t(ui.addressPlaceholder)}</b>
              <span className="contact__coords">
                <b>{config.plusCode}</b>
                <i aria-hidden="true" />
                <span>{config.coords}</span>
              </span>
              <span className="contact__mapnote">{t(ui.mapPlaceholder)}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
