import { useEffect, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { useAppStore } from '@/store/app-store';
import { copySelectedNodes } from '@/lib/node-clipboard';
import { codeToNodes } from '@/lib/code-to-nodes';
import { generateOutput } from '@/lib/strudel';
import { findConnectedComponents } from '@/lib/graph-utils';
import { serializeLiteral } from '@/lib/strudel-calls';
import { nodeDefinitions, type AppNode } from '@/components/nodes/registry';

function editing(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"], [role="dialog"]',
      ),
    )
  );
}

export function useNodeClipboard() {
  const { screenToFlowPosition } = useReactFlow();
  const [error, setError] = useState('');
  useEffect(() => {
    const copy = (event: ClipboardEvent) => {
      if (editing(event.target) || window.getSelection()?.toString() || !event.clipboardData)
        return;
      const state = useAppStore.getState();
      const selection = copySelectedNodes(state);
      if (!selection) return;
      try {
        const fragment = selection.nodes.every((node) =>
          nodeDefinitions[node.type]?.category === 'Audio Effects' &&
          node.type !== 'samples-node',
        );
        let code = generateOutput(
          selection.nodes, selection.edges, state.cpm, state.bpc,
          { clipboard: true, fragment, includeTempo: !fragment },
        );
        if (!fragment) {
          const selectedIds = new Set(selection.nodes.map((node) => node.id));
          const connectedIds = new Set(
            findConnectedComponents(state.nodes, state.edges)
              .filter((ids) => ids.some((id) => selectedIds.has(id)))
              .flat(),
          );
          const setup = state.nodes
            .filter((node) => connectedIds.has(node.id))
            .flatMap((node) => {
              const samples = node.type === 'samples-node'
                ? `samples(${serializeLiteral(node.data.source ?? node.data.sampleMap)});`
                : '';
              return [samples, String(node.data.setup ?? '')].filter(
                (item) => item && !code.includes(item),
              );
            });
          if (setup.length) code = [...new Set(setup), code].join('\n');
        }
        if (!code) throw new Error('The selected nodes do not produce a pattern.');
        event.clipboardData.setData('text/plain', code);
        event.preventDefault();
        setError('');
        if (event.type === 'cut') {
          const ids = new Set(selection.nodes.map((node) => node.id));
          useAppStore.setState({
            nodes: state.nodes.filter((node) => !ids.has(node.id)),
            edges: state.edges.filter(
              (edge) => !ids.has(edge.source) && !ids.has(edge.target),
            ),
          });
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Could not copy nodes.');
      }
    };
    const paste = (event: ClipboardEvent) => {
      if (editing(event.target) || !event.clipboardData) return;
      const code = event.clipboardData.getData('text/plain').trim();
      if (!code) return;
      event.preventDefault();
      try {
        const state = useAppStore.getState();
        const selected = state.nodes.filter((node) => node.selected);
        const fragment = code.startsWith('.');
        if (fragment && selected.length !== 1)
          throw new Error('Select one node before pasting an effect chain.');
        const anchor = fragment ? selected[0] : undefined;
        const point = anchor
          ? {
              x: anchor.position.x + (anchor.measured?.width ?? 300) + 100,
              y: anchor.position.y,
            }
          : screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        const placeholder: AppNode = {
          id: nanoid(), type: 'expression-node', position: point,
          data: { state: 'running' },
        };
        const graph = codeToNodes(
          placeholder, fragment ? `__flow_input__${code}` : code,
          [placeholder], [], Number(state.bpc) || 4,
        );
        const sentinel = fragment
          ? graph.nodes.find((node) => node.data.expression === '__flow_input__')
          : undefined;
        if (fragment && !sentinel) throw new Error('Could not attach this effect chain.');
        const nodes = graph.nodes
          .filter((node) => node.id !== sentinel?.id)
          .map((node) => ({
            ...node,
            selected: true,
            position: fragment
              ? { x: node.position.x - 650, y: node.position.y }
              : node.position,
          }));
        if (!nodes.length) throw new Error('No nodes to paste.');
        const edges = graph.edges.map((edge) =>
          edge.source === sentinel?.id ? { ...edge, source: anchor!.id } : edge,
        );
        const sinks = nodes.filter(
          (node) => !graph.edges.some((edge) => edge.source === node.id),
        );
        if (fragment && sinks.length !== 1) throw new Error('Paste a single effect chain.');
        const existingEdges = state.edges.map((edge) =>
          anchor && edge.source === anchor.id ? { ...edge, source: sinks[0].id } : edge,
        );
        useAppStore.setState({
          nodes: [...state.nodes.map((node) => ({ ...node, selected: false })), ...nodes],
          edges: [...existingEdges, ...edges],
          ...(graph.cpm ? { cpm: graph.cpm } : {}),
        });
        setError('');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Could not paste this pattern.');
      }
    };
    window.addEventListener('copy', copy);
    window.addEventListener('cut', copy);
    window.addEventListener('paste', paste);
    return () => {
      window.removeEventListener('copy', copy);
      window.removeEventListener('cut', copy);
      window.removeEventListener('paste', paste);
    };
  }, [screenToFlowPosition]);
  return { error, dismiss: () => setError('') };
}
