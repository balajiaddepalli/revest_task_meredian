import { createContext, useContext, useMemo, ReactNode } from 'react';
import { ThemeProvider, createTheme, PaletteMode } from '@mui/material';

interface ThemeModeContextValue {
  mode: PaletteMode;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

/** Elegant light-only boutique palette */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1B2838', dark: '#141820', light: '#2D3E50' },
    secondary: { main: '#C4A574', dark: '#A68B5B', light: '#D4BC94' },
    background: { default: '#F7F5F2', paper: '#FFFFFF' },
    text: { primary: '#1B2838', secondary: '#5C6570' },
    divider: 'rgba(27, 40, 56, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8, px: 2.5 },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 4px 14px rgba(27,40,56,0.15)' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(27,40,56,0.06), 0 4px 16px rgba(27,40,56,0.04)',
          border: '1px solid rgba(27,40,56,0.06)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(27,40,56,0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: '0 1px 0 rgba(27,40,56,0.06)' },
      },
    },
  },
});

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({ mode: 'light' as PaletteMode }), []);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}
