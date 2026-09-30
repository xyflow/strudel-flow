import { useState } from 'react';
import { communityPatches, type CommunityPatch } from '@/lib/community-patches';

export function PatchGallery({
  onLoad,
}: {
  onLoad: (patch: CommunityPatch) => void;
}) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const matches = communityPatches.filter(({ name, author, description }) =>
    `${name} ${author} ${description}`.toLowerCase().includes(query),
  );

  return (
    <details className="mb-4 border-t pt-3">
      <summary className="cursor-pointer rounded text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
        Community patches
      </summary>
      <div className="mt-3 space-y-3">
        <a
          href="https://github.com/xyflow/strudel-flow/tree/main/patches"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Contribute a patch
        </a>
        <input
          type="search"
          aria-label="Search community patches"
          placeholder="Search patches or creators…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="max-h-60 space-y-1 overflow-y-auto">
          {matches.map((patch) => (
            <button
              key={patch.id}
              onClick={() => onLoad(patch)}
              aria-label={`Load ${patch.name} by ${patch.author}`}
              className="block w-full rounded-md border border-transparent bg-muted/40 px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground focus-visible:border-primary/40 focus-visible:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span className="block text-sm font-medium">{patch.name}</span>
              <span className="block text-xs text-muted-foreground">
                by {patch.author}
              </span>
              {patch.description && (
                <span className="mt-1 block text-xs text-muted-foreground">
                  {patch.description}
                </span>
              )}
            </button>
          ))}
          {matches.length === 0 && (
            <p className="py-2 text-xs text-muted-foreground">
              No patches found.
            </p>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Loading replaces your current patch. Export it first if you want to
          keep it.
        </p>
      </div>
    </details>
  );
}
