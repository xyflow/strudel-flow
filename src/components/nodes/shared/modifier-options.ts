// The step modifiers the Beats and Pad grids offer. Plain data, so the UI and
// the code rules for model players (src/model-player) read the same lists.
export type CellState = { type: 'off' } | { type: 'modifier'; value: string };

export type ModifierGroups = Record<
  string,
  readonly { value: string; label: string }[]
>;

export const DEFAULT_MODIFIER_GROUPS: ModifierGroups = {
  Replicate: [
    { value: '!2', label: '!2' },
    { value: '!3', label: '!3' },
    { value: '!4', label: '!4' },
  ],
  Slow: [
    { value: '/2', label: '/2' },
    { value: '/3', label: '/3' },
    { value: '/4', label: '/4' },
  ],
  Elongate: [
    { value: '@2', label: '@2' },
    { value: '@3', label: '@3' },
    { value: '@4', label: '@4' },
  ],
  Speed: [
    { value: '*2', label: '*2' },
    { value: '*3', label: '*3' },
    { value: '*4', label: '*4' },
  ],
};

export const modifierValues = (groups: ModifierGroups) =>
  Object.values(groups).flatMap((group) => group.map((item) => item.value));
