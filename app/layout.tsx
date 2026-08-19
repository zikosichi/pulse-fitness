import type { Metadata, Viewport } from "next";
import { LangProvider } from "@/components/LangProvider";
import { config } from "@/lib/config";
import { HOURS } from "@/lib/content";
import "./globals.css";

const TITLE = "Pulse Fitness — წყალტუბოს პირველი სპორტდარბაზი";
const DESCRIPTION =
  "Pulse Fitness — წყალტუბოს პირველი სპორტდარბაზი. თანამედროვე აღჭურვილობა, ჯგუფური ვარჯიშები და პირადი მწვრთნელები. ყოველ დღე 08:00–23:00.";

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL to the real domain once it exists, so Open Graph
  // images resolve to absolute URLs.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description:
      "თანამედროვე აღჭურვილობა, ჯგუფური ვარჯიშები და პირადი მწვრთნელები. ყოველ დღე 08:00–23:00.",
    images: ["/brand/logo.png"],
    type: "website",
  },
  icons: { icon: "/brand/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#08120E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* Only fields we actually hold. The phone is deliberately absent rather
   than guessed — see lib/config.ts. */
const [lat, lng] = (config.coords ?? "").split(",").map((n) => Number(n.trim()));
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  name: "Pulse Fitness",
  description: DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    streetAddress: config.address.en,
    addressLocality: "Tskaltubo",
    addressCountry: "GE",
  },
  ...(Number.isFinite(lat) && Number.isFinite(lng)
    ? { geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng } }
    : {}),
  openingHours: `Mo-Su ${HOURS.replace(/\s/g, "")}`,
  ...(config.phone ? { telephone: config.phone } : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Georgian is the default; LangProvider updates these after mount.
    <html lang="ka" data-lang="ka">
      <head>
        <link
          rel="preload"
          href="/fonts/nsg-georgian.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
