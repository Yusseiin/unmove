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

interface TransferConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: "copy" | "move";
  itemCount: number;
  destinationPath: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function TransferConfirmDialog({
  open,
  onOpenChange,
  operation,
  itemCount,
  destinationPath,
  onConfirm,
  isLoading,
}: TransferConfirmDialogProps) {
  const operationLabel = operation === "copy" ? "Copy" : "Move";
  const operationLabelLower = operation === "copy" ? "copy" : "move";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {operationLabel} {itemCount} item{itemCount !== 1 ? "s" : ""}?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Are you sure you want to {operationLabelLower} the selected item
                {itemCount !== 1 ? "s" : ""} to:
              </p>
              <p className="font-mono text-sm bg-muted px-2 py-1 rounded break-all">
                Media{destinationPath === "/" ? "" : destinationPath}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading ? `${operationLabel}ing...` : operationLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
