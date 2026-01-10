"use client";

import { useMemo } from "react";
import { useFileBrowser } from "@/hooks/use-file-browser";
import { FileToolbar } from "./file-toolbar";
import { FileBreadcrumb } from "./file-breadcrumb";
import { FileList } from "./file-list";
import { cn } from "@/lib/utils";
import { getTranslations } from "@/lib/translations";
import type { PaneType } from "@/types/files";
import type { Language } from "@/types/config";

interface FilePaneProps {
  pane: PaneType;
  className?: string;
  onCopy?: (selectedPaths: string[], currentPath: string) => void;
  onMove?: (selectedPaths: string[], currentPath: string) => void;
  onDelete?: (pane: PaneType, selectedPaths: string[]) => void;
  onCreateFolder?: (currentPath: string) => void;
  language?: Language;
}

export function FilePane({
  pane,
  className,
  onCopy,
  onMove,
  onDelete,
  onCreateFolder,
  language = "en",
}: FilePaneProps) {
  const t = useMemo(() => getTranslations(language), [language]);
  const {
    currentPath,
    entries,
    selectedPaths,
    isLoading,
    error,
    navigate,
    refresh,
    toggleSelection,
    selectAll,
    clearSelection,
  } = useFileBrowser(pane);

  const handleCopy = () => {
    if (onCopy && selectedPaths.size > 0) {
      onCopy(Array.from(selectedPaths), currentPath);
    }
  };

  const handleMove = () => {
    if (onMove && selectedPaths.size > 0) {
      onMove(Array.from(selectedPaths), currentPath);
    }
  };

  const handleDelete = () => {
    if (onDelete && selectedPaths.size > 0) {
      onDelete(pane, Array.from(selectedPaths));
    }
  };

  const handleCreateFolder = () => {
    if (onCreateFolder) {
      onCreateFolder(currentPath);
    }
  };

  const handleSelectAll = () => {
    if (selectedPaths.size === entries.length) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <FileToolbar
        pane={pane}
        selectedCount={selectedPaths.size}
        isLoading={isLoading}
        onCopy={pane === "downloads" ? handleCopy : undefined}
        onMove={pane === "downloads" ? handleMove : undefined}
        onDelete={handleDelete}
        onCreateFolder={pane === "media" ? handleCreateFolder : undefined}
        onRefresh={refresh}
        language={language}
      />
      <div className="px-3 py-2 border-b bg-muted/30">
        <FileBreadcrumb
          path={currentPath}
          rootLabel={pane === "downloads" ? t.fileBrowser.downloads : t.fileBrowser.media}
          onNavigate={navigate}
        />
      </div>
      {error ? (
        <div className="flex items-center justify-center h-32 text-destructive">
          {error}
        </div>
      ) : (
        <FileList
          entries={entries}
          selectedPaths={selectedPaths}
          isLoading={isLoading}
          onSelect={toggleSelection}
          onSelectAll={handleSelectAll}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}

export { useFileBrowser };
