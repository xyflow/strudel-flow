import { useRef, useEffect } from 'react';
// @ts-expect-error - Missing type declarations for @strudel/web
import { initStrudel, samples } from '@strudel/web';

import { createAppStore } from '@/store/app-store';
import {
  AppStoreContext,
  type AppStoreProviderProps,
} from '@/store/app-context';

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
      {children}
    </AppStoreContext.Provider>
  );
};
