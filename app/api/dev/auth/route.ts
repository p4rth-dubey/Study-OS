import { NextRequest, NextResponse } from "next/server";
import { verifyDeveloperAccess, validateMasterKey } from "../../../../lib/dev/auth";

export async function GET(req: NextRequest) {
  const session = await verifyDeveloperAccess(req);
  if (!session.authorized) {
    return NextResponse.json({ authorized: false, error: "Forbidden: Developer authorization required." }, { status: 403 });
  }
  return NextResponse.json(session);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const key = body.key as string;

    if (!validateMasterKey(key)) {
      return NextResponse.json({ success: false, error: "Invalid developer credential" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, message: "Developer God Mode unlocked" });
    res.cookies.set("studyos_dev_session", key, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return res;
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 400 });
  }
}
