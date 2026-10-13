import presets from './tweakcn-themes.json';

export const themes = presets.map(preset => ({
  value: preset.name,
  label: preset.title,
  color: preset.light.primary,
}));

function declarations(variables: Record<string, string>) {
  return Object.entries(variables).map(([key, value]) => `--${key}:${value};`).join('');
}

export const themeStyles: Record<string, string> = {};

for (const preset of presets) {
  themeStyles[preset.name] = `:root{${declarations(preset.light)}}.dark{${declarations(preset.dark)}}`;
}

export const themeNames = themes.map(theme => theme.value);
