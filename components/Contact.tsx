"use client";

import { useLang } from "./LangProvider";
import { CallButton, MapButton, Tbd } from "./bits";
import { config, mapLink } from "@/lib/config";
import { contact, ui } from "@/lib/content";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.25" />
      <circle className="social-icon__dot" cx="17.4" cy="6.7" r="1" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.6 21v-8h2.8l.42-3.2H13.6V7.75c0-.93.27-1.56 1.62-1.56h1.73V3.33c-.3-.04-1.33-.13-2.53-.13-2.5 0-4.22 1.52-4.22 4.33V9.8H7.37V13h2.83v8h3.4Z" />
    </svg>
  );
}

/* Where the decision gets made. Phone, address and hours are plain DOM and
   never depend on a script — if everything else fails this still works.

   The section takes tabIndex -1 so focus can follow a script-driven jump here
   — the trainer panel's booking button — without joining the tab order. */
export default function Contact() {
  const { t, lang } = useLang();
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
              {config.email && (
                <div className="contact__field">
                  <dt>{t(ui.email)}</dt>
                  <dd>
                    <a href={`mailto:${config.email}`}>{config.email}</a>
                  </dd>
                </div>
              )}
            </div>
          </dl>

          <div className="contact__actions">
            <CallButton size="lg" label={contact.cta} directCall />
            <MapButton label={ui.openMaps} />
          </div>

          {(config.socials.instagram || config.socials.facebook) && (
            <div className="contact__socials" aria-label="Social media">
              {config.socials.instagram && (
                <a
                  className="contact__social contact__social--instagram"
                  href={config.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pulse Fitness on Instagram — @pulse.fitness_26"
                >
                  <InstagramIcon />
                </a>
              )}
              {config.socials.facebook && (
                <a
                  className="contact__social contact__social--facebook"
                  href={config.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pulse Fitness on Facebook"
                >
                  <FacebookIcon />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="contact__map">
          {config.mapEmbed ? (
            <iframe
              src={config.mapEmbed}
              title={t(contact.title)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
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
