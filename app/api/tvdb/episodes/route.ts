import { NextRequest, NextResponse } from "next/server";
import { getSeriesEpisodes, fetchItalianTranslations, fetchEnglishTranslations, fetchGermanTranslations } from "@/lib/tvdb";
import type { TVDBApiResponse, TVDBEpisode } from "@/types/tvdb";
import type { EpisodeOrder } from "@/types/config";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const seriesId = searchParams.get("seriesId");
    const seasonParam = searchParams.get("season");
    const lang = searchParams.get("lang"); // Optional: "it" for Italian, "de" for German
    const orderParam = searchParams.get("order"); // Optional: "default" (Aired), "official" (DVD), "absolute"

    if (!seriesId) {
      return NextResponse.json<TVDBApiResponse<null>>(
        { success: false, error: "seriesId is required" },
        { status: 400 }
      );
    }

    const season = seasonParam ? parseInt(seasonParam, 10) : undefined;

    if (seasonParam && isNaN(season!)) {
      return NextResponse.json<TVDBApiResponse<null>>(
        { success: false, error: "season must be a number" },
        { status: 400 }
      );
    }

    // Validate episode order parameter
    const validOrders: EpisodeOrder[] = ["default", "official", "absolute"];
    const order: EpisodeOrder = validOrders.includes(orderParam as EpisodeOrder)
      ? (orderParam as EpisodeOrder)
      : "default";

    let episodes = await getSeriesEpisodes(seriesId, season, order);

    // Sort by season then episode number
    episodes.sort((a, b) => {
      if (a.seasonNumber !== b.seasonNumber) {
        return a.seasonNumber - b.seasonNumber;
      }
      return a.number - b.number;
    });

    // Always fetch English translations for episodes with non-Latin names
    episodes = await fetchEnglishTranslations(episodes);

    // Fetch translations based on language
    if (lang === "it") {
      episodes = await fetchItalianTranslations(episodes);
    } else if (lang === "de") {
      episodes = await fetchGermanTranslations(episodes);
    }

    return NextResponse.json<TVDBApiResponse<TVDBEpisode[]>>({
      success: true,
      data: episodes,
    });
  } catch (error) {
    console.error("TVDB episodes error:", error);
    return NextResponse.json<TVDBApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch episodes",
      },
      { status: 500 }
    );
  }
}
