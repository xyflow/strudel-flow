import { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export function PresetPopover() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [loadedPreset, setLoadedPreset] = useState<string | null>(null);

  const presets = [
    {
      name: '🎼 Funky Beat',
      description: 'Complex pattern with modifiers',
      url: 'http://localhost:5173/?state=N4Igdg9gJgpgziAXAbVASykkAHAhlAOWhgH0BGEAGhClwBdclQ606AbGLABXwAIjYVEGgDGEMFgDK2NmjCdqcujABOYXG0kNlTEHGXYEiACzUAtsSwiAFhBWZqEEQwBunRAGZqcGB2cwoAGkYAE8sAGEhHz9lKEkRDRgAFRDsdxAzXAArOyEAcxUMJGRkOhUAVxhKADMNH0oyypq6qtq2eraOlub2mABdSmRO1u7hnq7e8ZHJ4YGh0YXJxun65ampubGtxYndlf2%2BgZAAI3K6OnEAWWg0arRVI2AAX29fGH8oACEzi7AjZCOkGUAHEVBByoYmE9odRsBA4Kw0OJdAAPJAANgADJjqGFPNiXiA6Kl0ngoABaSCCcwwXBwcoqAK6ADuGDo1iQxnRACZqNYYGg8tY6JyyMZCdF3rEkMsXuhMIgQMy7ABrapsCDMgSkblCWgMXQsdjpSTgsBQOD8SyKMQSRXhfkiFUO94qkCEuEIljIxCgNGIADs2NxSCDmMJxLSWDguDMMhg5MlziEZlp9MZCtArKg7KQHkxZD5AqFIsQZG56OhRwCeXgxXlWBrpAo3nBKhEpPw2vIQgYKlrpaVqvVmu7uuokfSsFq5TYIqeR30FVgbHC4jueV0ZO7FF94AgyiMIGQON43L6vGQXl4AFY%2BlEEhwIh5EJkcip3dCgA%3D%3D',
    },
    {
      name: '🎹 House Piano',
      description: 'Classic house piano chords',
      url: '#', // Placeholder for now
    },
    {
      name: '🥁 Breakbeat',
      description: 'Drum & bass breakbeat pattern',
      url: '#', // Placeholder for now
    },
    {
      name: '🌙 Ambient Pads',
      description: 'Atmospheric pad sounds',
      url: '#', // Placeholder for now
    },
  ];

  const handlePresetLoad = (preset: (typeof presets)[0]) => {
    if (preset.url === '#') {
      // Placeholder presets
      setLoadedPreset(`${preset.name} - Coming Soon!`);
      setTimeout(() => setLoadedPreset(null), 2000);
      return;
    }

    // Load the actual preset
    window.location.href = preset.url;
    setIsPopoverOpen(false);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-2 rounded bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition"
          title="Load Presets"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-1">
              🎵 Try It Out! - Presets
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Load example patterns to get started or spark inspiration!
            </p>
          </div>

          <div className="space-y-2">
            {presets.map((preset, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{preset.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {preset.description}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={preset.url === '#' ? 'ghost' : 'default'}
                  className="ml-2 h-8"
                  onClick={() => handlePresetLoad(preset)}
                  disabled={preset.url === '#'}
                >
                  {preset.url === '#' ? 'Soon' : 'Load'}
                </Button>
              </div>
            ))}
          </div>

          {loadedPreset && (
            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-sm">
              <Check className="w-4 h-4" />
              {loadedPreset}
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p className="font-mono">
              💡 <strong>Tip:</strong> Right-click buttons to add modifiers like
              repeat (x2) or slow!
            </p>
            <p className="font-mono mt-1">
              🎯 <strong>Pro Tip:</strong> Create your own patterns and share
              the URL with others!
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
