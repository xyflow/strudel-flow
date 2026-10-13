import {
  isValidElement,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactElement,
  type Ref,
  type ReactNode,
} from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from './context-menu';
import { MenuContext, PositionContext, menuChildren } from './context';
export { RadialMenuItem } from './radial-menu-item';
export { RadialMenuSubItem } from './radial-menu-sub-item';
import './radial-menu.css';

export type RadialMenuHandle = {
  openAt: (
    position: { x: number; y: number },
    fromConnection?: boolean,
  ) => void;
};

export type RadialMenuProps = {
  menuRef?: Ref<RadialMenuHandle>;
  children: ReactNode;
  trigger: ReactElement;
  onPositionChange?: (position: { x: number; y: number }, fromProgrammaticOpen: boolean) => void;
  isTriggerTarget?: (target: HTMLElement, trigger: HTMLElement) => boolean;
  openOnTouchTap?: boolean;
  ariaLabel?: string;
  hoverDelay?: number;
};

export function RadialMenu({
  children,
  trigger,
  onPositionChange,
  menuRef,
  isTriggerTarget = () => true,
  openOnTouchTap = false,
  ariaLabel = "Radial menu",
  hoverDelay = 50,
}: RadialMenuProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const fromHandle = useRef(false);
  const touchTap = useRef<{ x: number; y: number; moved: boolean } | null>(
    null,
  );
  useImperativeHandle(
    menuRef,
    () => ({
      openAt: ({ x, y }, fromConnection = false) => {
        fromHandle.current = fromConnection;
        try {
          triggerRef.current?.dispatchEvent(
            new MouseEvent('contextmenu', {
              bubbles: true,
              cancelable: true,
              clientX: x,
              clientY: y,
            }),
          );
        } finally {
          fromHandle.current = false;
        }
      },
    }),
    [],
  );
  const allowOpen = useRef(true);
  const [open, setOpen] = useState(false);
  const [openedFromHandle, setOpenedFromHandle] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const items = menuChildren(children);
  const [viewport, setViewport] = useState({ width: 1024, height: 768 });
  useEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const compact = viewport.width <= 640 || viewport.height <= 500;
  const size = Math.min(
    compact ? 280 : 380,
    viewport.width - 16,
    viewport.height - 16,
  );
  // Radix anchors at the pointer's bottom-right. Center the circle and keep it onscreen.
  const left = Math.max(
    8,
    Math.min(position.x - size / 2, viewport.width - size - 8),
  );
  const top = Math.max(
    8,
    Math.min(position.y - size / 2, viewport.height - size - 8),
  );
  const rememberPosition = (x: number, y: number) => {
    setOpenedFromHandle(fromHandle.current);
    setPosition({ x, y });
    onPositionChange?.({ x, y }, fromHandle.current);
  };

  return (
    <ContextMenu
      open={open}
      onOpenChange={(value) => {
        if (value && !allowOpen.current) return;
        setOpen(value);
        if (!value) setActiveId(null);
      }}
    >
      <ContextMenuTrigger
        ref={triggerRef}
        asChild
        onPointerDownCapture={(event) => {
          // Capture before the host surface consumes touch gestures.
          touchTap.current =
            openOnTouchTap && event.pointerType !== 'mouse' &&
            event.isPrimary &&
            isTriggerTarget(event.target as HTMLElement, event.currentTarget)
              ? { x: event.clientX, y: event.clientY, moved: false }
              : null;
        }}
        onPointerMoveCapture={(event) => {
          const tap = touchTap.current;
          if (
            tap &&
            Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 8
          )
            tap.moved = true;
        }}
        onPointerCancelCapture={() => {
          touchTap.current = null;
        }}
        onClickCapture={(event) => {
          const tap = touchTap.current;
          touchTap.current = null;
          if (
            !tap ||
            tap.moved ||
            open ||
            !isTriggerTarget(event.target as HTMLElement, event.currentTarget)
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          triggerRef.current?.dispatchEvent(
            new MouseEvent('contextmenu', {
              bubbles: true,
              cancelable: true,
              clientX: event.clientX,
              clientY: event.clientY,
            }),
          );
        }}
        onContextMenu={(event) => {
          const target = event.target as HTMLElement;
          if (
            target !== event.currentTarget &&
            !isTriggerTarget(target, event.currentTarget)
          ) {
            event.preventDefault();
            return;
          }
          allowOpen.current = true;
          rememberPosition(event.clientX, event.clientY);
        }}
        onPointerDown={(event) => {
          if (event.pointerType === 'mouse') return;
          allowOpen.current = isTriggerTarget(event.target as HTMLElement, event.currentTarget);
          if (!allowOpen.current) return;
          rememberPosition(event.clientX, event.clientY);
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (
            event.key !== 'ContextMenu' &&
            !(event.shiftKey && event.key === 'F10')
          )
            return;
          event.preventDefault();
          const bounds = event.currentTarget.getBoundingClientRect();
          event.currentTarget.dispatchEvent(
            new MouseEvent('contextmenu', {
              bubbles: true,
              cancelable: true,
              clientX: bounds.left + bounds.width / 2,
              clientY: bounds.top + bounds.height / 2,
            }),
          );
        }}
      >
        {trigger}
      </ContextMenuTrigger>
      <ContextMenuContent
        aria-label={ariaLabel}
        className="radial-menu"
        data-from-handle={openedFromHandle || undefined}
        loop
        avoidCollisions={false}
        onClick={(event) => {
          if (!(event.target as Element).closest('button')) {
            setOpen(false);
            setActiveId(null);
          }
        }}
        style={{
          width: size,
          height: size,
          transform: `translate(${left - position.x - 2}px, ${top - position.y}px)`,
        }}
      >
        <div className="radial-menu__body">
          <MenuContext.Provider value={{ activeId, activate: setActiveId, hoverDelay }}>
            {items.map((item, index) => (
              <PositionContext.Provider
                key={isValidElement(item) ? (item.key ?? index) : index}
                value={{ index, count: items.length }}
              >
                {item}
              </PositionContext.Provider>
            ))}
          </MenuContext.Provider>
          <button
            type="button"
            className="radial-menu__close"
            aria-label="Close menu"
            title="Close menu"
            onClick={() => {
              setOpen(false);
              setActiveId(null);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
}
