# Radial Context Menu

## Use

```tsx
import {
  RadialMenu,
  RadialMenuItem,
  RadialMenuSubItem,
} from './components/ui/radial-menu';

const actions = [
  {
    id: 'files',
    label: 'Files',
    items: [
      { id: 'new', label: 'New file', run: () => console.log('New file') },
      { id: 'save', label: 'Save', run: () => console.log('Save') },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { id: 'copy', label: 'Copy', run: () => console.log('Copy') },
      { id: 'paste', label: 'Paste', run: () => console.log('Paste') },
    ],
  },
];

export function Example() {
  return (
    <RadialMenu
      ariaLabel="File actions"
      trigger={
        <div tabIndex={0} style={{ minHeight: 300 }}>
          Right-click here
        </div>
      }
    >
      {actions.map((category) => (
        <RadialMenuItem key={category.id} label={category.label}>
          {category.items.map((action) => (
            <RadialMenuSubItem key={action.id} onSelect={action.run}>
              {action.label}
            </RadialMenuSubItem>
          ))}
        </RadialMenuItem>
      ))}
    </RadialMenu>
  );
}
```
