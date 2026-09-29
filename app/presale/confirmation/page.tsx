import type { Metadata } from "next";
import Confirmation from "@/components/presale/Confirmation";
export const metadata: Metadata = {
  title: "გადახდის სტატუსი · Payment status",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
  alternates: { canonical: "/presale/confirmation" },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <Confirmation id={/^PF-[A-F0-9]{20}$/.test(order || "") ? order! : ""} />
  );
}
