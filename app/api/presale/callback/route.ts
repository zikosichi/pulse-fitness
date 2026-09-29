import { CheckoutError } from "@/lib/presale/catalog";
import { validSignature } from "@/lib/presale/bog";
import { reconcile } from "@/lib/presale/orders";
import { failure, noStore, readBody } from "@/lib/presale/security";
import { after } from "next/server";
import { safelySendPendingEmails } from "@/lib/presale/emails";
export const runtime = "nodejs";
export const maxDuration = 180;
export async function POST(request: Request) {
  try {
    const raw = await readBody(request, 65536);
    if (!validSignature(raw, request.headers.get("callback-signature")))
      throw new CheckoutError("signature", 401);
    const event = JSON.parse(raw);
    if (
      event.event !== "order_payment" ||
      !/^PF-[A-F0-9]{20}$/.test(event.body?.external_order_id) ||
      typeof event.body?.order_id !== "string" ||
      event.body.order_id.length > 100
    )
      throw new CheckoutError("invalid");
    const order = await reconcile(event.body.external_order_id, event.body.order_id, true);
    if (order.status === "paid") after(() => safelySendPendingEmails(order.id));
    return Response.json({ ok: true }, { headers: noStore });
  } catch (error) {
    return failure(error);
  }
}
