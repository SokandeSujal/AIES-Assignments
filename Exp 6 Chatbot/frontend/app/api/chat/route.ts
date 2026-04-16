import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  const { mode, payload } = await request.json();
  const endpoint =
    mode === "avatar" ? "avatar" : mode === "arena" ? "arena" : "ask";

  const response = await fetch(`${backendBaseUrl}/api/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : "The backend request failed.";
    return NextResponse.json({ detail }, { status: response.status });
  }

  return NextResponse.json(data);
}
