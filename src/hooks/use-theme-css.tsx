import { useEffect } from 'react';
import { themeStyles } from '@/data/css/themes';

export function useThemeCss(theme: string) {
  useEffect(() => {
    const id = 'theme-css';
    let styleElement = document.getElementById(id) as HTMLStyleElement | null;

    // Remove existing style element if it exists
    if (styleElement) {
      styleElement.remove();
    }

    // Create new style element
    styleElement = document.createElement('style');
    styleElement.id = id;
    styleElement.type = 'text/css';

    // Get the theme CSS content
    const themeCSS = themeStyles[theme];
    if (themeCSS) {
      styleElement.textContent = themeCSS;
      document.head.appendChild(styleElement);
    } else {
      console.warn(
        `Theme "${theme}" not found. Available themes:`,
        Object.keys(themeStyles)
      );
    }
  }, [theme]);
}
