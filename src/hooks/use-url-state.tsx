import { useEffect } from 'react';
import { getShareUrl, loadFromUrl } from '@/lib/project-state';
import { applyPatch, capturePatch } from '@/lib/patch-state';
import { useAppStore } from '@/store/app-store';

export function useUrlState() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let loading = false;
    let lastPatch = '';
    const save = () => {
      clearTimeout(timer);
      timer = undefined;
      const patch = capturePatch();
      const serialized = JSON.stringify(patch);
      if (serialized === lastPatch) return;
      window.history.replaceState(window.history.state, '', getShareUrl(patch));
      lastPatch = serialized;
    };
    const load = () => {
      clearTimeout(timer);
      timer = undefined;
      loading = true;
      const url = new URL(window.location.href);
      if (url.searchParams.has('state') || url.hash.startsWith('#patch=')) {
        const state = loadFromUrl();
        if (!state || !applyPatch(state)) {
          useAppStore
            .getState()
            .setError(
              'This patch link is invalid or uses an unsupported module.',
            );
        }
      }
      lastPatch = JSON.stringify(capturePatch());
      loading = false;
    };
    load();
    const unsubscribe = useAppStore.subscribe((state, previous) => {
      if (
        loading ||
        (state.nodes === previous.nodes &&
          state.edges === previous.edges &&
          state.theme === previous.theme &&
          state.colorMode === previous.colorMode &&
          state.cpm === previous.cpm &&
          state.bpc === previous.bpc &&
          state.name === previous.name &&
          state.author === previous.author &&
          state.description === previous.description)
      )
        return;
      clearTimeout(timer);
      timer = setTimeout(save, 200);
    });
    const flush = () => {
      if (timer !== undefined) save();
    };
    const onVisibilityChange = () => {
      if (document.hidden) flush();
    };
    window.addEventListener('hashchange', load);
    window.addEventListener('popstate', load);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      flush();
      unsubscribe();
      window.removeEventListener('hashchange', load);
      window.removeEventListener('popstate', load);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);
}
