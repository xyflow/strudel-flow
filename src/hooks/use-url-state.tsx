import { useEffect } from 'react';
import { loadFromUrl } from '@/lib/project-state';
import { applyPatch } from '@/lib/patch-state';
import { usePlaybackStore } from '@/store/playback-store';

export function useUrlStateLoader() {
  useEffect(() => {
    const load = () => {
      const url = new URL(window.location.href);
      if (!url.searchParams.has('state') && !url.hash.startsWith('#patch=')) return;
      const state = loadFromUrl();
      if (!state || !applyPatch(state)) usePlaybackStore.getState().setError('This patch link is invalid or uses an unsupported module.');
    };
    load();
    window.addEventListener('hashchange', load);
    window.addEventListener('popstate', load);
    return () => {
      window.removeEventListener('hashchange', load);
      window.removeEventListener('popstate', load);
    };
  }, []);
}
