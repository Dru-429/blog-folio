import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch(
      "https://github-contributions-api.jogruber.de/v4/Dru-429?y=last"
    );
    if (!res.ok) return NextResponse.json({ total: 0, contributions: [] });

    const json = await res.json();
    return NextResponse.json({
      total: json.total.lastYear,
      contributions: json.contributions,
    });
  } catch {
    return NextResponse.json({ total: 0, contributions: [] });
  }
}