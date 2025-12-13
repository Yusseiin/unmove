"use client";

import {
  Folder,
  File,
  FileVideo,
  FileAudio,
  FileImage,
  FileArchive,
  FileText,
  FileCode,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatFileSize, formatDate, getFileIconName } from "@/lib/file-utils";
import type { FileEntry } from "@/types/files";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Folder,
  File,
  FileVideo,
  FileAudio,
  FileImage,
  FileArchive,
  FileText,
  FileCode,
};

interface FileItemProps {
  entry: FileEntry;
  isSelected: boolean;
  onSelect: (path: string) => void;
  onNavigate: (path: string) => void;
}

export function FileItem({
  entry,
  isSelected,
  onSelect,
  onNavigate,
}: FileItemProps) {
  const iconName = getFileIconName(entry);
  const Icon = iconMap[iconName] || File;

  const handleDoubleClick = () => {
    if (entry.type === "directory") {
      onNavigate(entry.path);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && entry.type === "directory") {
      onNavigate(entry.path);
    }
    if (e.key === " ") {
      e.preventDefault();
      onSelect(entry.path);
    }
  };

  return (
    <TableRow
      className={cn(
        "cursor-pointer transition-colors",
        isSelected && "bg-accent"
      )}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <TableCell className="w-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(entry.path)}
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              "h-4 w-4 flex-shrink-0",
              entry.type === "directory" ? "text-blue-500" : "text-muted-foreground"
            )}
          />
          <span className="truncate">{entry.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-right text-muted-foreground hidden sm:table-cell">
        {formatFileSize(entry.size)}
      </TableCell>
      <TableCell className="text-right text-muted-foreground hidden md:table-cell">
        {formatDate(entry.modifiedAt)}
      </TableCell>
    </TableRow>
  );
}
