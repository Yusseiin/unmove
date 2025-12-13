"use client";

import { Copy, Scissors, Trash2, FolderPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PaneType } from "@/types/files";

interface FileToolbarProps {
  pane: PaneType;
  selectedCount: number;
  isLoading: boolean;
  onCopy?: () => void;
  onMove?: () => void;
  onDelete: () => void;
  onCreateFolder?: () => void;
  onRefresh: () => void;
}

export function FileToolbar({
  pane,
  selectedCount,
  isLoading,
  onCopy,
  onMove,
  onDelete,
  onCreateFolder,
  onRefresh,
}: FileToolbarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 p-2 border-b">
        {pane === "downloads" && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasSelection || isLoading}
                  onClick={onCopy}
                >
                  <Copy className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">Copy</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy to Media</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasSelection || isLoading}
                  onClick={onMove}
                >
                  <Scissors className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">Move</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move to Media</TooltipContent>
            </Tooltip>
          </>
        )}
        {pane === "media" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isLoading}
                onClick={onCreateFolder}
              >
                <FolderPlus className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">New Folder</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Create new folder</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasSelection || isLoading}
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete selected</TooltipContent>
        </Tooltip>
        <div className="flex-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isLoading}
              onClick={onRefresh}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh</TooltipContent>
        </Tooltip>
        {hasSelection && (
          <span className="text-xs text-muted-foreground ml-2">
            {selectedCount} selected
          </span>
        )}
      </div>
    </TooltipProvider>
  );
}
