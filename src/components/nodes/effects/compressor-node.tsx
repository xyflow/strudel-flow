import { useMemo } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps } from '..';
import { Input } from '@/components/ui/input';

export function CompressorNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const nodeConfig = useStrudelStore((state) => state.config[id]);
  
  const config = useMemo(() => {
    return {
      compressor: nodeConfig?.compressor || '-20:20:10:.002:.02',
    };
  }, [nodeConfig?.compressor]);

  return (
    <WorkflowNode id={id} data={data}>
      <div className="space-y-3 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Enable Compressor</span>
        </div>

        <>
          {/* Compressor Settings */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Compressor (threshold:ratio:knee:attack:release)
            </label>
            <Input
              type="text"
              value={config.compressor}
              onChange={(e) => updateNode(id, { compressor: e.target.value })}
              className="h-7"
              placeholder="-20:20:10:.002:.02"
            />
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Format:</strong> threshold:ratio:knee:attack:release
            </p>
            <p>
              <strong>Example:</strong> -20:20:10:.002:.02
            </p>
            <ul className="mt-1 space-y-1">
              <li>
                • <strong>Threshold:</strong> -20 (dB below 0)
              </li>
              <li>
                • <strong>Ratio:</strong> 20:1 compression
              </li>
              <li>
                • <strong>Knee:</strong> 10 (soft knee)
              </li>
              <li>
                • <strong>Attack:</strong> .002 (2ms)
              </li>
              <li>
                • <strong>Release:</strong> .02 (20ms)
              </li>
            </ul>
          </div>
        </>
      </div>
    </WorkflowNode>
  );
}
