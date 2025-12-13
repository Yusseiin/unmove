"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FileItem } from "./file-item";
import type { FileEntry } from "@/types/files";

interface FileListProps {
  entries: FileEntry[];
  selectedPaths: Set<string>;
  isLoading: boolean;
  onSelect: (path: string) => void;
  onSelectAll: () => void;
  onNavigate: (path: string) => void;
}

export function FileList({
  entries,
  selectedPaths,
  isLoading,
  onSelect,
  onSelectAll,
  onNavigate,
}: FileListProps) {
  const allSelected = entries.length > 0 && selectedPaths.size === entries.length;
  const someSelected = selectedPaths.size > 0 && selectedPaths.size < entries.length;

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        This folder is empty
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    (el as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = someSelected;
                  }
                }}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Size</TableHead>
            <TableHead className="text-right hidden md:table-cell">Modified</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <FileItem
              key={entry.path}
              entry={entry}
              isSelected={selectedPaths.has(entry.path)}
              onSelect={onSelect}
              onNavigate={onNavigate}
            />
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
