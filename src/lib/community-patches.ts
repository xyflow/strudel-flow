import { stateFromJson, type ProjectState } from './project-state';

export type CommunityPatch = {
  id: string;
  name: string;
  author: string;
  description: string;
  state: ProjectState;
};

// Exported patch files can be contributed without editing a registry.
const files = import.meta.glob<string>('../../patches/*.json', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const communityPatches: CommunityPatch[] = Object.entries(files)
  .flatMap(([id, json]) => {
    const state = stateFromJson(json);
    if (!state) return [];
    const { name, author, description = '' } = state;
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof author !== 'string' ||
      !author.trim() ||
      typeof description !== 'string'
    )
      return [];
    return [{ id, name, author, description, state }];
  })
  .sort((a, b) => a.name.localeCompare(b.name));
