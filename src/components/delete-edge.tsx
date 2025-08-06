import { EdgeProps, useReactFlow } from '@xyflow/react';
import { memo } from 'react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ButtonEdge } from '@/components/button-edge';

const DeleteEdge = memo((props: EdgeProps) => {
  const { setEdges } = useReactFlow();

  const onDeleteEdge = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== props.id));
  };

  return (
    <ButtonEdge {...props}>
      <Button
        onClick={onDeleteEdge}
        size="icon"
        variant="secondary"
        className="h-8 w-8 rounded-full border hover:bg-muted transition-colors"
      >
        <X size={12} />
      </Button>
    </ButtonEdge>
  );
});

DeleteEdge.displayName = 'DeleteEdge';

export default DeleteEdge;
