import React, { createContext, useState } from 'react';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [primaryColor] = useState('#a459a8');
  const [themeMode, setThemeMode] = useState('light');

  // TODO: Provide dynamic theming capabilities

  return (
    <ThemeContext.Provider value={{ primaryColor, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
