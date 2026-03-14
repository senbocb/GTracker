"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemePreset = 'default' | 'cyberpunk' | 'minimal' | 'valorant' | 'emerald';

interface ThemeContextType {
  preset: ThemePreset;
  setPreset: (preset: ThemePreset) => void;
  colors: {
    primary: string;
    background: string;
    card: string;
    border: string;
    text: string;
    accent: string;
  };
}

const presets: Record<ThemePreset, any> = {
  default: {
    primary: '#6366f1',
    background: '#020617',
    card: '#0f172a',
    border: '#1e293b',
    text: '#f8fafc',
    accent: '#818cf8'
  },
  cyberpunk: {
    primary: '#fde047',
    background: '#000000',
    card: '#111111',
    border: '#333333',
    text: '#ffffff',
    accent: '#00ff00'
  },
  minimal: {
    primary: '#000000',
    background: '#ffffff',
    card: '#f8fafc',
    border: '#e2e8f0',
    text: '#0f172a',
    accent: '#64748b'
  },
  valorant: {
    primary: '#ff4655',
    background: '#0f1923',
    card: '#1f2326',
    border: '#36393f',
    text: '#ece8e1',
    accent: '#ff4655'
  },
  emerald: {
    primary: '#10b981',
    background: '#064e3b',
    card: '#065f46',
    border: '#047857',
    text: '#ecfdf5',
    accent: '#34d399'
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [preset, setPreset] = useState<ThemePreset>(() => {
    return (localStorage.getItem('ui_preset') as ThemePreset) || 'default';
  });

  useEffect(() => {
    localStorage.setItem('ui_preset', preset);
    const root = document.documentElement;
    const colors = presets[preset];
    
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--card', colors.card);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--text', colors.text);
    root.style.setProperty('--accent', colors.accent);
    
    // Apply global body background
    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.text;
  }, [preset]);

  return (
    <ThemeContext.Provider value={{ preset, setPreset, colors: presets[preset] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};