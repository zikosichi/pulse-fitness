import { CheckoutError } from "@/lib/presale/catalog";
import { adminCookie, createAdminSession, revokeAdminSession, setAdminCookie, verifyAdminCredentials } from "@/lib/presale/admin-auth";
import { failure, hash, limited, noStore, readJson, sameOrigin } from "@/lib/presale/security";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const ip = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for") || "unknown" : "local";
    await limited(`admin-login:${hash(ip)}`, 10, 900);
    const input = await readJson(request, 2048);
    if (!input || !verifyAdminCredentials(input.username, input.password)) throw new CheckoutError("credentials", 401);
    await revokeAdminSession(await adminCookie());
    await setAdminCookie(await createAdminSession());
    return Response.json({ ok: true }, { headers: noStore });
  } catch (error) { return failure(error); }
}
