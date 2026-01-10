// Translation system for UnMove
// Supports English (en), Italian (it), and German (de)

import type { Language } from "@/types/config";

// Import translation files
import en from "@/locales/en.json";
import it from "@/locales/it.json";
import de from "@/locales/de.json";

// Type for the translation object structure
export type Translations = typeof en;

// Map of language codes to translation objects
const translations: Record<Language, Translations> = {
  en,
  it,
  de,
};

/**
 * Get the translations object for a specific language
 * @param language - The language code (en, it, de)
 * @returns The translations object for the specified language
 */
export function getTranslations(language: Language): Translations {
  return translations[language] || translations.en;
}

/**
 * Helper to interpolate variables in translation strings
 * Usage: interpolate("Found {count} files", { count: 5 }) => "Found 5 files"
 * @param template - The template string with {variable} placeholders
 * @param variables - Object with variable values
 * @returns The interpolated string
 */
export function interpolate(
  template: string,
  variables: Record<string, string | number>
): string {
  return template.replace(/{(\w+)}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}

// Re-export the Language type for convenience
export type { Language };
