import presets from './tweakcn-themes.json';

export const themes = presets.map((preset) => ({
  value: preset.name,
  label: preset.title,
  color: preset.light.primary,
}));

function declarations(variables: Record<string, string>) {
  return Object.entries(variables)
    .map(([key, value]) => `--${key}:${value};`)
    .join('');
}

export const themeStyles: Record<string, string> = {};

for (const preset of presets) {
  const dark = declarations(preset.dark);
  themeStyles[preset.name] = `
    :root { ${declarations(preset.light)} }
    :root[data-theme='dark'] { ${dark} }
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme]) { ${dark} }
    }
  `;
}
