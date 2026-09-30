import { useEffect } from 'react';
import { themeStyles } from '@/data/css/themes';

export function useThemeCss(theme: string) {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'theme-css';
    style.textContent = themeStyles[theme] ?? themeStyles.mono;
    document.head.appendChild(style);
    return () => style.remove();
  }, [theme]);
}
