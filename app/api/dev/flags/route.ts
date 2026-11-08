import { NextRequest, NextResponse } from "next/server";
import { verifyDeveloperAccess } from "../../../../lib/dev/auth";
import { getAllFeatureFlags, updateFeatureFlag } from "../../../../lib/dev/flags";
import type { FeatureFlagKey } from "../../../../lib/dev/types";

export async function GET(req: NextRequest) {
  const session = await verifyDeveloperAccess(req);
  if (!session.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return NextResponse.json({ flags: getAllFeatureFlags() });
}

export async function POST(req: NextRequest) {
  const session = await verifyDeveloperAccess(req);
  if (!session.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { key, enabled } = await req.json();
    if (!key || typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Invalid flag parameters" }, { status: 400 });
    }
    const updated = updateFeatureFlag(
      key as FeatureFlagKey,
      enabled,
      session.email || session.developerId || "founder"
    );
    return NextResponse.json({ success: true, flag: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
