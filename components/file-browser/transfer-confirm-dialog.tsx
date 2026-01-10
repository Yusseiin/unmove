"use client";

import { useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getTranslations, interpolate } from "@/lib/translations";
import type { Language } from "@/types/config";

interface TransferConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: "copy" | "move";
  itemCount: number;
  destinationPath: string;
  onConfirm: () => void;
  isLoading?: boolean;
  language?: Language;
}

export function TransferConfirmDialog({
  open,
  onOpenChange,
  operation,
  itemCount,
  destinationPath,
  onConfirm,
  isLoading,
  language = "en",
}: TransferConfirmDialogProps) {
  const t = useMemo(() => getTranslations(language), [language]);
  const operationLabel = operation === "copy" ? t.common.copy : t.common.move;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {interpolate(t.transferConfirm.title, { operation: operationLabel })}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                {operation === "copy"
                  ? interpolate(t.transferConfirm.copyingTo, { count: itemCount })
                  : interpolate(t.transferConfirm.movingTo, { count: itemCount })}
              </p>
              <p className="font-mono text-sm bg-muted px-2 py-1 rounded break-all">
                Media{destinationPath === "/" ? "" : destinationPath}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading ? t.transferConfirm.processing : operationLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
