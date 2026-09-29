import { CheckoutError } from "@/lib/presale/catalog";
import { failure, limited, noStore, session } from "@/lib/presale/security";
import { findOrder, publicOrder, reconcile } from "@/lib/presale/orders";
import { after } from "next/server";
import { safelySendPendingEmails } from "@/lib/presale/emails";
export const runtime = "nodejs";
export const maxDuration = 180;
export async function GET(request: Request) {
  try {
    const owner = await session();
    await limited(`status:${owner}`, 90, 60);
    const id = new URL(request.url).searchParams.get("order") || "";
    if (!/^PF-[A-F0-9]{20}$/.test(id))
      throw new CheckoutError("not_found", 404);
    let order = await findOrder(id, owner);
    if (!order) throw new CheckoutError("not_found", 404);
    if (order.status === "pending" && order.bank_order_id) {
      try {
        order = await reconcile(order.id);
      } catch {
        return Response.json(
          { ...publicOrder(order), delayed: true },
          { headers: noStore },
        );
      }
    }
    if (order.status === "paid") after(() => safelySendPendingEmails(id));
    return Response.json(publicOrder(order), { headers: noStore });
  } catch (error) {
    return failure(error);
  }
}
