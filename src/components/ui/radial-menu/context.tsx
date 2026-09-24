import { Children, Fragment, cloneElement, createContext, isValidElement, useContext, type ReactNode } from 'react';

export const MenuContext = createContext<{
  expanded: boolean;
  activeId: string | null;
  activate: (id: string) => void;
  hover: (id: string) => void;
  cancelHover: () => void;
  select: () => void;
} | null>(null);

export const PositionContext = createContext<{ index: number; count: number } | null>(null);

export function useMenuContext() {
  const context = useContext(MenuContext);
  if (!context) throw new Error('RadialMenuItem and RadialMenuSubItem must be inside RadialMenu.');
  return context;
}

export function usePositionContext() {
  const context = useContext(PositionContext);
  if (!context) throw new Error('Radial menu items must be nested inside their parent menu or item.');
  return context;
}

// Fragments and conditional children do not consume extra slots in the ring.
export function menuChildren(children: ReactNode, prefix = ''): ReactNode[] {
  return Children.toArray(children).flatMap((child, index) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return [child];
    const key = `${prefix}${child.key ?? index}`;
    return child.type === Fragment
      ? menuChildren(child.props.children, `${key}/`)
      : [cloneElement(child, { key })];
  });

}
