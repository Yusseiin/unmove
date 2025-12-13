"use client";

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

interface OverwriteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: "copy" | "move";
  conflicts: string[];
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function OverwriteConfirmDialog({
  open,
  onOpenChange,
  operation,
  conflicts,
  onConfirm,
  onCancel,
  isLoading,
}: OverwriteConfirmDialogProps) {
  const operationLabel = operation === "copy" ? "Copy" : "Move";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Overwrite existing files?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                The following {conflicts.length === 1 ? "file" : "files"} already{" "}
                {conflicts.length === 1 ? "exists" : "exist"} at the destination:
              </p>
              <ul className="font-mono text-sm bg-muted px-3 py-2 rounded max-h-32 overflow-y-auto space-y-1">
                {conflicts.map((file) => (
                  <li key={file} className="break-all">
                    {file}
                  </li>
                ))}
              </ul>
              <p>
                Do you want to overwrite {conflicts.length === 1 ? "it" : "them"}?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? `${operationLabel}ing...` : `Overwrite & ${operationLabel}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
