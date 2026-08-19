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
  socials: { instagram: string | null; facebook: string | null };
};

export const config: SiteConfig = {
  phone: null,
  phoneDisplay: null,
  address: {
    ka: "ლორთქიფანიძის ქუჩა, წყალტუბო",
    en: "Lortkipanidze St, Tskaltubo",
  },
  plusCode: "8HPW+HP3",
  coords: "42.33648, 42.59676",
  // OpenStreetMap rather than Google: no API key, no billing account, no
  // consent banner. The bbox is ~1.2km across, framed on the marker.
  // Swap in a Google embed URL here later and the panel picks it up.
  mapEmbed:
    "https://www.openstreetmap.org/export/embed.html?bbox=42.5907%2C42.3332%2C42.6028%2C42.3398&layer=mapnik&marker=42.33648%2C42.59676",
  socials: {
    instagram: null,
    facebook: null,
  },
};

/** tel: href, or null when there is no number yet. */
export const telHref = config.phone
  ? `tel:${config.phone.replace(/[^\d+]/g, "")}`
  : null;

/** Built from the coordinates above rather than stored separately, so the
    button and the printed coordinates can never drift apart. */
export const mapLink = config.coords
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.coords.replace(/\s/g, ""))}`
  : null;
