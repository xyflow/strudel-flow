import presets from './tweakcn-themes.json';
import softPopCss from './theme-soft-pop.css?inline';

export const themes = [
  ...presets.map(preset => ({
    value: preset.name,
    label: preset.title,
    color: preset.light.primary,
  })),
  { value: 'soft-pop', label: 'Soft Pop', color: 'oklch(0.7 0.15 280)' },
];

function declarations(variables: Record<string, string>) {
  return Object.entries(variables).map(([key, value]) => `--${key}:${value};`).join('');
}

export const themeStyles: Record<string, string> = {
  'soft-pop': softPopCss,
};

for (const preset of presets) {
  themeStyles[preset.name] = `:root{${declarations(preset.light)}}.dark{${declarations(preset.dark)}}`;
}

export const themeNames = themes.map(theme => theme.value);
