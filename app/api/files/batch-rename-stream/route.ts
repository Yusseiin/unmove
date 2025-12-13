import { NextRequest } from "next/server";
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
  overwrite?: boolean; // If true, overwrite existing files
}

interface ProgressUpdate {
  type: "progress" | "complete" | "error";
  current: number;
  total: number;
  currentFile?: string;
  completed: number;
  failed: number;
  errors: string[];
  message?: string;
}

export async function POST(request: NextRequest) {
  const body: BatchRenameRequest = await request.json();
  const { files, operation, overwrite = false } = body;

  // Validate request
  if (!files || !Array.isArray(files) || files.length === 0) {
    return new Response(
      JSON.stringify({ type: "error", message: "files array is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (operation !== "copy" && operation !== "move") {
    return new Response(
      JSON.stringify({ type: "error", message: "operation must be 'copy' or 'move'" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (update: ProgressUpdate) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));
      };

      try {
        const downloadBase = getBasePath("downloads");
        const mediaBase = getBasePath("media");

        let completed = 0;
        let failed = 0;
        const errors: string[] = [];
        const total = files.length;

        // Track created directories to avoid duplicate mkdir calls
        const createdDirs = new Set<string>();

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          // Send progress update
          sendProgress({
            type: "progress",
            current: i + 1,
            total,
            currentFile: file.destinationPath.split("/").pop() || file.sourcePath,
            completed,
            failed,
            errors,
          });

          try {
            // Validate source is in downloads
            const sourceValidation = await validatePath(downloadBase, file.sourcePath);
            if (!sourceValidation.valid) {
              errors.push(`Invalid source: ${file.sourcePath}`);
              failed++;
              continue;
            }
            const sourceFull = sourceValidation.absolutePath;

            // Get file size for progress (optional, could be used for byte-level progress)
            const sourceStats = await fs.stat(sourceFull);
            const fileSize = sourceStats.size;

            // Build destination path manually
            const sanitizedDest = file.destinationPath
              .replace(/\\/g, "/")
              .replace(/^\/+/, "")
              .split("/")
              .filter(part => part !== ".." && part !== "." && part.length > 0)
              .join("/");

            if (!sanitizedDest) {
              errors.push(`Invalid destination: ${file.destinationPath}`);
              failed++;
              continue;
            }

            const destFull = path.join(mediaBase, sanitizedDest);

            // Security check
            const normalizedDest = path.resolve(destFull);
            const normalizedBase = path.resolve(mediaBase);
            if (!normalizedDest.startsWith(normalizedBase + path.sep) && normalizedDest !== normalizedBase) {
              errors.push(`Invalid path: ${file.destinationPath}`);
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
              if (!overwrite) {
                errors.push(`Already exists: ${file.destinationPath.split("/").pop()}`);
                failed++;
                continue;
              }
              // If overwrite is true, we'll overwrite the file
            } catch {
              // File doesn't exist, proceed
            }

            // Copy file (for large files, we could stream and report byte progress)
            if (operation === "copy") {
              await fs.copyFile(sourceFull, destFull);
            } else {
              await fs.copyFile(sourceFull, destFull);
              await fs.unlink(sourceFull);
            }

            completed++;
          } catch (err) {
            failed++;
            errors.push(
              `Failed: ${file.sourcePath.split("/").pop() || "file"}`
            );
          }
        }

        // Clean up empty source directories for move operations
        if (operation === "move" && completed > 0) {
          const downloadBase = getBasePath("downloads");
          const sourceDirs = new Set<string>();

          for (const file of files) {
            try {
              const sourceValidation = await validatePath(downloadBase, file.sourcePath);
              if (sourceValidation.valid) {
                sourceDirs.add(path.dirname(sourceValidation.absolutePath));
              }
            } catch {
              // Skip
            }
          }

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
              // Skip
            }
          }
        }

        // Send completion
        sendProgress({
          type: "complete",
          current: total,
          total,
          completed,
          failed,
          errors,
          message: failed === 0 ? "All files processed successfully" : `Completed with ${failed} error(s)`,
        });
      } catch (error) {
        sendProgress({
          type: "error",
          current: 0,
          total: files.length,
          completed: 0,
          failed: files.length,
          errors: [error instanceof Error ? error.message : "Unknown error"],
          message: "Operation failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
