import type { Metadata } from "next";
import PulseLab from "@/components/lab/PulseLab";

/* Not part of the site. A rig for tuning the electric pulse line before any
   of it goes near the hero — keep it out of search results. */
export const metadata: Metadata = {
  title: "Pulse line lab",
  robots: { index: false, follow: false },
};

export default function LabPage() {
  return <PulseLab />;
}
