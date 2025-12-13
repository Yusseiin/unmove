import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { validateSourceAndDestination } from "@/lib/path-validator";
import type { CopyMoveRequest, OperationResponse } from "@/types/files";

export async function POST(request: NextRequest) {
  try {
    const body: CopyMoveRequest = await request.json();
    const { sourcePaths, destinationPath, overwrite = false } = body;

    if (!sourcePaths || !Array.isArray(sourcePaths) || sourcePaths.length === 0) {
      return NextResponse.json<OperationResponse>(
        { success: false, error: "Source paths are required" },
        { status: 400 }
      );
    }

    if (typeof destinationPath !== "string") {
      return NextResponse.json<OperationResponse>(
        { success: false, error: "Destination path is required" },
        { status: 400 }
      );
    }

    // Validate all paths
    const validation = await validateSourceAndDestination(
      sourcePaths,
      destinationPath
    );

    if (!validation.valid) {
      return NextResponse.json<OperationResponse>(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Check destination is a directory
    const destStat = await fs.stat(validation.destination);
    if (!destStat.isDirectory()) {
      return NextResponse.json<OperationResponse>(
        { success: false, error: "Destination must be a directory" },
        { status: 400 }
      );
    }

    // Copy each source to destination
    let copiedCount = 0;
    const errors: string[] = [];

    for (const sourcePath of validation.sources) {
      const fileName = path.basename(sourcePath);
      const destPath = path.join(validation.destination, fileName);

      try {
        // Check if destination already exists
        let destExists = false;
        try {
          await fs.access(destPath);
          destExists = true;
        } catch {
          // Destination doesn't exist
        }

        // If destination exists and overwrite is false, skip
        if (destExists && !overwrite) {
          errors.push(`${fileName}: Destination already exists`);
          continue;
        }

        // If overwriting, remove existing destination first
        if (destExists && overwrite) {
          await fs.rm(destPath, { recursive: true, force: true });
        }

        // Copy file or directory
        await fs.cp(sourcePath, destPath, {
          recursive: true,
          errorOnExist: true,
          preserveTimestamps: true,
        });

        copiedCount++;
      } catch (error) {
        errors.push(
          `Failed to copy ${fileName}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    if (errors.length > 0 && copiedCount === 0) {
      return NextResponse.json<OperationResponse>(
        { success: false, error: errors.join("; ") },
        { status: 500 }
      );
    }

    const message =
      copiedCount === sourcePaths.length
        ? `Copied ${copiedCount} item${copiedCount !== 1 ? "s" : ""} successfully`
        : `Copied ${copiedCount} of ${sourcePaths.length} items. Errors: ${errors.join("; ")}`;

    return NextResponse.json<OperationResponse>({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Error copying files:", error);
    return NextResponse.json<OperationResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to copy files",
      },
      { status: 500 }
    );
  }
}
