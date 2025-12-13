import type { FileEntry } from "@/types/files";
import { createHash } from "crypto";
import { createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "—";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1 || lastDot === 0) return "";
  return filename.slice(lastDot + 1).toLowerCase();
}

export function getFileIconName(entry: FileEntry): string {
  if (entry.type === "directory") {
    return "Folder";
  }

  const ext = entry.extension || getFileExtension(entry.name);

  const iconMap: Record<string, string> = {
    // Video
    mp4: "FileVideo",
    mkv: "FileVideo",
    avi: "FileVideo",
    mov: "FileVideo",
    wmv: "FileVideo",
    webm: "FileVideo",
    m4v: "FileVideo",
    // Audio
    mp3: "FileAudio",
    wav: "FileAudio",
    flac: "FileAudio",
    aac: "FileAudio",
    ogg: "FileAudio",
    m4a: "FileAudio",
    // Images
    jpg: "FileImage",
    jpeg: "FileImage",
    png: "FileImage",
    gif: "FileImage",
    webp: "FileImage",
    svg: "FileImage",
    bmp: "FileImage",
    // Archives
    zip: "FileArchive",
    rar: "FileArchive",
    "7z": "FileArchive",
    tar: "FileArchive",
    gz: "FileArchive",
    // Documents
    pdf: "FileText",
    doc: "FileText",
    docx: "FileText",
    txt: "FileText",
    rtf: "FileText",
    // Code
    js: "FileCode",
    ts: "FileCode",
    jsx: "FileCode",
    tsx: "FileCode",
    html: "FileCode",
    css: "FileCode",
    json: "FileCode",
    // Subtitles
    srt: "FileText",
    sub: "FileText",
    ass: "FileText",
    vtt: "FileText",
  };

  return iconMap[ext] || "File";
}

export function sortEntries(entries: FileEntry[]): FileEntry[] {
  return [...entries].sort((a, b) => {
    // Directories first
    if (a.type === "directory" && b.type !== "directory") return -1;
    if (a.type !== "directory" && b.type === "directory") return 1;
    // Then alphabetically
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calculate SHA256 hash of a file
 */
export function calculateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);

    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (error) => reject(error));
  });
}

/**
 * Calculate combined hash for a directory (hashes all files recursively)
 */
export async function calculateDirectoryHash(dirPath: string): Promise<string> {
  const hash = createHash("sha256");
  const files = await getFilesRecursively(dirPath);

  // Sort files for consistent ordering
  files.sort();

  for (const file of files) {
    const relativePath = path.relative(dirPath, file);
    const fileHash = await calculateFileHash(file);
    // Include relative path in hash to catch renamed files
    hash.update(`${relativePath}:${fileHash}`);
  }

  return hash.digest("hex");
}

/**
 * Get all files in a directory recursively
 */
async function getFilesRecursively(dirPath: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await getFilesRecursively(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Verify that source and destination have matching content
 */
export async function verifyFileCopy(
  sourcePath: string,
  destPath: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const sourceStat = await fs.stat(sourcePath);
    const destStat = await fs.stat(destPath);

    if (sourceStat.isDirectory() !== destStat.isDirectory()) {
      return { valid: false, error: "Source and destination type mismatch" };
    }

    if (sourceStat.isDirectory()) {
      const sourceHash = await calculateDirectoryHash(sourcePath);
      const destHash = await calculateDirectoryHash(destPath);

      if (sourceHash !== destHash) {
        return { valid: false, error: "Directory hash mismatch" };
      }
    } else {
      // Check file size first (fast check)
      if (sourceStat.size !== destStat.size) {
        return { valid: false, error: "File size mismatch" };
      }

      const sourceHash = await calculateFileHash(sourcePath);
      const destHash = await calculateFileHash(destPath);

      if (sourceHash !== destHash) {
        return { valid: false, error: "File hash mismatch" };
      }
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}
