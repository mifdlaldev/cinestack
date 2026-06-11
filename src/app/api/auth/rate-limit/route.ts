import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS, getRateLimitIdentifier } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Email is required" } },
        { status: 400 },
      );
    }

    // Rate limit by email (to prevent brute force on specific accounts)
    const emailLimit = await applyRateLimit(request, {
      ...RATE_LIMITS.auth,
      identifier: `auth:email:${email.toLowerCase().trim()}`,
    });
    if (emailLimit) return emailLimit;

    // Rate limit by IP (to prevent distributed attacks)
    const ipLimit = await applyRateLimit(request, {
      ...RATE_LIMITS.auth,
      identifier: `auth:ip:${getRateLimitIdentifier(request)}`,
    });
    if (ipLimit) return ipLimit;

    return NextResponse.json({ allowed: true });
  } catch {
    // On error, allow the request to proceed (fail open)
    return NextResponse.json({ allowed: true });
  }
}
