import { isValidElement, useImperativeHandle, useRef, useState, type ReactElement, type Ref, type ReactNode } from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '../context-menu';
import { MenuContext, PositionContext, menuChildren } from './context';
export { RadialMenuItem } from './radial-menu-item';
export { RadialMenuSubItem } from './radial-menu-sub-item';
import './radial-menu.css';

export type RadialMenuHandle = { openAt: (position: { x: number; y: number }) => void };

export function RadialMenu({ children, trigger, onPositionChange, menuRef }: {
  menuRef?: Ref<RadialMenuHandle>;
  children: ReactNode;
  trigger: ReactElement;
  onPositionChange: (position: { x: number; y: number }, fromHandle: boolean) => void;
}) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const fromHandle = useRef(false);
  const touchTap = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  useImperativeHandle(menuRef, () => ({
    openAt: ({ x, y }) => {
      fromHandle.current = true;
      try {
        triggerRef.current?.dispatchEvent(new MouseEvent('contextmenu', {
          bubbles: true, cancelable: true, clientX: x, clientY: y,
        }));
      } finally {
        fromHandle.current = false;
      }
    },
  }), []);
  const allowOpen = useRef(true);
  const [open, setOpen] = useState(false);
  const [openedFromHandle, setOpenedFromHandle] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const items = menuChildren(children);
  const compact = window.innerWidth <= 640 || window.innerHeight <= 500;
  const size = Math.min(compact ? 280 : 380, window.innerWidth - 16, window.innerHeight - 16);
  // Radix anchors at the pointer's bottom-right. Center the circle and keep it onscreen.
  const left = Math.max(8, Math.min(position.x - size / 2, window.innerWidth - size - 8));
  const top = Math.max(8, Math.min(position.y - size / 2, window.innerHeight - size - 8));
  const rememberPosition = (x: number, y: number) => {
    setOpenedFromHandle(fromHandle.current);
    setPosition({ x, y });
    onPositionChange({ x, y }, fromHandle.current);
  };

  return (
    <ContextMenu open={open} onOpenChange={(value) => {
      if (value && !allowOpen.current) return;
      setOpen(value);
      if (!value) setActiveId(null);
    }}>
      <ContextMenuTrigger
        ref={triggerRef}
        asChild
        onPointerDownCapture={(event) => {
          // Capture before React Flow consumes the gesture for canvas panning.
          touchTap.current = event.pointerType !== 'mouse' && event.isPrimary &&
            (event.target as HTMLElement).classList.contains('react-flow__pane')
            ? { x: event.clientX, y: event.clientY, moved: false }
            : null;
        }}
        onPointerMoveCapture={(event) => {
          const tap = touchTap.current;
          if (tap && Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 8) tap.moved = true;
        }}
        onPointerCancelCapture={() => { touchTap.current = null; }}
        onClickCapture={(event) => {
          const tap = touchTap.current;
          touchTap.current = null;
          if (!tap || tap.moved || open || !(event.target as HTMLElement).classList.contains('react-flow__pane')) return;
          event.preventDefault();
          event.stopPropagation();
          triggerRef.current?.dispatchEvent(new MouseEvent('contextmenu', {
            bubbles: true, cancelable: true, clientX: event.clientX, clientY: event.clientY,
          }));
        }}
        onContextMenu={(event) => {
          const target = event.target as HTMLElement;
          if (target !== event.currentTarget && !target.classList.contains('react-flow__pane')) {
            event.preventDefault();
            return;
          }
          allowOpen.current = true;
          rememberPosition(event.clientX, event.clientY);
        }}
        onPointerDown={(event) => {
          if (event.pointerType === 'mouse') return;
          allowOpen.current = (event.target as HTMLElement).classList.contains('react-flow__pane');
          if (!allowOpen.current) return;
          rememberPosition(event.clientX, event.clientY);
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return;
          event.preventDefault();
          const bounds = event.currentTarget.getBoundingClientRect();
          event.currentTarget.dispatchEvent(new MouseEvent('contextmenu', {
            bubbles: true, cancelable: true,
            clientX: bounds.left + bounds.width / 2,
            clientY: bounds.top + bounds.height / 2,
          }));
        }}
      >
        {trigger}
      </ContextMenuTrigger>
      <ContextMenuContent
        aria-label="Add nodes"
        className="radial-menu"
        data-from-handle={openedFromHandle || undefined}
        loop
        avoidCollisions={false}
        style={{ width: size, height: size, transform: `translate(${left - position.x - 2}px, ${top - position.y}px)` }}
      >
        <div className="radial-menu__body">
        <MenuContext.Provider value={{ activeId, activate: setActiveId }}>
          {items.map((item, index) => (
            <PositionContext.Provider
              key={isValidElement(item) ? (item.key ?? index) : index}
              value={{ index, count: items.length }}
            >{item}</PositionContext.Provider>
          ))}
        </MenuContext.Provider>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
}
