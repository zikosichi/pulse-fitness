/* =========================================================================
   The ONE place to fill in real-world details.

   Anything left `null` renders on the page as a visible dashed placeholder,
   so nothing is silently missing and nothing is silently invented.
   Fill a value in and the whole page picks it up.
   ========================================================================= */

export type SiteConfig = {
  /** Digits only, international format. e.g. "+995555123456" */
  phone: string | null;
  /** How it should read on screen. e.g. "+995 555 12 34 56" */
  phoneDisplay: string | null;
  address: { ka: string | null; en: string | null };
  /** Google Maps Plus Code, e.g. "8HPW+HP3" */
  plusCode: string | null;
  /** "lat, lng" as it should read on screen */
  coords: string | null;
  /** Google Maps → Share → Embed a map → the src URL */
  mapEmbed: string | null;
  /** Verified public Google Maps share link */
  mapUrl: string | null;
  socials: { instagram: string | null; facebook: string | null };
};

export const config: SiteConfig = {
  phone: "+995598294373",
  phoneDisplay: "+995 598 29 43 73",
  address: {
    ka: "წერეთლის ქუჩა 12, წყალტუბო",
    en: "12 Tsereteli Street, Tskaltubo",
  },
  plusCode: null,
  coords: "42.3284756, 42.6004137",
  // Google Maps embed centred on the coordinates resolved from the verified
  // public Maps pin. This query-style embed needs no API key.
  mapEmbed:
    "https://www.google.com/maps?q=42.3284756%2C42.6004137&z=17&output=embed",
  mapUrl: "https://maps.app.goo.gl/hw5MeYuzCxYuF5hQ9",
  socials: {
    instagram: null,
    facebook: null,
  },
};

/** tel: href, or null when there is no number yet. */
export const telHref = config.phone
  ? `tel:${config.phone.replace(/[^\d+]/g, "")}`
  : null;

/** Prefer the verified public pin; coordinates keep the link functional if
    the share URL is ever removed. */
export const mapLink =
  config.mapUrl ??
  (config.coords
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.coords.replace(/\s/g, ""))}`
    : null);
