import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getBasePath } from "@/lib/path-validator";

interface FileDestination {
  sourcePath: string;
  destinationPath: string;
}

interface CheckDestinationsRequest {
  files: FileDestination[];
}

interface ExistingFile {
  sourcePath: string;
  destinationPath: string;
  fileName: string;
}

interface CheckDestinationsResponse {
  success: boolean;
  existingFiles: ExistingFile[];
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckDestinationsRequest = await request.json();
    const { files } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json<CheckDestinationsResponse>(
        { success: false, existingFiles: [], error: "Files array is required" },
        { status: 400 }
      );
    }

    const mediaBase = getBasePath("media");
    if (!mediaBase) {
      return NextResponse.json<CheckDestinationsResponse>(
        { success: false, existingFiles: [], error: "MEDIA_PATH not configured" },
        { status: 500 }
      );
    }

    const existingFiles: ExistingFile[] = [];

    for (const file of files) {
      // Build destination path
      const sanitizedDest = file.destinationPath
        .replace(/\\/g, "/")
        .replace(/^\/+/, "")
        .split("/")
        .filter(part => part !== ".." && part !== "." && part.length > 0)
        .join("/");

      if (!sanitizedDest) {
        continue;
      }

      const destFull = path.join(mediaBase, sanitizedDest);

      // Security check
      const normalizedDest = path.resolve(destFull);
      const normalizedBase = path.resolve(mediaBase);
      if (!normalizedDest.startsWith(normalizedBase + path.sep) && normalizedDest !== normalizedBase) {
        continue;
      }

      // Check if file exists
      try {
        await fs.access(destFull);
        // File exists
        existingFiles.push({
          sourcePath: file.sourcePath,
          destinationPath: file.destinationPath,
          fileName: path.basename(sanitizedDest),
        });
      } catch {
        // File doesn't exist, no conflict
      }
    }

    return NextResponse.json<CheckDestinationsResponse>({
      success: true,
      existingFiles,
    });
  } catch (error) {
    console.error("Error checking destinations:", error);
    return NextResponse.json<CheckDestinationsResponse>(
      {
        success: false,
        existingFiles: [],
        error: error instanceof Error ? error.message : "Failed to check destinations",
      },
      { status: 500 }
    );
  }
}
