"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeSettings {
  uiPreset: string;
  tacticalOverlay: boolean;
  bgColor: string;
  bgImage: string;
}

interface ThemeContextType {
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
}

const DEFAULT_SETTINGS: ThemeSettings = {
  uiPreset: 'tactical',
  tacticalOverlay: false,
  bgColor: '#020617',
  bgImage: ''
};

const ThemeContext = createContext<ThemeContextType>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {}
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('combat_settings') || '{}');
    const savedCustom = JSON.parse(localStorage.getItem('combat_customization') || '{}');
    
    const merged = {
      ...DEFAULT_SETTINGS,
      ...savedSettings,
      bgColor: savedCustom.bgColor || DEFAULT_SETTINGS.bgColor,
      bgImage: savedCustom.bgImage || DEFAULT_SETTINGS.bgImage
    };
    
    setSettings(merged);
    applyTheme(merged);
  }, []);

  const applyTheme = (s: ThemeSettings) => {
    document.body.setAttribute('data-theme', s.uiPreset);
    document.body.classList.toggle('tactical-overlay', s.tacticalOverlay);
    document.body.classList.toggle('scanline-effect', s.tacticalOverlay);
    
    // Apply custom background color and image to the root or body
    document.documentElement.style.setProperty('--background-color', s.bgColor);
    if (s.bgImage) {
      document.body.style.backgroundImage = `url(${s.bgImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundPosition = 'center';
    } else {
      document.body.style.backgroundImage = 'none';
    }
  };

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Save to localStorage
      const combatSettings = {
        uiPreset: updated.uiPreset,
        tacticalOverlay: updated.tacticalOverlay
      };
      const combatCustom = {
        bgColor: updated.bgColor,
        bgImage: updated.bgImage
      };
      
      localStorage.setItem('combat_settings', JSON.stringify(combatSettings));
      localStorage.setItem('combat_customization', JSON.stringify(combatCustom));
      
      applyTheme(updated);
      return updated;
    });
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);