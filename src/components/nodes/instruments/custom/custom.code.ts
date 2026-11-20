import { defineCode } from '@/model-player/spec';

export default defineCode({
  node: 'custom-node',
  kind: 'excluded',
  reason:
    'The Code node takes any Strudel a player types. Models write code too, but only code the visual nodes can produce.',
});
