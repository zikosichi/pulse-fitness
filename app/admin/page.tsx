import type { Metadata } from "next";
import Dashboard from "@/components/admin/Dashboard";
export const metadata: Metadata = {
  title: "Admin · Pulse Fitness",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
  alternates: { canonical: "/admin" },
};
export default function Page() { return <Dashboard />; }
