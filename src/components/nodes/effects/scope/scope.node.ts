import { defineNode } from '../../define-node';
import { ScopeNode } from './scope-node';
import { generatePattern, type ScopeData } from './scope';

export default defineNode({
  id: 'scope-node',
  title: 'Scope',
  category: 'Audio Effects',
  icon: 'Activity',
  order: 0,
  parameters: {},
  defaults: {} as ScopeData,
  component: ScopeNode,
  generate: (values, input, { scopeId }) =>
    generatePattern(values, input, scopeId),
});
