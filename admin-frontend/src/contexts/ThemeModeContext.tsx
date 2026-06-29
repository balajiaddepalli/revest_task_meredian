import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider, createTheme, PaletteMode } from '@mui/material';

interface ThemeModeContextValue {
  mode: PaletteMode;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('adminThemeMode') as PaletteMode) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('adminThemeMode', mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#1a237e', dark: '#0d1642' },
          secondary: { main: '#00897b' },
          background: mode === 'dark' ? { default: '#0f1419', paper: '#1a2332' } : { default: '#f8fafc' },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        shape: { borderRadius: 12 },
        components: {
          MuiButton: {
            styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.08)',
              },
            },
          },
        },
      }),
    [mode],
  );

  const toggleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}
