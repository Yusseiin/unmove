"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTranslations, interpolate } from "@/lib/translations";
import type { Language } from "@/types/config";
import type { Translations } from "@/lib/translations";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onSubmit: (newName: string) => void;
  isLoading?: boolean;
  language?: Language;
}

// Validate file/folder name client-side for immediate feedback
function validateFileName(name: string, t: Translations): { valid: boolean; error?: string } {
  if (!name || typeof name !== "string") {
    return { valid: false, error: t.rename.validation.nameRequired };
  }

  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return { valid: false, error: t.rename.validation.nameEmpty };
  }

  // Check for illegal characters
  const illegalChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (illegalChars.test(trimmedName)) {
    return {
      valid: false,
      error: t.rename.validation.illegalChars,
    };
  }

  // Check for reserved names on Windows
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
  if (reservedNames.test(trimmedName)) {
    return {
      valid: false,
      error: t.rename.validation.reservedName,
    };
  }

  // Check if name is just a dot
  if (trimmedName === ".") {
    return { valid: false, error: t.rename.validation.nameDot };
  }

  // Check if name ends with space or dot
  if (trimmedName.endsWith(" ") || trimmedName.endsWith(".")) {
    return { valid: false, error: t.rename.validation.nameEndsDotSpace };
  }

  // Check length
  if (trimmedName.length > 255) {
    return { valid: false, error: t.rename.validation.nameTooLong };
  }

  return { valid: true };
}

export function RenameDialog({
  open,
  onOpenChange,
  currentName,
  onSubmit,
  isLoading,
  language = "en",
}: RenameDialogProps) {
  const t = useMemo(() => getTranslations(language), [language]);
  const [name, setName] = useState(currentName);
  const [error, setError] = useState("");

  // Reset name when dialog opens with new currentName
  useEffect(() => {
    if (open) {
      setName(currentName);
      setError("");
    }
  }, [open, currentName]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();

    // Check if name changed
    if (trimmedName === currentName) {
      setError(t.rename.validation.nameSame);
      return;
    }

    // Validate the name
    const validation = validateFileName(trimmedName, t);
    if (!validation.valid) {
      setError(validation.error || t.rename.validation.invalidName);
      return;
    }

    onSubmit(trimmedName);
  }, [name, currentName, t, onSubmit]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setName(currentName);
      setError("");
    }
    onOpenChange(newOpen);
  }, [currentName, onOpenChange]);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    // Clear error on change, but show validation errors in real-time for illegal chars
    const validation = validateFileName(value, t);
    if (!validation.valid && value.trim().length > 0) {
      setError(validation.error || "");
    } else {
      setError("");
    }
  }, [t]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t.rename.title}</DialogTitle>
            <DialogDescription>
              {interpolate(t.rename.description, { name: currentName })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-name" className="sr-only">
              {t.rename.newName}
            </Label>
            <Input
              id="new-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={t.rename.placeholder}
              autoFocus
              disabled={isLoading}
              onFocus={(e) => {
                // Select filename without extension for files
                const lastDot = e.target.value.lastIndexOf(".");
                if (lastDot > 0) {
                  e.target.setSelectionRange(0, lastDot);
                } else {
                  e.target.select();
                }
              }}
            />
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isLoading || !!error}>
              {isLoading ? t.common.renaming : t.common.rename}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
