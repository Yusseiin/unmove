"use client";

import { useMemo } from "react";
import { Copy, Scissors, Trash2, FolderPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTranslations } from "@/lib/translations";
import type { PaneType } from "@/types/files";
import type { Language } from "@/types/config";

interface FileToolbarProps {
  pane: PaneType;
  selectedCount: number;
  isLoading: boolean;
  onCopy?: () => void;
  onMove?: () => void;
  onDelete: () => void;
  onCreateFolder?: () => void;
  onRefresh: () => void;
  language?: Language;
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
  language = "en",
}: FileToolbarProps) {
  const t = useMemo(() => getTranslations(language), [language]);
  const hasSelection = selectedCount > 0;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-2 sm:gap-1 p-2 px-3 sm:px-2 border-b">
        {pane === "downloads" && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasSelection || isLoading}
                  onClick={onCopy}
                  className="h-10 px-3 sm:h-8 sm:px-2"
                >
                  <Copy className="h-5 w-5 sm:h-4 sm:w-4" />
                  <span className="ml-1 hidden sm:inline">{t.toolbar.copy}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.toolbar.copyToMedia}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasSelection || isLoading}
                  onClick={onMove}
                  className="h-10 px-3 sm:h-8 sm:px-2"
                >
                  <Scissors className="h-5 w-5 sm:h-4 sm:w-4" />
                  <span className="ml-1 hidden sm:inline">{t.toolbar.move}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.toolbar.moveToMedia}</TooltipContent>
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
                className="h-10 px-3 sm:h-8 sm:px-2"
              >
                <FolderPlus className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="ml-1 hidden sm:inline">{t.toolbar.newFolder}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.toolbar.createNewFolder}</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasSelection || isLoading}
              onClick={onDelete}
              className="h-10 px-3 sm:h-8 sm:px-2"
            >
              <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="ml-1 hidden sm:inline">{t.toolbar.delete}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.toolbar.deleteSelected}</TooltipContent>
        </Tooltip>
        <div className="flex-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isLoading}
              onClick={onRefresh}
              className="h-10 w-10 sm:h-8 sm:w-8"
            >
              <RefreshCw className={`h-5 w-5 sm:h-4 sm:w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.toolbar.refresh}</TooltipContent>
        </Tooltip>
        {hasSelection && (
          <span className="text-sm sm:text-xs text-muted-foreground ml-2">
            {selectedCount} {t.common.selected}
          </span>
        )}
      </div>
    </TooltipProvider>
  );
}
