export const SITE_NAME = "Pulse Fitness";
export const SITE_TITLE = "Pulse Fitness — წყალტუბოს პირველი სპორტდარბაზი";
export const SITE_DESCRIPTION =
  "Pulse Fitness — წყალტუბოს პირველი სპორტდარბაზი. თანამედროვე აღჭურვილობა, ჯგუფური ვარჯიშები და პირადი მწვრთნელები. ყოველ დღე 08:00–23:00.";
export const SOCIAL_DESCRIPTION =
  "თანამედროვე სივრცე, პროფესიონალი მწვრთნელები და შენზე მორგებული ვარჯიში — აქვე, წყალტუბოში.";
export const SOCIAL_IMAGE_ALT =
  "Pulse Fitness-ის თანამედროვე სავარჯიშო სივრცე წყალტუბოში";

// The production domain is inferred from the verified business email. Set the
// environment variable if deployment uses a different canonical hostname.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pulsefitness.ge"
).replace(/\/+$/, "");

export const SITE_ORIGIN = new URL(SITE_URL);
