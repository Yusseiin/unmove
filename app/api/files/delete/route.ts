import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getBasePath, validatePath } from "@/lib/path-validator";
import type { DeleteRequest, OperationResponse } from "@/types/files";

export async function DELETE(request: NextRequest) {
  try {
    const body: DeleteRequest = await request.json();
    const { pane, paths } = body;

    if (!pane || (pane !== "downloads" && pane !== "media")) {
      return NextResponse.json<OperationResponse>(
        { success: false, error: "Invalid pane parameter" },
        { status: 400 }
      );
    }

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json<OperationResponse>(
        { success: false, error: "Paths are required" },
        { status: 400 }
      );
    }

    const basePath = getBasePath(pane);

    // Validate all paths first
    const validatedPaths: string[] = [];
    for (const filePath of paths) {
      const validation = await validatePath(basePath, filePath);
      if (!validation.valid) {
        return NextResponse.json<OperationResponse>(
          { success: false, error: `Invalid path: ${validation.error}` },
          { status: 400 }
        );
      }
      validatedPaths.push(validation.absolutePath);
    }

    // Delete each path
    let deletedCount = 0;
    const errors: string[] = [];

    for (const absolutePath of validatedPaths) {
      try {
        await fs.rm(absolutePath, { recursive: true, force: true });
        deletedCount++;
      } catch (error) {
        const fileName = path.basename(absolutePath);
        errors.push(
          `Failed to delete ${fileName}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    if (errors.length > 0 && deletedCount === 0) {
      return NextResponse.json<OperationResponse>(
        { success: false, error: errors.join("; ") },
        { status: 500 }
      );
    }

    const message =
      deletedCount === paths.length
        ? `Deleted ${deletedCount} item${deletedCount !== 1 ? "s" : ""} successfully`
        : `Deleted ${deletedCount} of ${paths.length} items. Errors: ${errors.join("; ")}`;

    return NextResponse.json<OperationResponse>({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Error deleting files:", error);
    return NextResponse.json<OperationResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete files",
      },
      { status: 500 }
    );
  }
}
