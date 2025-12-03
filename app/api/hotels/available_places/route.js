import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Required for Vercel (prevents static build errors)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const country = searchParams.get("country") || "";

    const filePath = path.join(process.cwd(), "data", "Destination.json");
    const raw = await fs.readFile(filePath, "utf8");
    const destinations = JSON.parse(raw || "[]");

    // filter by country and q (city substring) if provided
    const filtered = destinations.filter((d) => {
      const matchesCountry = country ? String(d.country).toLowerCase() === country.toLowerCase() : true;
      const matchesQ = q ? String(d.city).toLowerCase().includes(q.toLowerCase()) : true;
      return matchesCountry && matchesQ;
    });

    // map to simple objects (optional)
    const cities = filtered.map((d) => ({ city: d.city, country: d.country, code: d.code }));

    return NextResponse.json({ success: true, data: cities });
  } catch (error) {
    console.error("available_places error:", error);
    return NextResponse.json({ success: false, message: "Failed to load destinations" }, { status: 500 });
  }
}
