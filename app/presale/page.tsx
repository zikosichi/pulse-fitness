import type { Metadata } from "next";
import Checkout from "@/components/presale/Checkout";
import { configured } from "@/lib/presale/security";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "წინასწარი შეძენა · Presale",
  alternates: { canonical: "/presale" },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const params = await searchParams;
  return (
    <Checkout
      initialPackage={params.package || "monthly"}
      enabled={configured() && process.env.PRESALE_ENABLED === "true"}
    />
  );
}
