import { AudioLines, Piano, SlidersHorizontal } from 'lucide-react';
import nodesConfig from '@/components/nodes/registry';

// App-specific menu content lives here. The reusable UI in components/ui/radial-menu
// receives labels, icons, children, and selection callbacks; it knows nothing about nodes.
export const radialMenuItems = [
  { label: 'Instruments', category: 'Instruments', icon: Piano },
  { label: 'Sounds', category: 'Synths', icon: AudioLines },
  { label: 'Effects', category: 'Audio Effects', icon: SlidersHorizontal },
].map((category) => ({
  ...category,
  items: Object.values(nodesConfig).filter(
    (node) => node.category === category.category,
  ),
}));
