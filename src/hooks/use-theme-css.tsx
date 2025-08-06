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

      // Force reload CSS by adding timestamp to prevent mobile caching issues
      const href = `/css/theme-${theme}.css`;
      link.href = href;

      // Ensure the CSS is loaded before the component continues
      return new Promise<void>((resolve) => {
        const handleLoad = () => {
          link?.removeEventListener('load', handleLoad);
          resolve();
        };

        if (link.href === href && link.sheet) {
          // Already loaded
          resolve();
        } else {
          link.addEventListener('load', handleLoad);
          // Fallback timeout for mobile devices
          setTimeout(resolve, 100);
        }
      });
    };

    loadNewTheme();
  }, [theme]);
}
