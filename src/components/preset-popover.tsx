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
      url: 'https://flow-machine.vercel.app/?state=N4Igdg9gJgpgziAXAbVASykkaA2ArPAcwGMBhKAdQA8BOAawAUAZAITACMXiAWAFxAA0IKAENeIpKF5peOGFgYjMQtMQhgsAZQAOONGHkqwvGACcwInJvEnJIOCe0JE3IQFto8xCBGntgkAhicQA3LwBWITgYOWCYKABpGABPLFIA6NiTKE1iSxgAFWTtLxA3ETwIUwDCUwwkZGQAM0togRacNo6u1ph23v7Ovt5TAFc%2B7pgAXQFmgcnBnqHFiYGR8ZWZueWF3fn9nYPorb3Ds6WL1fPpmZB2Ud5edQBZaDQmtDNnUAAGAFoAEx2XjFUoQJpNEAAXyE%2FwA7MDQVhwZCYSAAIx%2FbiIkrIiHQoQAwE4sH4tH%2FH4kvGo2F%2FABsVO8cBK8QCblGOGkuk%2B1RcaMxDMQUiRTJZyjKHK5ejMSG4aKJguFuO8KOhaMyMDiUBYDyeYGcyFukBMAHFTBBRk5JFCbUJtBA4DI0Oo7FRZTR0QA6AAcdO43AAzNwfujuOi6eiA3ShKlEDRvZ6aOEASmAXSaHSAd7A3C0SDlSBtEo%2FpBYGyYCI4KNTKyhSAAO4YXgAC1lmaEzZgaEIzf4iAD6O96pimuySAWwlMIkIhH0hHHvRh6Ew3hNABEAEohACqpAYozoAC1vQA1Ol%2FADyF4AirwqNwAPoBUTiYEyORYFgV3gIFRqDSrnUUABlQAYEoWDpOi6dZuog6I%2FP6no%2FNmcIAhmNDcOECExkgAYep64SYXhdIBlm3AAmGeYinc35%2FOUxDNvoMAlp45aVtWtagI2UAtkgcI%2FD8HZdj2fZoXSw5ZLWE5QFOM5zguQxLtgK4gBQbjJHQTCEHA2r1tu3DNhQAAaJrXhe2hrgyQgvhIdbSLIpRMAwABiASqNBIDObgJjVGi9qOtI0GgLB6LouEdKeimmE%2FHSEYBj88WuCAsaoT8SHoimKEDphdLhFRBY4NoTQsWW7gVlWNYrlxTatv23DRiAnbdr2SDonCQ5RCOWoKW0k7TrOYDzogkxKfU3gXm4RkAIImgAEqMU31gAks2ABepDcHCLBoGuzkAJrEM%2BYi2VI76lGuYxuL%2B2D%2FlgzyjI6h1%2BZBgUAcFSA0O1BE%2FBRGXwQhm1wjhcEJXCnp0nCm0YX64SfXKQj5qUMmjG4fxwBaYBQNdbjlRxVUNjVSAUZEjXCS1cFphJo5SYuAjLlgF5UAkIRGTg6KmFQTB0AU1g9s8CQCSaR2vnZZ1YFNfgwHJYhVG5t3eIeIj%2BM9AXOm9ICwQOAaJnC4X1YRAbeqDJOxlhaVBuEAbhQOWbJjQ%2BWlL4JTS08pglYYZS45VdjcbxLgUUJzV9phHX2F1Y7DQMfVyYNPUwKNKmHj8dAAHLes8J4ng%2BmkULwJ4wNeOAJIQOASNZx1vg5WgY1jcseaQnbEHQDeanQ4H%2BVB6ua5biY0FGfc%2FJ9qHhsD8Gw56huW3hNA0Alg%2FiQj1FwCIbi6MxGrBGxFWcQTPG1QCluByJrWU51kkrusfTRwNQ0jbc8SEPADT094D8wA%2B6IZBapjEKURZQCnTwH8AjiFMI%2FPsDYqh0CaDgCA9ZAGwAfECReBZYAtElASF%2B2B8BEDIJQWgjBWAcC4HwP4G4njEGeAAR3YM8b0IRnKzRTuibQh4poFA3OiIWURv6%2FywLgAgJByDUHoMwNgnAeD8ARr4cBWByFBGobQ%2BhjDmGsPYZw7hIBEZYDQSIDBQgRBgDQOUCOl8E5YHXFuXc%2B4jynnPFeW894Hx%2FDUhpLSOkWB6QMsZUy5lLJf2rHw1cm4dx7gPMeM8l4bx3kfCAmRMAIGuM0tpXS%2BlDImTMhZKyWjqK6P0T4IxJjaxmLpspLAST3GpO8Rkvx54qEAFEqFuHqaQHAAYUb1jQnUDcyRmw4AAFKjACT%2FUoFSUmeLST4zJ%2FjpFgISVgBpTSWltI6V0tAPS%2BmDJAbkmA6DOQBEMcYsQxSxjx1KWNVS6lkkeK8ek3xWSyEUMUXQhhTCWFsI4Vw4ZQTLluPGbcqZtS4lzIgfIyhNCXkqPeeor5KCka7L0fsgxhTjkX1OeY7wYybmTJqQ8ia005oLWWmtDaW0dr7UOjwwJoyrmVImdU%2B5MytHxIgfima81ForXWptbau0DrbNQQi%2FJhyilovGBi7Bgi8EiMIeIkhvBLyTXZUSrlpLeUUu%2BaUARuDhEELEcQyRwLZHjSVYSzlJKeXkv5XCnRQqkUFKOaY9F5yVKM2ZqzdmnNua82bPzQWfwk6p3TpnbOTBc750LsXUumqGZMxZmzDmXMea8D5gLH4mjQHGpAIGtOGcs45zzgXIuJcy45MFXsqRDrRVIDMbcBwYxYA4FIOoD4Q1QD%2FwQe%2FT%2BdZjRP28OBbVQj8GiKIRIvgdhe3OBAMgOkAAqbgUwAAEM751TAyHkD83hSDhEQOUSovkhCWNCTYiJ9jolOLsOwb8CRVCMDED5ACGJF0AD8X1vvRG%2B19r6P1fvfZ%2Bl9AQr1iFmmgZsYhFCPDMI%2B39MH%2F2wfg5%2B8CbKzXEu5WSvlh06zo1GJjLANYwimHYHQW94EsVVLudMxUIBCqQm8LPH4i6EyfzRGC55yi3lqM%2BULIUaJFnNNae0twnSaDdN6QMoZPGhBuvjZ6pNPq%2FXprsE7CDD6sAMYBIu7gi6NNwkXTQRdoU9MHL8BeYIIgwjOABAYvwDcqhQCKAWPdstrPaCSLGEA6Q0Q5uDfmsNhbI0lrsNh3DTImJqgRp2HGWB0ZNAVfafwQg1CwNMK8Ms3hRCmDblCIAA%3D%3D',
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
            <h4 className="font-medium text-sm mb-1">🎵 Presets</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Here are some example patterns to get started or spark
              inspiration!
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
        </div>
      </PopoverContent>
    </Popover>
  );
}
