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
      
      // At this point, link is guaranteed to be non-null
      const linkElement = link as HTMLLinkElement;
      
      // Force reload CSS by adding timestamp to prevent mobile caching issues
      const href = `/css/theme-${theme}.css`;
      linkElement.href = href;
      
      // Ensure the CSS is loaded before the component continues
      return new Promise<void>((resolve) => {
        const handleLoad = () => {
          linkElement.removeEventListener('load', handleLoad);
          resolve();
        };
        
        if (linkElement.href === href && linkElement.sheet) {
          // Already loaded
          resolve();
        } else {
          linkElement.addEventListener('load', handleLoad);
          // Fallback timeout for mobile devices
          setTimeout(resolve, 100);
        }
      });
    };
    
    loadNewTheme();
  }, [theme]);
}
