import { CheckoutError, validateRegistration } from "@/lib/presale/catalog";
import {
  configured,
  failure,
  hash,
  limited,
  noStore,
  readJson,
  sameOrigin,
  session,
} from "@/lib/presale/security";
import { checkout, register } from "@/lib/presale/orders";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if (!configured() || process.env.PRESALE_ENABLED !== "true")
      throw new CheckoutError("closed", 503);
    const owner = await session();
    await limited(`orders:${owner}`, 15, 3600);
    if (process.env.VERCEL)
      await limited(
        `ip:${hash(request.headers.get("x-vercel-forwarded-for") || "unknown")}`,
        40,
        3600,
      );
    const input = validateRegistration(await readJson(request));
    await limited(`phone:${hash(input.phone)}`, 20, 3600);
    const order = await checkout(await register(input, owner));
    if (order.status === "failed") throw new CheckoutError("failed", 409);
    const redirect =
      order.status === "paid" || order.status === "review"
        ? `/presale/confirmation?order=${order.id}&lang=${input.lang}`
        : order.checkout_url;
    if (!redirect) throw new Error("Checkout URL unavailable");
    return Response.json({ id: order.id, redirect }, { headers: noStore });
  } catch (error) {
    return failure(error);
  }
}
