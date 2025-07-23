import { Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function AppInfoPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="p-2 rounded bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition"
          title="App Instructions"
        >
          <Info className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-96 overflow-y-auto" align="end">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">🎵 Flow Machine</h3>
            <p className="text-sm text-muted-foreground">
              A visual music creation tool that generates Strudel live coding
              patterns through an intuitive node-based interface.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">🚀 Getting Started</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>
                • <strong>Add Nodes:</strong> Right-click on canvas or drag from
                sidebar
              </li>
              <li>
                • <strong>Connect Nodes:</strong> Drag from output (bottom) to
                input (top)
              </li>
              <li>
                • <strong>Edit Patterns:</strong> Click buttons in nodes to
                create sequences
              </li>
              <li>
                • <strong>Control Playback:</strong> Use node headers to
                play/pause/mute
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">🎛️ Node Types</h4>
            <div className="text-sm space-y-2 text-muted-foreground">
              <div>
                <strong>Sound Sources:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Beat Machine - Drum step sequencer</li>
                  <li>• Arpeggiator - Melodic arpeggios</li>
                  <li>• Chord Pad - Harmonic progressions</li>
                  <li>• Piano Roll - Click & drag notes</li>
                  <li>• Pad Node - Scale-based patterns</li>
                </ul>
              </div>
              <div>
                <strong>Audio Effects:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Gain, Distortion, LPF, Pan</li>
                  <li>• Fast, Slow, Attack, Release</li>
                  <li>• Room, Compressor, Phaser</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">⚡ Quick Tips</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>
                • <strong>Multiple Selection:</strong> Shift+click to select
                multiple steps
              </li>
              <li>
                • <strong>Pattern Preview:</strong> Click notebook icon in node
                header
              </li>
              <li>
                • <strong>Tempo:</strong> Use BPM control (timer icon) to adjust
                speed
              </li>
              <li>
                • <strong>Sharing:</strong> Use share button to save/load
                patterns via URL
              </li>
              <li>
                • <strong>Groups:</strong> Connected nodes play together
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">🎹 Piano Roll Instructions</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>
                • <strong>Place Notes:</strong> Click on grid cells
              </li>
              <li>
                • <strong>Move Notes:</strong> Click and drag existing notes
              </li>
              <li>
                • <strong>Remove Notes:</strong> Click on existing notes
              </li>
              <li>
                • <strong>Chords:</strong> Place multiple notes on same step
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">🔗 Pattern Chaining</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Connect sound sources to effects for processing</li>
              <li>• Chain multiple effects for complex sounds</li>
              <li>• Each connection creates a new audio path</li>
              <li>• Disconnected nodes play independently</li>
            </ul>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Built with <strong>Strudel</strong> live coding engine.
              <br />
              Generated patterns use JavaScript-based audio synthesis.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
