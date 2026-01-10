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

interface OverwriteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: "copy" | "move";
  conflicts: string[];
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  language?: Language;
}

export function OverwriteConfirmDialog({
  open,
  onOpenChange,
  operation,
  conflicts,
  onConfirm,
  onCancel,
  isLoading,
  language = "en",
}: OverwriteConfirmDialogProps) {
  const t = useMemo(() => getTranslations(language), [language]);
  const operationLabel = operation === "copy" ? t.common.copy : t.common.move;
  const operationLabelIng = operation === "copy" ? t.common.copying : t.common.moving;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.overwriteConfirm.title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                {conflicts.length === 1
                  ? t.overwriteConfirm.fileExists
                  : t.overwriteConfirm.filesExist}
              </p>
              <ul className="font-mono text-sm bg-muted px-3 py-2 rounded max-h-32 overflow-y-auto space-y-1">
                {conflicts.map((file) => (
                  <li key={file} className="break-all">
                    {file}
                  </li>
                ))}
              </ul>
              <p>
                {conflicts.length === 1
                  ? t.overwriteConfirm.doYouWantOverwrite
                  : t.overwriteConfirm.doYouWantOverwritePlural}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={onCancel}>
            {t.common.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading
              ? `${operationLabelIng}...`
              : interpolate(t.overwriteConfirm.overwriteAnd, { operation: operationLabel })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
