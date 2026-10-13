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
import { getMenuSize, type MenuPosition } from './geometry';
export { RadialMenuItem, type RadialMenuItemProps } from './radial-menu-item';
export {
  RadialMenuSubItem,
  type RadialMenuSubItemProps,
} from './radial-menu-sub-item';
import './radial-menu.css';

export type RadialMenuHandle = {
  openAt: (position: MenuPosition, animated?: boolean) => void;
};

export type RadialMenuProps = {
  menuRef?: Ref<RadialMenuHandle>;
  children: ReactNode;
  trigger: ReactElement;
  onPositionChange?: (position: MenuPosition, animated: boolean) => void;
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
  ariaLabel = 'Radial menu',
  hoverDelay = 50,
}: RadialMenuProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const animateNextOpen = useRef(false);
  const touchTap = useRef<{ x: number; y: number; moved: boolean } | null>(
    null,
  );
  useImperativeHandle(
    menuRef,
    () => ({
      openAt: ({ x, y }, animate = false) => {
        animateNextOpen.current = animate;
        try {
          dispatchContextMenu(triggerRef.current, { x, y });
        } finally {
          animateNextOpen.current = false;
        }
      },
    }),
    [],
  );
  const allowOpen = useRef(true);
  const [open, setOpen] = useState(false);
  const [animated, setAnimated] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const items = menuChildren(children);
  const [viewport, setViewport] = useState({ width: 1024, height: 768 });
  useEffect(() => {
    const update = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const size = getMenuSize(viewport.width, viewport.height);
  const left = Math.max(
    8,
    Math.min(position.x - size / 2, viewport.width - size - 8),
  );
  const top = Math.max(
    8,
    Math.min(position.y - size / 2, viewport.height - size - 8),
  );
  const rememberPosition = (x: number, y: number) => {
    setAnimated(animateNextOpen.current);
    setPosition({ x, y });
    onPositionChange?.({ x, y }, animateNextOpen.current);
  };

  const closeMenu = () => {
    setOpen(false);
    setActiveId(null);
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
          touchTap.current =
            openOnTouchTap &&
            event.pointerType !== 'mouse' &&
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
          dispatchContextMenu(triggerRef.current, {
            x: event.clientX,
            y: event.clientY,
          });
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
          allowOpen.current = isTriggerTarget(
            event.target as HTMLElement,
            event.currentTarget,
          );
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
          dispatchContextMenu(event.currentTarget, {
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2,
          });
        }}
      >
        {trigger}
      </ContextMenuTrigger>
      <ContextMenuContent
        aria-label={ariaLabel}
        className="radial-menu"
        data-animated={animated || undefined}
        loop
        avoidCollisions={false}
        onClick={(event) => {
          if (!(event.target as Element).closest('button')) {
            closeMenu();
          }
        }}
        style={{
          width: size,
          height: size,
          transform: `translate(${left - position.x - 2}px, ${top - position.y}px)`,
        }}
      >
        <div className="radial-menu__body">
          <MenuContext.Provider
            value={{ activeId, activate: setActiveId, hoverDelay }}
          >
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
            onClick={closeMenu}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function dispatchContextMenu(
  target: HTMLElement | null,
  position: MenuPosition,
) {
  target?.dispatchEvent(
    new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: position.x,
      clientY: position.y,
    }),
  );
}
