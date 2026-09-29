import { pool } from "@/lib/presale/db";
import {
  configured,
  failure,
  noStore,
  sameOrigin,
  session,
} from "@/lib/presale/security";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const owner = await session(true);
    const recent = configured()
      ? (
          await pool().query(
            "SELECT id,status FROM presale_orders WHERE session_hash=$1 AND status <> 'failed' ORDER BY created_at DESC LIMIT 1",
            [owner],
          )
        ).rows[0]
      : null;
    return Response.json(
      { ok: true, recent: recent || null },
      { headers: noStore },
    );
  } catch (error) {
    return failure(error);
  }
}
