import { MD3LightTheme, MD3DarkTheme, MD3Theme } from "react-native-paper";
import {
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
  Theme as NavTheme,
} from "@react-navigation/native";

// Define the core color palette
const palette = {
  primary: "#2563eb", // Blue 600
  primaryContainer: "#dbeafe", // Blue 100
  secondary: "#475569", // Slate 600
  secondaryContainer: "#f1f5f9", // Slate 100
  accent: "#0ea5e9", // Sky 500
  backgroundLight: "#ffffff",
  backgroundDark: "#0f172a", // Slate 900
  surfaceLight: "#f7f8f9",
  surfaceDark: "#1e293b", // Slate 800
  green: "#10b981", // Green 500
  error: "#ef4444", // Red 500
  onErrorContainer: "#ffffff",
  // onSurfaceLight: '#f7f8f9', // slate-400 what i want in both themes to be used it looks visible visible on both
  textLight: "#0f172a", // Slate 900
  textDark: "#f8fafc", // Slate 50
  // instead of using text light and dark we can use just this i think
  outline: "#cbd5e1", // Slate 300
  outlineDark: "#334155", // Slate 700
};

export const AppLightTheme: MD3Theme & NavTheme = {
  ...MD3LightTheme,
  ...NavDefaultTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...NavDefaultTheme.colors,
    primary: palette.primary,
    primaryContainer: palette.primaryContainer,
    secondary: palette.secondary,
    secondaryContainer: palette.secondaryContainer,
    background: palette.backgroundLight,
    surface: palette.surfaceLight,
    onSecondaryContainer: palette.green,
    error: palette.error,
    onErrorContainer: palette.onErrorContainer,
    onPrimary: "#ffffff",
    onSecondary: "#ffffff",
    onSurface: palette.textLight,
    onBackground: palette.textLight,
    outline: palette.outline,
    elevation: {
      level0: "transparent",
      level1: "#f8fafc",
      level2: "#f1f5f9",
      level3: "#e2e8f0",
      level4: "#cbd5e1",
      level5: "#94a3b8",
    },
    // Navigation specific
    card: palette.surfaceLight,
    text: palette.textLight,
    notification: palette.error,
  },
  fonts: {
    ...MD3LightTheme.fonts,
    regular: { fontFamily: "System", fontWeight: "400" },
    medium: { fontFamily: "System", fontWeight: "500" },
    bold: { fontFamily: "System", fontWeight: "700" },
    heavy: { fontFamily: "System", fontWeight: "900" },
  },
};

export const AppDarkTheme: MD3Theme & NavTheme = {
  ...MD3DarkTheme,
  ...NavDarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...NavDarkTheme.colors,
    primary: palette.primary,
    primaryContainer: "#1e3a8a", // Blue 900
    secondary: "#94a3b8", // Slate 400
    secondaryContainer: "#334155", // Slate 700
    background: palette.backgroundDark,
    surface: palette.surfaceDark,
    onSecondaryContainer: palette.green,
    error: "#f87171", // Red 400
    onErrorContainer: palette.onErrorContainer,
    onPrimary: "#ffffff",
    onSecondary: "#0f172a",
    onSurface: palette.textDark,
    onBackground: palette.textDark,
    outline: palette.outlineDark,
    elevation: {
      level0: "transparent",
      level1: "#1e293b",
      level2: "#334155",
      level3: "#475569",
      level4: "#64748b",
      level5: "#94a3b8",
    },
    // Navigation specific
    card: palette.surfaceDark,
    text: palette.textDark,
    border: palette.outlineDark,
    notification: palette.error,
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    regular: { fontFamily: "System", fontWeight: "400" },
    medium: { fontFamily: "System", fontWeight: "500" },
    bold: { fontFamily: "System", fontWeight: "700" },
    heavy: { fontFamily: "System", fontWeight: "900" },
  },
};

export type AppThemeType = typeof AppLightTheme;
