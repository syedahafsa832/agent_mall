import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query, queryOne } from "@/server/db/pool";
import { requireAuthenticatedUser, UnauthorizedError } from "@/server/auth/session";
import { getMerchantById } from "@/server/merchants/repository";

const createSchema = z.object({ keyword: z.string().trim().min(1).max(80) });

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const keywords = await query(`select * from merchant_keywords where merchant_id = $1 order by created_at desc`, [params.id]);
  return NextResponse.json({ keywords });
}

/** Website owners can add keywords at will to help agents route relevant searches to their store. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuthenticatedUser(req);
    const merchant = await getMerchantById(params.id);
    if (!merchant || merchant.owner_id !== user.id) return NextResponse.json({ error: "You do not own this merchant." }, { status: 403 });

    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

    const keyword = await queryOne(
      `insert into merchant_keywords (merchant_id, keyword) values ($1,$2)
       on conflict (merchant_id, keyword) do update set keyword = excluded.keyword
       returning *`,
      [params.id, parsed.data.keyword.toLowerCase()],
    );
    return NextResponse.json({ keyword }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
