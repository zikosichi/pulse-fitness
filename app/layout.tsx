import type { Metadata, Viewport } from "next";
import { LangProvider } from "@/components/LangProvider";
import { config } from "@/lib/config";
import { HOURS } from "@/lib/content";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_TITLE,
  SITE_URL,
  SOCIAL_DESCRIPTION,
} from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: SITE_ORIGIN,
  applicationName: SITE_NAME,
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "სპორტდარბაზი წყალტუბოში",
    "ფიტნეს დარბაზი წყალტუბო",
    "Pulse Fitness",
    "პერსონალური მწვრთნელი",
    "ჯგუფური ვარჯიშები",
    "gym Tskaltubo",
    "fitness Tskaltubo",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "fitness",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: SITE_TITLE,
    description: SOCIAL_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "ka_GE",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SOCIAL_DESCRIPTION,
  },
  other: {
    "geo.region": "GE-IM",
    "geo.placename": "Tskaltubo",
    ...(config.coords
      ? { "geo.position": config.coords, ICBM: config.coords }
      : {}),
  },
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
  "@id": `${SITE_URL}/#gym`,
  name: SITE_NAME,
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  description: SITE_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    streetAddress: config.address.en,
    addressLocality: "Tskaltubo",
    addressRegion: "Imereti",
    addressCountry: "GE",
  },
  ...(Number.isFinite(lat) && Number.isFinite(lng)
    ? { geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng } }
    : {}),
  openingHours: `Mo-Su ${HOURS.replace(/\s/g, "").replace("–", "-")}`,
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "08:00",
    closes: "23:00",
  },
  priceRange: "₾₾",
  currenciesAccepted: "GEL",
  ...(config.mapUrl ? { hasMap: config.mapUrl } : {}),
  sameAs: [config.socials.instagram, config.socials.facebook].filter(Boolean),
  ...(config.phone ? { telephone: config.phone } : {}),
  ...(config.email ? { email: config.email } : {}),
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
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
