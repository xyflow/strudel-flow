import { useState } from 'react';
import { Save } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SidebarMenuButton } from './ui/sidebar';

interface SaveProjectDialogProps {
  onSave: (filename: string) => void;
  children: React.ReactNode;
}

export function SaveProjectDialog({ onSave, children }: SaveProjectDialogProps) {
  const [filename, setFilename] = useState('strudel-flow-project.json');
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    if (filename) {
      onSave(filename);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Project</DialogTitle>
          <DialogDescription>
            Enter a filename for your project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="strudel-flow-project.json"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
