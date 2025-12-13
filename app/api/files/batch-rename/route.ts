import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { validatePath, getBasePath } from "@/lib/path-validator";

interface FileRename {
  sourcePath: string;
  destinationPath: string;
}

interface BatchRenameRequest {
  files: FileRename[];
  operation: "copy" | "move";
}

interface BatchRenameResponse {
  success: boolean;
  data?: {
    completed: number;
    failed: number;
    errors: string[];
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchRenameRequest = await request.json();
    const { files, operation } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json<BatchRenameResponse>(
        { success: false, error: "files array is required" },
        { status: 400 }
      );
    }

    if (operation !== "copy" && operation !== "move") {
      return NextResponse.json<BatchRenameResponse>(
        { success: false, error: "operation must be 'copy' or 'move'" },
        { status: 400 }
      );
    }

    const downloadBase = getBasePath("downloads");
    const mediaBase = getBasePath("media");

    let completed = 0;
    let failed = 0;
    const errors: string[] = [];

    // Track created directories to avoid duplicate mkdir calls
    const createdDirs = new Set<string>();

    for (const file of files) {
      try {
        // Validate source is in downloads
        const sourceValidation = await validatePath(downloadBase, file.sourcePath);
        if (!sourceValidation.valid) {
          errors.push(`Invalid source path: ${file.sourcePath} - ${sourceValidation.error}`);
          failed++;
          continue;
        }
        const sourceFull = sourceValidation.absolutePath;

        // Build destination path manually (don't use validatePath since parent may not exist yet)
        // Sanitize the destination path to prevent path traversal
        const sanitizedDest = file.destinationPath
          .replace(/\\/g, "/")
          .replace(/^\/+/, "")
          .split("/")
          .filter(part => part !== ".." && part !== "." && part.length > 0)
          .join("/");

        if (!sanitizedDest) {
          errors.push(`Invalid destination path: ${file.destinationPath}`);
          failed++;
          continue;
        }

        const destFull = path.join(mediaBase, sanitizedDest);

        // Verify destination is still within media base (security check)
        const normalizedDest = path.resolve(destFull);
        const normalizedBase = path.resolve(mediaBase);
        if (!normalizedDest.startsWith(normalizedBase + path.sep) && normalizedDest !== normalizedBase) {
          errors.push(`Invalid destination path (traversal attempt): ${file.destinationPath}`);
          failed++;
          continue;
        }

        // Create destination directory if needed
        const destDir = path.dirname(destFull);
        if (!createdDirs.has(destDir)) {
          await fs.mkdir(destDir, { recursive: true });
          createdDirs.add(destDir);
        }

        // Check if destination already exists
        try {
          await fs.access(destFull);
          // File exists, skip or handle conflict
          errors.push(`File already exists: ${file.destinationPath}`);
          failed++;
          continue;
        } catch {
          // File doesn't exist, proceed
        }

        if (operation === "copy") {
          await fs.copyFile(sourceFull, destFull);
        } else {
          // Move = copy + delete
          await fs.copyFile(sourceFull, destFull);
          await fs.unlink(sourceFull);
        }

        completed++;
      } catch (err) {
        failed++;
        errors.push(
          `Failed to ${operation} ${file.sourcePath}: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    }

    // If we moved files, try to clean up empty source directories
    if (operation === "move" && completed > 0) {
      const sourceDirs = new Set<string>();
      for (const file of files) {
        try {
          const sourceValidation = await validatePath(downloadBase, file.sourcePath);
          if (sourceValidation.valid) {
            sourceDirs.add(path.dirname(sourceValidation.absolutePath));
          }
        } catch {
          // Skip invalid paths
        }
      }

      // Sort directories by depth (deepest first) to clean up properly
      const sortedDirs = [...sourceDirs].sort(
        (a, b) => b.split(path.sep).length - a.split(path.sep).length
      );

      for (const dir of sortedDirs) {
        try {
          const entries = await fs.readdir(dir);
          if (entries.length === 0) {
            await fs.rmdir(dir);
          }
        } catch {
          // Directory not empty or doesn't exist, skip
        }
      }
    }

    return NextResponse.json<BatchRenameResponse>({
      success: failed === 0,
      data: {
        completed,
        failed,
        errors,
      },
    });
  } catch (error) {
    console.error("Batch rename error:", error);
    return NextResponse.json<BatchRenameResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process files",
      },
      { status: 500 }
    );
  }
}
