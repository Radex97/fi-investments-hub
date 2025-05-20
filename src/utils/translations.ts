
import { Language, TranslationKey } from "./translations/types";
import { deTranslations } from "./translations/de";
import { enTranslations } from "./translations/en";
import { itTranslations } from "./translations/it";

export type { Language, TranslationKey };

export const translations = {
  de: deTranslations,
  en: enTranslations,
  it: itTranslations
};
