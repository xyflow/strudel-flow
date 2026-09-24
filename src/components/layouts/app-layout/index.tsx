import { MenuBar } from '@/components/editor/menu-bar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <main className="h-full w-full">{children}</main>
      <MenuBar />
    </div>
  );
}
