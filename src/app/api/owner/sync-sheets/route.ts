import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { webhookUrl, records } = body;

    const targetUrl =
      (typeof webhookUrl === "string" && webhookUrl.trim()) ||
      process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      "https://script.google.com/macros/s/AKfycbxkzev3KbzN6xxVSl1DLORA4cGVXbO6IfgFCrv3jCf74RoCJg-vCfmSICDnpB-2NKh_/exec";

    if (!targetUrl) {
      return NextResponse.json(
        { error: "Google Sheets Webhook URL is required. Please configure your Google Sheet URL." },
        { status: 400 }
      );
    }

    if (!records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: "Records array is required." },
        { status: 400 }
      );
    }

    // Clean webhook URL
    const cleanUrl = targetUrl.trim();

    // Call Google Apps Script Webhook (Node fetch will follow 302 redirects automatically)
    const googleRes = await fetch(cleanUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({ records }),
      redirect: "follow",
    });

    const responseText = await googleRes.text();

    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch {
      // If response is not JSON
      if (googleRes.ok) {
        return NextResponse.json({
          success: true,
          added: records.length,
          skipped: 0,
          message: "Data sent to Google Sheet successfully.",
        });
      }
      return NextResponse.json(
        { error: `Google Sheets responded with: ${responseText.slice(0, 200)}` },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error("Google Sheets sync error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to sync with Google Sheet webhook" },
      { status: 500 }
    );
  }
}
