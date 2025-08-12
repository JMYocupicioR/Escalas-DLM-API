import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import {
  MD3DarkTheme as PaperDarkBase,
  MD3LightTheme as PaperLightBase,
  MD3Theme as PaperTheme,
} from 'react-native-paper';

const primary = '#0891b2';
const light = {
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  border: '#e5e7eb',
  mutedText: '#64748b',
};
const dark = {
  background: '#0f172a',
  card: '#111827',
  text: '#f8fafc',
  border: '#334155',
  mutedText: '#94a3b8',
};

export const navigationLightTheme: NavigationTheme = {
  ...NavigationLightTheme,
  colors: {
    ...NavigationLightTheme.colors,
    primary,
    background: light.background,
    card: light.card,
    text: light.text,
    border: light.border,
  },
};

export const navigationDarkTheme: NavigationTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary,
    background: dark.background,
    card: dark.card,
    text: dark.text,
    border: dark.border,
  },
};

export const paperLightTheme: PaperTheme = {
  ...PaperLightBase,
  colors: {
    ...PaperLightBase.colors,
    primary,
    background: light.background,
    surface: light.card,
    onSurface: light.text,
    outline: light.border,
  },
};

export const paperDarkTheme: PaperTheme = {
  ...PaperDarkBase,
  colors: {
    ...PaperDarkBase.colors,
    primary,
    background: dark.background,
    surface: dark.card,
    onSurface: dark.text,
    outline: dark.border,
  },
};

export const palette = { light, dark, primary };


