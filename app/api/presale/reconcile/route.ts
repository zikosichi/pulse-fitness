import { CheckoutError } from "@/lib/presale/catalog";
import { failure, matchesSecret, noStore } from "@/lib/presale/security";
import { reconcilePending } from "@/lib/presale/orders";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function GET(request: Request) {
  try {
    if (
      !matchesSecret(
        request.headers.get("authorization"),
        process.env.CRON_SECRET,
      )
    )
      throw new CheckoutError("forbidden", 401);
    const result = await reconcilePending();
    return Response.json(result, {
      status: result.errors || result.emails.errors || result.emails.review ? 503 : 200,
      headers: noStore,
    });
  } catch (error) {
    return failure(error);
  }
}
