# Pulse Fitness — website

Next.js 16 (App Router, TypeScript, Turbopack). Single page, two languages.

```bash
npm install     # once
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

Design decisions: `../Brand & Identity/Visual Direction.md`
Content and layout decisions: `../Wireframes & Mockups/Structure Spec — Single Page.md`

> Supersedes `../Website Code/` (the old Lovable build) and `../Site/` (the
> static HTML version this was ported from). Neither is a reference.

## Where things are

```
app/globals.css      the whole design system — tokens, then components
lib/content.ts       ALL copy, both languages, one file
lib/config.ts        phone / address / map / socials — the missing details
components/          one file per section
public/              images and self-hosted fonts
```

## Structure comes from Paper

Section order and every layout follow the Paper artboard
**"Pulse Fitness — Dark / Gloss"**
(`app.paper.design/file/01M052R41ZNJ315A838NNPNJ4D/6-0/7U0-0`) — including its
104px section padding, 80px gutters and 1440px frame.

Values in `globals.css` were taken from that artboard's computed styles via the
Paper MCP tools (`get_jsx`, `get_computed_styles`), **not** read off screenshots.
If you need to change a colour or a size, go back to the artboard rather than
sampling a PNG.

```
Nav (floating pill, fixed)
01 Hero          full-bleed plate · wordmark · readout strip
02 Proof         one card straddling the seam between the two grounds
03 About         Tskaltubo
04 Venue         3-slide carousel, active + peek
05 Trainers      4 cards, expandable bios
06 Offer         numbered 01–04
07 Classes       6 tiles
   Divider       the pulse line
08 Membership    3 plans + full price table
   Ribbons       two crossed marquee bands
09 Contact       address · hours · phone · map
Footer + ghost wordmark
```

### The page is dark end to end

This replaces the earlier dark-cover / warm-light-body / dark-close scheme.
There is no light section any more. Rhythm comes from alternating two dark
grounds, `--ink` (`#08120E`) and `--ink-2` (`#0C1813`), with `--ink-deep`
(`#050C09`) under the footer. All three carry a green cast — they are the room,
not neutral black.

`../Brand & Identity/Visual Direction.md` still describes the light-body
scheme in its body text; it carries a note at the top saying so. Its palette
reasoning, its green (`#3DC26C`, sampled from the logo and confirmed on the
physical membership cards) and its pulse-motif rules all still hold.

**No eyebrow labels.** Paper had them ("— THE STORY", "— WHAT WE OFFER"); they
were dropped at the client's request. Do not reintroduce them.

### Where this deliberately departs from Paper

| Paper | Here | Why |
|---|---|---|
| 40+ classes / week, 100% community energy | 6 group classes, 15 hours every day | Only figures we can stand behind |
| "Free InBody scan", "2 guest passes" | real plan features | We cannot promise services the gym has not confirmed |
| Invented address / phone / email | visible placeholders | Paper placeholders, not the gym's details |
| `+` expander on all four trainer cards | only where a bio exists | Mano has nothing on file and Bela has no personal bio; a button that opens nothing is worse than no button |
| Carousel is a static frame | real carousel, arrows + dots + swipe | It is drawn as one state of an interaction |
| Ribbons are a static frame | slow marquee, opposite directions | Same |

## No Tailwind — on purpose

The palette and type scale are already a small token system derived from the
brand, and this is one page. Plain CSS with custom properties keeps the design
readable in one file instead of scattering it through class strings. Say the
word if you'd rather have Tailwind; it is a mechanical change while the site is
this size.

## Fill in the missing details

`lib/config.ts`. Set one value and the whole page picks it up.

Currently **real**: address, Plus Code, coordinates, map. The map link is
derived from the coordinates rather than stored separately, so the button and
the printed numbers cannot drift apart.

Still `null`, rendering as **visible dashed placeholders**: phone and social
handles. Deliberate — nothing is silently missing and nothing is silently
invented. Call buttons fall back to scrolling to the contact section until a
real number exists, so they are never dead.

### The map

**OpenStreetMap**, not Google: the embed needs no API key, no billing account
and no consent banner. Set `mapEmbed` to a Google embed URL instead and the
panel picks it up unchanged; clear it and the panel falls back to a static
pin card.

OSM ships light tiles, so they are inverted and hue-rotated into the page's
register. The OSM attribution in the corner is a licence condition — leave it.

The embed scroll-zooms on the wheel, which would trap the page scroll halfway
down a one-pager, so the iframe is `pointer-events: none` behind a veil until
someone taps it. The veil doubles as the address card.

## Language

Georgian is the default and what gets prerendered. `?lang=en` forces English
and is shareable; the choice is remembered in `localStorage`.

`LangProvider` uses `useSyncExternalStore` rather than an effect, so the
server can render Georgian and the client correct itself with no hydration
mismatch.

**Georgian typography note:** `text-transform: uppercase` does *not* convert
Mkhedruli to Mtavruli — verified in Chrome, the output is byte-identical. Small
labels therefore use letter-spacing rather than caps. The font does carry
Mtavruli glyphs (U+1C90–) if a caps treatment is ever wanted; they must be
written literally.

Section headings are Noto Sans Georgian at weight 800 in Georgian. English
falls through to Oswald, whose variable range stops at 700 — so `--head-w`
steps 800 → 700 under `html[data-lang="en"]` rather than letting the browser
synthesise a bold.

## Fonts

Self-hosted in `public/fonts/`, no Google Fonts request at runtime: Oswald
(display), Inter (body), Noto Sans Georgian (Georgian, both roles), and ALK
Katerina — used for exactly one word, the town name on the About card.

Katerina came from typeface.ge and carries no licence metadata in the file.
Worth confirming its terms before launch, since this is a commercial site.

Declared as plain `@font-face` rather than `next/font`, because the subsets need
**different `unicode-range` values** and `next/font/local` cannot express that
per file.

Neither Oswald nor Inter has Georgian glyphs, so both stacks fall through
per-glyph to NSG. `nsg-latin.woff2` is declared but currently unreached — it
only loads if a stack names NSG ahead of Inter/Oswald, which nothing does. It
is kept so Latin words inside Georgian copy can be matched to NSG later if
that is ever wanted.

## Images

All imagery came out of the Paper artboard (pulled from its fill URLs, then
resized and re-encoded), except the boxing-zone venue slide, which came from
`../Assets/venue-concepts/`, and the town photograph, which was exported clean
from Figma.

### The town card

`public/space/tskaltubo-city.jpg` is a plain photograph — the town name is
**live text**, set in ALK Katerina (`public/fonts/katerina.woff2`, subset to
Georgian + Latin, 4.8 KB). It used to be baked into the raster, which meant it
could not translate, could not be selected, and went soft at any size other
than the export's.

`.about__media` is a **container**, so the word is sized in `cqw` and holds
the same 88% of the card at every screen width — 347px card on a phone, 730px
on desktop, same proportion. The two constants in `--city-w` were measured
from the font's own advance widths, not guessed; **if either string in
`about.place` changes, re-measure**, because the value is per-string.

> Watch out when swapping the photo: Next's image optimiser caches per
> `Accept` header, so a stale WebP can survive while the JPEG path looks
> fine. `rm -rf .next/dev/cache` (not `.next/cache`) and restart.

**One honesty problem worth knowing about before this goes live:**

1. **The venue and class photographs are AI concept renders**, not the real
   gym. The venue slides carry a "ვიზუალიზაცია" tag saying so — do not remove
   it until real photography exists. **The six class tiles carry no such
   label** and read as real classes with real members. That is how the artboard
   was signed off, but it is a live decision, not an oversight.

Trainer portraits are the client's own gym shoot — one session, one lighting
setup, in the finished gym. Graded in colour, not mono: desaturate to ~82%,
shadows toward ink, gentle contrast stretch.

**The hero photograph is the resolution ceiling of the whole page.** Paper only
holds it at 1536×1024, so it is resampled to 2048 with Lanczos and a light
unsharp — better than leaving the browser to upscale it — and `.hero__stage`
refuses to draw it wider than `--plate-max` (1800px). Past that the surplus is
ink, and a long horizontal mask feathers the photo out so the boundary is
never an edge. Raise `--plate-max` only if a genuinely larger source turns up.

`public/` still contains ~12 MB of images from the previous light build
(`*-duo.jpg`, `*-full.jpg`, `*-gym*.png`, `room-*.jpg`, `hero-room.jpg`,
`cards.jpg`, `wristband.jpg`, `lasha-cert-*.jpg`). Nothing references them and
everything in `public/` ships to the CDN, so they are dead weight — but some
exist nowhere else, so they have been left in place rather than deleted.

## Still needs a person

Marked `draft: true` in `lib/content.ts` — written to keep the page
presentable, **not** supplied by the gym:

- The hero sentence
- Class descriptions for **Pilates, Boxing, Kickboxing** (Aerobics, Cardio
  Kickboxing and Kali-Libido Flow are Bela's own words)
- All English translations, including both trainer bios

Genuinely missing, showing as placeholders:

- Phone number, map embed, social handles
- A bio for **Mano Kutateladze** and **Bela Salukvadze**
- Real photography for the gym floor and the classes

## Deploy

Vercel. Framework preset Next.js, no extra configuration. Set
`NEXT_PUBLIC_SITE_URL` to the real domain so Open Graph images resolve.
