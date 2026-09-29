import { CheckoutError } from "@/lib/presale/catalog";
import { checkout, findOrder, reconcile } from "@/lib/presale/orders";
import {
  failure,
  limited,
  noStore,
  readJson,
  sameOrigin,
  session,
} from "@/lib/presale/security";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const owner = await session();
    await limited(`resume:${owner}`, 15, 3600);
    const { id } = await readJson(request);
    if (typeof id !== "string" || !/^PF-[A-F0-9]{20}$/.test(id))
      throw new CheckoutError("not_found", 404);
    let order = await findOrder(id, owner);
    if (!order) throw new CheckoutError("not_found", 404);
    if (!order.bank_order_id && process.env.PRESALE_ENABLED !== "true")
      throw new CheckoutError("closed", 503);
    order = await checkout(order);
    if (order.bank_order_id) order = await reconcile(id, undefined, true);
    if (order.status !== "pending" || !order.checkout_url)
      throw new CheckoutError("not_pending", 409);
    return Response.json(
      { redirect: order.checkout_url },
      { headers: noStore },
    );
  } catch (error) {
    return failure(error);
  }
}
