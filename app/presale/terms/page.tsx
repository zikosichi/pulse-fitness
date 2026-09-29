import type { Metadata } from "next";
import Policy from "@/components/presale/Policy";
export const metadata: Metadata = {
  title: "შეძენის პირობები · Purchase terms",
  alternates: { canonical: "/presale/terms" },
};
export default function Page() {
  return <Policy />;
}
