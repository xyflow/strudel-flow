import { useRef, useEffect } from 'react';
// @ts-expect-error - Missing type declarations for @strudel/web
import { initStrudel, samples } from '@strudel/web';

import { createAppStore } from '@/store/app-store';
import {
  AppStoreContext,
  type AppStoreProviderProps,
} from '@/store/app-context';
import { useThemeCss } from '@/hooks/use-theme-css';
import { useAppStore } from '@/store/app-context';

// Component to load theme CSS based on current theme in store
function ThemeLoader() {
  const theme = useAppStore((state) => state.theme);
  useThemeCss(theme);
  return null;
}

export const AppStoreProvider = ({
  children,
  initialState,
}: AppStoreProviderProps) => {
  const storeRef = useRef<ReturnType<typeof createAppStore>>();
  if (!storeRef.current) {
    storeRef.current = createAppStore(initialState);
  }

  // Initialize Strudel once when the app starts
  useEffect(() => {
    console.log('Initializing Strudel audio engine...');
    initStrudel();
    samples('github:tidalcycles/dirt-samples');
  }, []);

  return (
    <AppStoreContext.Provider value={storeRef.current}>
      <ThemeLoader />
      {children}
    </AppStoreContext.Provider>
  );
};
