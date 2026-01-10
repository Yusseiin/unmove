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

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemCount: number;
  onConfirm: () => void;
  isLoading?: boolean;
  language?: Language;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemCount,
  onConfirm,
  isLoading,
  language = "en",
}: DeleteConfirmDialogProps) {
  const t = useMemo(() => getTranslations(language), [language]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.deleteConfirm.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.deleteConfirm.description}
            <br />
            <span className="font-medium">{interpolate(t.deleteConfirm.itemsCount, { count: itemCount })}</span>
            <br />
            <span className="text-destructive">{t.deleteConfirm.warningPermanent}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? t.deleteConfirm.deleting : t.common.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
