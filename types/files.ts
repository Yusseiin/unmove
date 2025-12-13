export interface FileEntry {
  name: string;
  path: string; // Relative path from root
  type: "file" | "directory";
  size: number; // In bytes
  modifiedAt: string; // ISO date string
  extension?: string; // File extension (for files only)
}

export interface ListFilesResponse {
  success: boolean;
  data?: {
    path: string;
    entries: FileEntry[];
  };
  error?: string;
}

export interface OperationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export type PaneType = "downloads" | "media";

export interface CopyMoveRequest {
  sourcePaths: string[]; // Relative paths in downloads
  destinationPath: string; // Relative path in media (folder)
  overwrite?: boolean; // If true, overwrite existing files
}

export interface DeleteRequest {
  pane: PaneType;
  paths: string[]; // Relative paths to delete
}

export interface CreateFolderRequest {
  path: string; // Parent folder relative path in media
  name: string; // New folder name
}
