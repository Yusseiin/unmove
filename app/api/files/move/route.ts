import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { validateSourceAndDestination } from "@/lib/path-validator";
import { verifyFileCopy } from "@/lib/file-utils";
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

    // Move each source to destination with hash verification
    let movedCount = 0;
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

        // Try rename first (atomic operation on same filesystem)
        // Rename is safe - it's atomic, so no data loss possible
        try {
          await fs.rename(sourcePath, destPath);
          movedCount++;
          continue; // Success, move to next file
        } catch {
          // Rename failed (likely cross-filesystem), use copy + verify + delete
        }

        // Step 1: Copy the file/directory
        await fs.cp(sourcePath, destPath, {
          recursive: true,
          errorOnExist: true,
          preserveTimestamps: true,
        });

        // Step 2: Verify the copy with hash comparison
        const verification = await verifyFileCopy(sourcePath, destPath);

        if (!verification.valid) {
          // Hash mismatch - delete the failed copy and report error
          try {
            await fs.rm(destPath, { recursive: true, force: true });
          } catch {
            // Ignore cleanup errors
          }
          errors.push(
            `${fileName}: Copy verification failed - ${verification.error}. Source file preserved.`
          );
          continue;
        }

        // Step 3: Hash verified - safe to delete source
        await fs.rm(sourcePath, { recursive: true, force: true });

        movedCount++;
      } catch (error) {
        // If copy failed, try to clean up partial destination
        try {
          await fs.rm(destPath, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors
        }
        errors.push(
          `Failed to move ${fileName}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    if (errors.length > 0 && movedCount === 0) {
      return NextResponse.json<OperationResponse>(
        { success: false, error: errors.join("; ") },
        { status: 500 }
      );
    }

    const message =
      movedCount === sourcePaths.length
        ? `Moved ${movedCount} item${movedCount !== 1 ? "s" : ""} successfully`
        : `Moved ${movedCount} of ${sourcePaths.length} items. Errors: ${errors.join("; ")}`;

    return NextResponse.json<OperationResponse>({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Error moving files:", error);
    return NextResponse.json<OperationResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to move files",
      },
      { status: 500 }
    );
  }
}
