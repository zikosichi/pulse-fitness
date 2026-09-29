import { authorizeAdmin } from "@/lib/presale/admin-auth";
import { listPurchases } from "@/lib/presale/admin-data";
import { failure, limited, noStore, sameOrigin } from "@/lib/presale/security";
import { reconcilePending } from "@/lib/presale/orders";
import { toCsv } from "@/lib/presale/export";
import { emailConfigured } from "@/lib/presale/emails";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function GET(request: Request) {
  try {
    await authorizeAdmin(request);
    const url = new URL(request.url);
    const data = await listPurchases(url);
    if (url.searchParams.get("format") === "csv") return new Response(toCsv(data.rows), { headers: { ...noStore, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="pulse-presales.csv"' } });
    return Response.json({ ...data, emailEnabled: emailConfigured() }, { headers: noStore });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await authorizeAdmin(request);
    await limited("admin-reconcile", 6, 60);
    return Response.json(await reconcilePending(), { headers: noStore });
  } catch (error) { return failure(error); }
}
