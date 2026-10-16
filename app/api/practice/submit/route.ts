import { NextResponse } from "next/server";
import { evaluateTestAttempt } from "../../../../lib/practice/evaluator";
import type { TestPaper, TestAttemptState } from "../../../../lib/practice/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { paper: TestPaper; attempt: TestAttemptState };
    if (!body.paper || !body.attempt) {
      return NextResponse.json({ error: "Missing paper or attempt payload" }, { status: 400 });
    }

    const result = evaluateTestAttempt(body.paper, body.attempt);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
