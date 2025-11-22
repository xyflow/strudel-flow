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

interface SaveProjectDialogProps {
  filename: string;
  onFilenameChange: (filename: string) => void;
  onSave: () => void;
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SaveProjectDialog({
  filename,
  onFilenameChange,
  onSave,
  children,
  isOpen,
  onOpenChange,
}: SaveProjectDialogProps) {
  const handleSave = () => {
    if (filename) {
      onSave();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            onChange={(e) => onFilenameChange(e.target.value)}
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
