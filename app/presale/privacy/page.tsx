import type { Metadata } from "next";
import Policy from "@/components/presale/Policy";
export const metadata: Metadata = {
  title: "კონფიდენციალურობა · Privacy",
  alternates: { canonical: "/presale/privacy" },
};
export default function Page() {
  return <Policy privacy />;
}
