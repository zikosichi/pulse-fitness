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
  email: string | null;
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
  email: "info@pulsefitness.ge",
  address: {
    ka: "წერეთლის ქუჩა 12, წყალტუბო",
    en: "12 Tsereteli Street, Tskaltubo",
  },
  plusCode: null,
  coords: "42.3304111, 42.5992429",
  // Google Maps embed centred on the coordinates resolved from the verified
  // public Maps pin. This query-style embed needs no API key.
  mapEmbed:
    "https://www.google.com/maps?q=42.3304111%2C42.5992429&z=17&output=embed",
  mapUrl: "https://maps.app.goo.gl/iCnv4gXxJFtVmrLi8",
  socials: {
    instagram:
      "https://www.instagram.com/pulse.fitness_26?igsi=MXVuNXQ4NWtwNzFzNg%3D%3D&utm_source=qr",
    facebook:
      "https://www.facebook.com/profile.php?id=61593707241959&mibextid=wwXIfr&rdid=SncgPeYFY01NDDqM&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1bvGP7CxHV%2F%3Fmibextid%3DwwXIfr#",
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
