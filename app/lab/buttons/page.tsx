import type { Metadata } from "next";
import ButtonLab from "@/components/lab/buttons/ButtonLab";

/* Not part of the site. A rig for arguing about button treatments before one
   of them becomes the CTA — sibling to /lab, which tunes the pulse line.
   Keep it out of search results. */
export const metadata: Metadata = {
  title: "Button lab",
  robots: { index: false, follow: false },
};

export default function ButtonLabPage() {
  return <ButtonLab />;
}
