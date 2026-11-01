import React, { createContext, useContext } from 'react';
import type { ThemeColor } from '../types';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryBorder: string;
  primaryDark: string;
  textLight: string;
  shadow: string;
  accent: string;
}

export const THEMES: Record<ThemeColor, ThemeColors> = {
  green: {
    primary: '#056839',
    primaryLight: '#ECFDF5',
    primaryBorder: '#A7F3D0',
    primaryDark: '#02331b',
    textLight: '#D1FAE5',
    shadow: '#056839',
    accent: '#10B981',
  },
  blue: {
    primary: '#1D4ED8',
    primaryLight: '#EFF6FF',
    primaryBorder: '#BFDBFE',
    primaryDark: '#1E3A8A',
    textLight: '#DBEAFE',
    shadow: '#1D4ED8',
    accent: '#3B82F6',
  },
  orange: {
    primary: '#C2410C',
    primaryLight: '#FFF7ED',
    primaryBorder: '#FED7AA',
    primaryDark: '#7C2D12',
    textLight: '#FFEDD5',
    shadow: '#C2410C',
    accent: '#F97316',
  },
  purple: {
    primary: '#6D28D9',
    primaryLight: '#F5F3FF',
    primaryBorder: '#DDD6FE',
    primaryDark: '#4C1D95',
    textLight: '#EDE9FE',
    shadow: '#6D28D9',
    accent: '#8B5CF6',
  },
};

interface ThemeContextType {
  themeColor: ThemeColor;
  colors: ThemeColors;
}

export const ThemeContext = createContext<ThemeContextType>({
  themeColor: 'green',
  colors: THEMES.green,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  themeColor: ThemeColor;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  themeColor,
  children,
}) => {
  const activeTheme = THEMES[themeColor] || THEMES.green;

  return (
    <ThemeContext.Provider value={{ themeColor, colors: activeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
