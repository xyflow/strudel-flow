import { useEffect } from 'react';

export function useThemeCss(theme: string) {
  useEffect(() => {
    const id = 'theme-css';
    let link = document.getElementById(id) as HTMLLinkElement | null;

    const loadNewTheme = () => {
      if (!link) {
        link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }

      const linkElement = link as HTMLLinkElement;

      const href = `${
        import.meta.env.VITE_BASE_URL || ''
      }/css/theme-${theme}.css`;
      linkElement.href = href;

      return new Promise<void>((resolve) => {
        const handleLoad = () => {
          linkElement.removeEventListener('load', handleLoad);
          resolve();
        };

        if (linkElement.href === href && linkElement.sheet) {
          resolve();
        } else {
          linkElement.addEventListener('load', handleLoad);
          setTimeout(resolve, 100);
        }
      });
    };

    loadNewTheme();
  }, [theme]);
}
