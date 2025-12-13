import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { validatePath } from "@/lib/path-validator";

interface CheckExistsRequest {
  sourcePaths: string[];
  destinationPath: string;
}

interface CheckExistsResponse {
  success: boolean;
  conflicts?: string[]; // File names that already exist at destination
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckExistsRequest = await request.json();
    const { sourcePaths, destinationPath } = body;

    if (!sourcePaths || !Array.isArray(sourcePaths) || sourcePaths.length === 0) {
      return NextResponse.json<CheckExistsResponse>(
        { success: false, error: "Source paths are required" },
        { status: 400 }
      );
    }

    if (typeof destinationPath !== "string") {
      return NextResponse.json<CheckExistsResponse>(
        { success: false, error: "Destination path is required" },
        { status: 400 }
      );
    }

    // Validate destination path (must be in media)
    const mediaPath = process.env.MEDIA_PATH;
    if (!mediaPath) {
      return NextResponse.json<CheckExistsResponse>(
        { success: false, error: "MEDIA_PATH not configured" },
        { status: 500 }
      );
    }

    const destValidation = await validatePath(mediaPath, destinationPath);
    if (!destValidation.valid) {
      return NextResponse.json<CheckExistsResponse>(
        { success: false, error: destValidation.error },
        { status: 400 }
      );
    }

    // Check which files already exist at destination
    const conflicts: string[] = [];

    for (const sourcePath of sourcePaths) {
      const fileName = path.basename(sourcePath);
      const destPath = path.join(destValidation.absolutePath, fileName);

      try {
        await fs.access(destPath);
        // If we get here, file exists
        conflicts.push(fileName);
      } catch {
        // File doesn't exist, no conflict
      }
    }

    return NextResponse.json<CheckExistsResponse>({
      success: true,
      conflicts,
    });
  } catch (error) {
    console.error("Error checking file existence:", error);
    return NextResponse.json<CheckExistsResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to check files",
      },
      { status: 500 }
    );
  }
}
