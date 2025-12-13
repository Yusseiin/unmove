import { NextRequest, NextResponse } from "next/server";
import { searchTVDB } from "@/lib/tvdb";
import type { TVDBSearchRequest, TVDBApiResponse, TVDBSearchResult } from "@/types/tvdb";

export async function POST(request: NextRequest) {
  try {
    const body: TVDBSearchRequest = await request.json();
    const { query, type, lang } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json<TVDBApiResponse<null>>(
        { success: false, error: "Search query is required" },
        { status: 400 }
      );
    }

    if (type && type !== "series" && type !== "movie") {
      return NextResponse.json<TVDBApiResponse<null>>(
        { success: false, error: "Type must be 'series' or 'movie'" },
        { status: 400 }
      );
    }

    const results = await searchTVDB(query.trim(), type, lang);

    // Filter to only series and movies (exclude person, company)
    const filteredResults = results.filter(
      (r) => r.type === "series" || r.type === "movie"
    );

    return NextResponse.json<TVDBApiResponse<TVDBSearchResult[]>>({
      success: true,
      data: filteredResults,
    });
  } catch (error) {
    console.error("TVDB search error:", error);
    return NextResponse.json<TVDBApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to search TVDB",
      },
      { status: 500 }
    );
  }
}
