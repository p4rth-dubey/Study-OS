import { NextRequest, NextResponse } from "next/server";
import { verifyDeveloperAccess } from "../../../../lib/dev/auth";
import { collectSystemMetrics } from "../../../../lib/dev/system";

export async function GET(req: NextRequest) {
  const session = await verifyDeveloperAccess(req);
  if (!session.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const metrics = await collectSystemMetrics();
    return NextResponse.json(metrics);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
