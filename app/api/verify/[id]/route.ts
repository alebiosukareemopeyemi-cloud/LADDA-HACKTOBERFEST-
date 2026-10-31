import { NextResponse } from "next/server";
import { signPayload } from "@/lib/credential/sign";
import { demoCredential } from "@/lib/credential/demo";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const found = demoCredential(id);
  if (!found) {
    return NextResponse.json(
      { ok: false, code: "VALIDATION", message: "Credential not found." },
      { status: 404 }
    );
  }
  try {
    const { signature, publicKey } = await signPayload(found.payload);
    return NextResponse.json({
      ok: true,
      data: {
        status: found.revoked ? "revoked" : "valid",
        payload: found.payload,
        signature,
        publicKey,
        summary: found.summary,
        summaryFallback: true,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, code: "VALIDATION", message: "Could not sign this credential." },
      { status: 500 }
    );
  }
}