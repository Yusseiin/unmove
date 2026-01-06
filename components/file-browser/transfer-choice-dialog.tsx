"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MetadataProvider } from "@/types/config";

interface TransferChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: "copy" | "move";
  itemCount: number;
  seriesMetadataProvider?: MetadataProvider;
  moviesMetadataProvider?: MetadataProvider;
  onNormalTransfer: () => void;
  onIdentify: () => void;
  onIdentifyMovie?: () => void; // For identifying a single file as a movie
  onBatchIdentify?: () => void; // For identifying multiple movies separately
  onMultiSeriesTransfer?: () => void; // For identifying multiple different TV series
}

export function TransferChoiceDialog({
  open,
  onOpenChange,
  operation,
  itemCount,
  seriesMetadataProvider = "tvdb",
  moviesMetadataProvider = "tmdb",
  onNormalTransfer,
  onIdentify,
  onIdentifyMovie,
  onBatchIdentify,
  onMultiSeriesTransfer,
}: TransferChoiceDialogProps) {
  const operationText = operation === "copy" ? "Copy" : "Move";
  const itemText = itemCount === 1 ? "item" : "items";
  const seriesProviderName = seriesMetadataProvider === "tmdb" ? "TMDB" : "TVDB";
  const moviesProviderName = moviesMetadataProvider === "tmdb" ? "TMDB" : "TVDB";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{operationText} Options</DialogTitle>
          <DialogDescription className="text-sm">
            How would you like to {operation} {itemCount} {itemText}?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:gap-3 py-2 sm:py-4">
          <Button
            variant="outline"
            className="h-auto py-3 sm:py-4 flex flex-col items-start gap-1"
            onClick={onNormalTransfer}
          >
            <span className="font-semibold text-sm sm:text-base">{operationText} Normally</span>
            <span className="text-xs sm:text-sm text-muted-foreground text-left">
              Transfer to current Media folder
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-3 sm:py-4 flex flex-col items-start gap-1"
            onClick={onIdentify}
          >
            <span className="font-semibold text-sm sm:text-base">
              {itemCount === 1 ? `Identify as TV Series with ${seriesProviderName}` : `Identify TV Series with ${seriesProviderName}`}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground text-left">
              Search {seriesProviderName} to identify and rename as TV series episodes
            </span>
          </Button>

          {onIdentifyMovie && itemCount === 1 && (
            <Button
              variant="outline"
              className="h-auto py-3 sm:py-4 flex flex-col items-start gap-1"
              onClick={onIdentifyMovie}
            >
              <span className="font-semibold text-sm sm:text-base">Identify as Movie with {moviesProviderName}</span>
              <span className="text-xs sm:text-sm text-muted-foreground text-left">
                Search {moviesProviderName} to identify and rename as a movie
              </span>
            </Button>
          )}

          {onBatchIdentify && itemCount > 1 && (
            <Button
              variant="outline"
              className="h-auto py-3 sm:py-4 flex flex-col items-start gap-1"
              onClick={onBatchIdentify}
            >
              <span className="font-semibold text-sm sm:text-base">Identify Movies with {moviesProviderName}</span>
              <span className="text-xs sm:text-sm text-muted-foreground text-left">
                Search each file independently (for multiple movies)
              </span>
            </Button>
          )}

          {onMultiSeriesTransfer && itemCount > 1 && (
            <Button
              variant="outline"
              className="h-auto py-3 sm:py-4 flex flex-col items-start gap-1"
              onClick={onMultiSeriesTransfer}
            >
              <span className="font-semibold text-sm sm:text-base">Multiple TV Series with {seriesProviderName}</span>
              <span className="text-xs sm:text-sm text-muted-foreground text-left">
                Episodes from different series
              </span>
            </Button>
          )}

        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
