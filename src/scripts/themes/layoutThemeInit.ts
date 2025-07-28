// src/scripts/layoutThemeInit.ts
import { getThemePreferenceFromStorage, applyTheme } from "./theme";

const initialTheme = getThemePreferenceFromStorage();
applyTheme(initialTheme);
