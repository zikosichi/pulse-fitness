import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SOCIAL_IMAGE_ALT } from "@/lib/seo";

export const alt = SOCIAL_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const [background, logo, georgianFont, latinFont] = await Promise.all([
  readFile(join(process.cwd(), "public/social/og-gym-background-v1.png")),
  readFile(join(process.cwd(), "public/brand/logo.png")),
  readFile(join(process.cwd(), "public/fonts/nsg-georgian-social-bold.ttf")),
  readFile(join(process.cwd(), "public/fonts/inter-social-bold.ttf")),
]);

const backgroundSrc = `data:image/png;base64,${background.toString("base64")}`;
const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#050C09",
          color: "#F5F8F6",
          fontFamily: "NSG",
        }}
      >
        <img
          src={backgroundSrc}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(90deg, rgba(5,12,9,0.99) 0%, rgba(5,12,9,0.95) 35%, rgba(5,12,9,0.40) 60%, rgba(5,12,9,0.05) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            display: "flex",
            width: 9,
            height: "100%",
            background: "#3DC26C",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 650,
            height: "100%",
            padding: "60px 0 54px 72px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <img
              src={logoSrc}
              alt="Pulse Fitness"
              width={330}
              height={124}
              style={{ objectFit: "contain" }}
            />

            <div
              style={{
                display: "flex",
                width: 76,
                height: 5,
                marginTop: 28,
                background: "#3DC26C",
                borderRadius: 99,
              }}
            />

            <div
              style={{
                display: "flex",
                width: 560,
                marginTop: 24,
                fontSize: 47,
                fontWeight: 700,
                lineHeight: 1.16,
                letterSpacing: -1.4,
              }}
            >
              წყალტუბოს პირველი სპორტდარბაზი
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: 530,
                marginTop: 16,
                color: "#B7C4BE",
                fontSize: 23,
                lineHeight: 1.35,
              }}
            >
              <div style={{ display: "flex" }}>თანამედროვე სივრცე</div>
              <div style={{ display: "flex" }}>პროფესიონალი მწვრთნელები</div>
              <div style={{ display: "flex", color: "#DDF6E5" }}>
                შენი ტემპი
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 46,
                padding: "0 20px",
                border: "1px solid rgba(255,255,255,0.20)",
                borderRadius: 999,
                background: "rgba(255,255,255,0.07)",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              <div style={{ display: "flex" }}>ყოველდღე</div>
              <div
                style={{
                  display: "flex",
                  width: 4,
                  height: 4,
                  margin: "0 12px",
                  borderRadius: 99,
                  background: "#3DC26C",
                }}
              />
              <div style={{ display: "flex", fontFamily: "Inter" }}>
                08:00–23:00
              </div>
            </div>
            <div
              style={{
                display: "flex",
                marginLeft: 20,
                color: "#3DC26C",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              წყალტუბო
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 42,
            top: 38,
            display: "flex",
            alignItems: "center",
            height: 38,
            padding: "0 16px",
            border: "1px solid rgba(61,194,108,0.48)",
            borderRadius: 999,
            background: "rgba(5,12,9,0.62)",
            color: "#DDF6E5",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 0.4,
          }}
        >
          <div style={{ display: "flex" }}>შენი ქალაქი</div>
          <div
            style={{
              display: "flex",
              width: 4,
              height: 4,
              margin: "0 10px",
              borderRadius: 99,
              background: "#3DC26C",
            }}
          />
          <div style={{ display: "flex" }}>შენი დარბაზი</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "NSG",
          data: georgianFont,
          style: "normal",
          weight: 700,
        },
        {
          name: "Inter",
          data: latinFont,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
