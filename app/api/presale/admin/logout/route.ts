import { adminCookie, revokeAdminSession, setAdminCookie } from "@/lib/presale/admin-auth";
import { failure, noStore, sameOrigin } from "@/lib/presale/security";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await revokeAdminSession(await adminCookie());
    await setAdminCookie("");
    return Response.json({ ok: true }, { headers: noStore });
  } catch (error) { return failure(error); }
}
