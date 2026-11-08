import { NextRequest, NextResponse } from "next/server";
import { verifyDeveloperAccess } from "../../../../lib/dev/auth";
import { getAuditLogs, clearAuditLogs } from "../../../../lib/dev/audit";

export async function GET(req: NextRequest) {
  const session = await verifyDeveloperAccess(req);
  if (!session.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const status = searchParams.get("status") || "all";

  const logs = getAuditLogs(limit, status);
  return NextResponse.json({ logs });
}

export async function DELETE(req: NextRequest) {
  const session = await verifyDeveloperAccess(req);
  if (!session.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  clearAuditLogs(session.email || session.developerId || "founder");
  return NextResponse.json({ success: true, message: "Audit logs purged." });
}
