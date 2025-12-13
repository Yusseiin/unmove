import path from "path";
import fs from "fs/promises";
import type { PaneType } from "@/types/files";

export function getBasePath(pane: PaneType): string {
  const basePath =
    pane === "downloads"
      ? process.env.DOWNLOAD_PATH
      : process.env.MEDIA_PATH;

  if (!basePath) {
    throw new Error(
      `Environment variable ${pane === "downloads" ? "DOWNLOAD_PATH" : "MEDIA_PATH"} is not set`
    );
  }

  return basePath;
}

export interface PathValidationResult {
  valid: boolean;
  absolutePath: string;
  error?: string;
}

export async function validatePath(
  basePath: string,
  requestedPath: string
): Promise<PathValidationResult> {
  // Normalize and resolve the full path
  const normalizedBase = path.resolve(basePath);
  const normalizedRequested = requestedPath
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
  const fullPath = path.resolve(normalizedBase, normalizedRequested);

  // Check for null bytes (path injection)
  if (requestedPath.includes("\0")) {
    return { valid: false, absolutePath: "", error: "Invalid path characters" };
  }

  // Check path doesn't escape base directory
  if (
    !fullPath.startsWith(normalizedBase + path.sep) &&
    fullPath !== normalizedBase
  ) {
    return { valid: false, absolutePath: "", error: "Path traversal detected" };
  }

  // Try to resolve symlinks and verify still within base
  try {
    const realPath = await fs.realpath(fullPath);
    const realBase = await fs.realpath(normalizedBase);
    if (
      !realPath.startsWith(realBase + path.sep) &&
      realPath !== realBase
    ) {
      return {
        valid: false,
        absolutePath: "",
        error: "Symlink escape detected",
      };
    }
    return { valid: true, absolutePath: realPath };
  } catch {
    // Path doesn't exist yet (for create operations)
    // Verify parent directory is valid
    const parentPath = path.dirname(fullPath);
    try {
      const realParent = await fs.realpath(parentPath);
      const realBase = await fs.realpath(normalizedBase);
      if (
        !realParent.startsWith(realBase + path.sep) &&
        realParent !== realBase
      ) {
        return {
          valid: false,
          absolutePath: "",
          error: "Invalid parent directory",
        };
      }
      return { valid: true, absolutePath: fullPath };
    } catch {
      return {
        valid: false,
        absolutePath: "",
        error: "Parent directory does not exist",
      };
    }
  }
}

export async function validateSourceAndDestination(
  sourcePaths: string[],
  destinationPath: string
): Promise<{ valid: boolean; error?: string; sources: string[]; destination: string }> {
  const downloadBase = getBasePath("downloads");
  const mediaBase = getBasePath("media");

  // Validate all source paths
  const validatedSources: string[] = [];
  for (const sourcePath of sourcePaths) {
    const result = await validatePath(downloadBase, sourcePath);
    if (!result.valid) {
      return {
        valid: false,
        error: `Invalid source path: ${result.error}`,
        sources: [],
        destination: "",
      };
    }
    validatedSources.push(result.absolutePath);
  }

  // Validate destination path
  const destResult = await validatePath(mediaBase, destinationPath);
  if (!destResult.valid) {
    return {
      valid: false,
      error: `Invalid destination path: ${destResult.error}`,
      sources: [],
      destination: "",
    };
  }

  return {
    valid: true,
    sources: validatedSources,
    destination: destResult.absolutePath,
  };
}
