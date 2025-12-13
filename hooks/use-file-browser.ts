"use client";

import { useState, useCallback, useEffect } from "react";
import type { FileEntry, PaneType, ListFilesResponse } from "@/types/files";

interface UseFileBrowserReturn {
  currentPath: string;
  entries: FileEntry[];
  selectedPaths: Set<string>;
  isLoading: boolean;
  error: string | null;
  navigate: (path: string) => void;
  navigateUp: () => void;
  refresh: () => void;
  toggleSelection: (path: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setSelectedPaths: (paths: Set<string>) => void;
}

export function useFileBrowser(pane: PaneType): UseFileBrowserReturn {
  const [currentPath, setCurrentPath] = useState("/");
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(
    async (path: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ pane, path });
        const response = await fetch(`/api/files?${params}`);
        const data: ListFilesResponse = await response.json();

        if (data.success && data.data) {
          setEntries(data.data.entries);
          setCurrentPath(data.data.path);
        } else {
          setError(data.error || "Failed to load files");
          setEntries([]);
        }
      } catch {
        setError("Failed to connect to server");
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    },
    [pane]
  );

  useEffect(() => {
    fetchFiles(currentPath);
  }, []);

  const navigate = useCallback(
    (path: string) => {
      setSelectedPaths(new Set());
      fetchFiles(path);
    },
    [fetchFiles]
  );

  const navigateUp = useCallback(() => {
    if (currentPath === "/") return;
    const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
    navigate(parentPath);
  }, [currentPath, navigate]);

  const refresh = useCallback(() => {
    fetchFiles(currentPath);
  }, [currentPath, fetchFiles]);

  const toggleSelection = useCallback((path: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedPaths(new Set(entries.map((e) => e.path)));
  }, [entries]);

  const clearSelection = useCallback(() => {
    setSelectedPaths(new Set());
  }, []);

  return {
    currentPath,
    entries,
    selectedPaths,
    isLoading,
    error,
    navigate,
    navigateUp,
    refresh,
    toggleSelection,
    selectAll,
    clearSelection,
    setSelectedPaths,
  };
}
