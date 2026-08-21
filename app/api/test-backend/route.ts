import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = "https://ecombeckend.saaszo.in/api/v1/catalog/products?per_page=24&sort=popular";
  try {
    const t0 = Date.now();
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 LittleDivinityStorefront/1.0",
        Referer: "https://www.littledivinity.com"
      },
      cache: "no-store"
    });
    const timeMs = Date.now() - t0;
    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      status: res.status,
      ok: res.ok,
      timeMs,
      itemCount: json?.data?.items?.length ?? null,
      rawPreview: text.slice(0, 300)
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || String(err),
      stack: err?.stack || null
    }, { status: 500 });
  }
}
