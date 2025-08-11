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
      description: 'Preset by Abbey @ xyflow',
      url: '?state=N4Igdg9gJgpgziAXAbVASykkAJARgYQBFcBZXAD1wgEUAnAKQC9cBXAGwAsAOLgQxAA0IKLwAu%2FRKFFpRbGFgBCMMQiFoAxhDBYA4rQwBmcgcEg440fMQhaLMGDRgA5qdoQA7ghTow52wFsYMFEsAAcIUIBrDUjTULFLWm0UUVsYAQAzXjY4dKycvOzcgVSWQoLMovLcgF0AXwEfPxZA4KwoWgBWTriEmCSkZHzi4fTSsbTKitGSydH6xpBHZtaQ6xg5dVSIAEZe0UTkoarZstPqi6ni8fP6hZBwuBk0LSRQciQAdgAmHYA6AAsXAMADYAJxcAGfLhgsGfAxCACeSAMBn%2B4M6IJBPC4AAYQTsYQCGiBRIjQlYQLhlKIALT%2BXjqDiOGC0yCwUyBXhwFi0GCYSQgdwYUQcJCdMHfIQcGBoJwcNbfMEgkm5TaWAU3YS0XhOJyOFyIUYNdACkAAGQAyv4QaIdGgMmwHEkAOqEACqUC4LAASv5TCJxG9STI5FgAAoQNiI2gcRGi%2F1qTTJC28RH9VRmCyU2z2A1xKOIy0QOxQPbWXCYIThaPF0vfLBwKsPQt1sBQEzWDhi6uF8N9JLlkAwFjqNgYZRgAAUCK4AEp9ocdgBBLZoABuVnGJMez1ego%2BiE6uIBfzBnWBGIBAJPBjBSKQtN%2BYL%2BuK4nWhYOvEq4OxJZIpMJC1jeMOH8NloHkIQuR5PkBVAYUoFFFEARBaVZXlNYAQMLhVQ2GAtn5JAZm1XV9WcYiqhNJYzScFh3DYchGAAOQAUQ0MBzQUEF3WoUR13UAF1ADMQJCkUNKX7bQk33EASAgTdTHMMQczsBwKOrXgU1xP4QR6HcICeaR93ecVsN075IW%2BTEDG%2BcEdh2B9EE%2BKFdL0glvk%2BT5cR2CFOn%2FclKXiMAII5aDlFgojBUQ5DEAMVD0LlBUkG%2BE88PVKKSI6Mj8yNKjFgwLAAGlqFY5c2AUTpmPUdcABUAC1vgyAxlzQEhmIUkSg0FaRZEkrTTA0WT5MUoRlMsLBc3UlxNO0v47JAAyjJeZJTMQb5XJ2D9YUxXyfi%2FBEQGRI9bPmwktpc3ydhBAFvgCwDrGC0KoJAGDeSihCRTFOKEpAGUksVNKxvwwiBSynU9Vy40CrNQhOgAKwMABHddsAATXDQhmO%2BEgADFsHNT5mIySJ4a6sSQz6rBl1oClIbECBaEG5MsHq3hQiU7NJrU%2FNgYyqB%2BwOfoUygDwQpYDm%2BYIjV8A4RmoFqwKsH8RxGaUkGNSKmBjpAQgAGJTAgLZeEUxAASEI3xE3H0tKcKw7t7ZaTJAQ9aSBb5XyBLyQVRT4CXhT4nKfD3cU6OzUM6c6dlS%2FyhAAyleFpmB6dERnns5CL3vgoUvpQtC%2Fow5L1q4FUpdByiKlIyGKLygpqMKrtOgAeVCABJNiADUO44WrmI7pwAH13WpWlapdcng16sNrH7ZshpTS1QnHMAXvG1S8w0kAnH0AVkGQG4ZkPk4ZgP4%2BqhqARjmmE5T%2Bvu%2BRhvtIL6vh%2F78uW%2FX8%2FmBn6PioP8uX%2BX8f5nzflcABICgGX0AeA0B0CwHANgRAmBX94FQKQWAjBcDoEIJQVg9B2C0GIKIbgpBODkHkMwaQwhJDiEUPmNQuh%2BCmEFDIZQ2hbDIEv0YewghXCOHcJobUC%2Br1IJYCZPLQ2xtTaHVYAcLQ8koAOjQBmN46Vpb8i1jrfW6t%2BaWnUNkGAisHqvVVkzMalhQheGJI7Pcq0XZIABP8X2EIvy4m%2BAYT4DlHJHUfJHT4fx3wwh2KiKEIJPK4TjkrR6vAoDp3CtyLOwYYrfWsubAuAMHHQjUeXWuxQq7kUNNDU0WBcBN06B3NGy4ICWgUIifwy5EQQEoLVOA65I4Tx6hJLAlo2AeGZrJH0MBhTtk5ipbmG8ZpmF6e4LADYlq2ODIeAwOkIQ%2B2We%2BME114T52OpZF8H4TydGWd8E5ekHakiiVMjwcTXqZzgkk3OiAdifE6IlTCSAtqlzMBrTKJx8lQ3ysUx64ZyruG%2BLwEg8NyAAA1eDYAHk3OA6h8D0B0PwIQgYKZT0pJaREwQOCZjgCWEZ1gngr36SmWWBFIhUvULEcxYzrBTXzPM4ydjXbgj%2BBKT511QRuJvN446F4QS6QhFtN8MclSxwucYuAeLRS0jVNLG5b17nRUeVdN5Rdo5fKVTk8GOUa5FJolgSgnRW64x2JENGHVoVsChCQbEbBoUDy4B08SVNrC4vxYS4lZpcDcibImJYLNrC0ppTKOloyJpMp5hRVlK1FmPgBJHeaEJbo%2B1DvFeKgcfFm0hH8eEmJfjdBuneLgnx7qUjlfixVGsVV3I%2BjnJC31NXpPeU8uy2SNQVzydlauhSqLCP5HbLwqATXWCtDaO0DonRoFdB6L0vpwJoDgO6To2B6qIjQJEeggzarw2%2BIQcQvFJlEt5OoSkU7bT2kdM6MAbpPTej9KYcQtA7ZrCWGujdW6d17sMYe49vBT2vsubALI7AQj1zNHgIgpAKBUDoEwVgnAeC8FpK3agtJwxwCRtC2qGQO4ujgNQfACh3CfAJd8bASkSy0EvVgWDxAyCUBoAwZg7BuB8FfYnD9WBMPYdw%2FhwjxHSPkco3AajoHjHgd4JBxaMNGMEGYwhtjyHONodpHRBiTE2IcS4jxPiAkhK0YvZSJj8HWNIY46h7jcdeMwE%2FdpxiLF2LqE4txXi%2FFBLCUiTJmAEG2BQcU5O60N7Z33sfUuv0tISplQqlVGqDUmotTah1dcpn6NXrCzOu986H2LufcGt9fHrBxfKpVaqdVGrNVau1TqfnKSyfk9BrAHBm5t07t3Xu%2Fch4jzHrSbAOgiqSgBDAT4LoWBNwgPQXGnBWIKHUNgSWZg6MMcbi3durEu49z7oPYerIx48ffY5xjw3Rvjcm9N2b83FvLek01gLcmgsKaBTgc7G1LtTZm3NjgC2luhFpKU8plTqm1PqY05prT2ljTW%2BZj7Y2JvfZu39u7K2SunYrGUipVSal1IaU03ALS2l7Ea%2B0J7LWQt%2FQ61tnbPX9v9ZdED7HoO8cQ8J8TmHq2zNtZp113bvWDuj3HvZk7n7gc47B%2FjyHRPoek5lY9wLwW3tw0RijdGmNsZ4wJkTEm8NaRmotVam1EA7UOqdS6t1sOefWFV8jVGGMsY43xoTYmpNjulZdrgc1lrrW2vtZ8R1XBnWuoe%2BTpXr2J1UhZ7j8HBOock9pKEEFbAwUQqhbC%2BFiLkWovRdzrLJSY9S%2FZwnrnGPP3J9BeCyFMK4UIqRSitFYfrDNZe3UYRooYCBDEWIUIoRRzqEcKYTQvTaAKKa4nWIdQgA',
    },
    {
      name: '🏠 House Mix',
      description: 'Classic House Beat',
      url: '#', // Placeholder for now
    },
    {
      name: '🥁 Breakbeat',
      description: 'Drum & bass breakbeat pattern',
      url: '#', // Placeholder for now
    },
    {
      name: '🌙 Your Beat Here!',
      description: 'Made something cool? Share it with us!',
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
            <div className="flex items-center gap-2 p-2 bg-primary rounded text-sm">
              <Check className="w-4 h-4" />
              {loadedPreset}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
