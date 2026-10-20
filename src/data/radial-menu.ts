import { AudioLines, Piano, SlidersHorizontal } from 'lucide-react';
import { nodeDefinitions } from '@/components/nodes/registry';
export const radialMenuItems = [
  { label: 'Instruments', category: 'Instruments', icon: Piano },
  { label: 'Sounds', category: 'Synths', icon: AudioLines },
  { label: 'Effects', category: 'Audio Effects', icon: SlidersHorizontal },
].map((category) => ({
  ...category,
  items: Object.values(nodeDefinitions).filter(
    (node) => node.category === category.category,
  ),
}));
