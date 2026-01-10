"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getTranslations, interpolate } from "@/lib/translations";
import type { Language, MetadataProvider } from "@/types/config";

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
  language?: Language;
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
  language = "en",
}: TransferChoiceDialogProps) {
  const t = useMemo(() => getTranslations(language), [language]);
  const operationText = operation === "copy" ? t.common.copy : t.common.move;
  const seriesProviderName = seriesMetadataProvider === "tmdb" ? "TMDB" : "TVDB";
  const moviesProviderName = moviesMetadataProvider === "tmdb" ? "TMDB" : "TVDB";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{t.transferChoice.title}</DialogTitle>
          <DialogDescription className="text-sm">
            {t.transferChoice.description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:gap-3 py-2 sm:py-4">
          <Button
            variant="outline"
            className="h-auto py-3 sm:py-4 flex flex-col items-start gap-1"
            onClick={onNormalTransfer}
          >
            <span className="font-semibold text-sm sm:text-base">
              {interpolate(t.transferChoice.simpleTransfer, { operation: operationText })}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground text-left">
              {t.transferChoice.simpleTransferDescription}
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-3 sm:py-4 flex flex-col items-start gap-1"
            onClick={onIdentify}
          >
            <span className="font-semibold text-sm sm:text-base">
              {t.transferChoice.identifySeries} ({seriesProviderName})
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground text-left">
              {t.transferChoice.identifySeriesDescription}
            </span>
          </Button>

          {onIdentifyMovie && itemCount === 1 && (
            <Button
              variant="outline"
              className="h-auto py-3 sm:py-4 flex flex-col items-start gap-1"
              onClick={onIdentifyMovie}
            >
              <span className="font-semibold text-sm sm:text-base">
                {t.transferChoice.identifyMovie} ({moviesProviderName})
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground text-left">
                {t.transferChoice.identifyMovieDescription}
              </span>
            </Button>
          )}

          {onBatchIdentify && itemCount > 1 && (
            <Button
              variant="outline"
              className="h-auto py-3 sm:py-4 flex flex-col items-start gap-1"
              onClick={onBatchIdentify}
            >
              <span className="font-semibold text-sm sm:text-base">
                {t.transferChoice.identifyMoviesSeparately} ({moviesProviderName})
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground text-left">
                {t.transferChoice.identifyMoviesSeparatelyDescription}
              </span>
            </Button>
          )}

          {onMultiSeriesTransfer && itemCount > 1 && (
            <Button
              variant="outline"
              className="h-auto py-3 sm:py-4 flex flex-col items-start gap-1"
              onClick={onMultiSeriesTransfer}
            >
              <span className="font-semibold text-sm sm:text-base">
                {t.transferChoice.multiSeries} ({seriesProviderName})
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground text-left">
                {t.transferChoice.multiSeriesDescription}
              </span>
            </Button>
          )}

        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            {t.common.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
