import { useEffect } from 'react';

export function useThemeCss(theme: string) {
  useEffect(() => {
    const id = 'theme-css';
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `/css/theme-${theme}.css`;
  }, [theme]);
}
