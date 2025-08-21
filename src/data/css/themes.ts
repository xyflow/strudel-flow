// Import all theme CSS files as text
import sunsetHorizonCss from './theme-sunset-horizon.css?inline';
import boldTechCss from './theme-bold-tech.css?inline';
import catppuccinCss from './theme-catppuccin.css?inline';
import claymorphismCss from './theme-claymorphism.css?inline';
import cosmicNightCss from './theme-cosmic-night.css?inline';
import doom64Css from './theme-doom-64.css?inline';
import monoCss from './theme-mono.css?inline';
import neoBrutalismCss from './theme-neo-brutalism.css?inline';
import pastelDreamsCss from './theme-pastel-dreams.css?inline';
import quantumRoseCss from './theme-quantum-rose.css?inline';
import softPopCss from './theme-soft-pop.css?inline';
import supabaseCss from './theme-supabase.css?inline';

// Map theme names to their CSS content
export const themeStyles: Record<string, string> = {
  'sunset-horizon': sunsetHorizonCss,
  'bold-tech': boldTechCss,
  catppuccin: catppuccinCss,
  claymorphism: claymorphismCss,
  'cosmic-night': cosmicNightCss,
  'doom-64': doom64Css,
  mono: monoCss,
  'neo-brutalism': neoBrutalismCss,
  'pastel-dreams': pastelDreamsCss,
  'quantum-rose': quantumRoseCss,
  'soft-pop': softPopCss,
  supabase: supabaseCss,
};

export const themeNames = Object.keys(themeStyles);
