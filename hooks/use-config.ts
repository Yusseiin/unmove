"use client";

import { useState, useEffect, useCallback } from "react";
import type { AppConfig, Language } from "@/types/config";
import { defaultConfig, getLocalizedStrings } from "@/types/config";

export function useConfig() {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/config");
      const data = await response.json();

      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch {
      setError("Failed to load configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = useCallback(async (updates: Partial<AppConfig>) => {
    try {
      setError(null);
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setConfig(data.data);
        return true;
      } else {
        setError(data.error || "Failed to save configuration");
        return false;
      }
    } catch {
      setError("Failed to save configuration");
      return false;
    }
  }, []);

  const setLanguage = useCallback(
    (language: Language) => {
      return updateConfig({ language });
    },
    [updateConfig]
  );

  const strings = getLocalizedStrings(config.language);

  return {
    config,
    isLoading,
    error,
    updateConfig,
    setLanguage,
    strings,
    reload: loadConfig,
  };
}
