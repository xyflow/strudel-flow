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
      url: '?state=N4Igdg9gJgpgziAXAbVASykkAJARgYQBFcBZXAD1wgEUAnAKQC9cBXAGwAsAOLgQxAA0IKLwAu%2FRKFFpRbGFgBCMMQiFoAxhDBYA4rQwBmcgcEg440fMQhaLMGDRgA5qdoQA7ghTow52wFsYMFEsKFpTAAcxS1ptFAAzXjY4GAFRW1TE5MyklIEsvPSWVKKSjIBdAF8BHz8WQODQ2gBWZsjomFikZAKc7LSMgeL83L7Cwd6qmpBHOoaQ6xg5dXSIAEZ20Ri4ntGhsuHekf6j0v2qqZAIiDgZNC0kUHIkAHYAJjWAOgAWLgMANgAnFxvi8uIDAS8DEIAJ5IAwGL5A5r%2Ff48LgABn%2Ba3B32qIFEMIiVhAuGUogAtP5eOoOI4YBTILBTIFeHAWLQYJhJCB3BhRBwkM1AW8hBwYGgnBwFm9Af98SllpZuUdhLReE4nI4XIhetV0NyQAAZADK%2Fn%2Boh0aHibAcsQA6oQAKpQLgsABK%2FlMInEjwJMjkWAAChA2DDaBwYQKvWpNHFjbwYZ1VGYLCTbPZtZFQzCTRA7FANtZcJghNcw3mC28sBx8ylsxX82AoCZrBxBWWc0GOrEiyAYCx1GwMMowAAKaFcACUm22awAgis0AA3KxnK5dntgauLQfD2C8cffARrN4zstbt6L6SrpClfHXW7SB4856IZoY76fQHNP7I77fJ%2BBiArCSAUh8gKfBiXDNGCgIAcKXBrPihLElg5bhpG0aMtA8hCKy7KctyoB8lAArwt8%2FxihKUoLN8BhcAqSwwCsXJIKqYQalqzjsaM%2BozIaTgsO4bDkIwAByACiGhgEaCj%2FE61CiMu6jfOo3piBIUgBiS3baLGL4gCQEC3kI5hiOmdgODxF7xhinz%2FG0D43HcL5PEK9EOW8IJvCiBhvECaxrKBiAvKCDmOdibwvC8GJrMCzQoUSJJRGAOHMvhyiEWxPKkeRiAGJR1GStKSBvJ%2BTFKjlHHqpqWa6nx0wYFgADS1CSfObAKM04nqMuAAqABabzxAY85oCQ4kmRpvo8tIsi6YepgaIZxmmamFlYBm1kuLZWD2QFIDOU%2B9xxO5iBvOFaywRCKLxe88HQiAcLvv5nwfEhsHfPFaz%2FN8bxJWh1ipeleEgARHI5SR%2FKCgVRUgOKJUyhVZnMaxKp7GqXH1XqTWGoQzQAFYGAAjsu2AAJpBoQ4lvCQABi2BGi84nxAA1oTM1af6C1YPOtDEnVYgQOEBnxoNvARKY5mWFtVlZqjVVQN2WydPGUAeGlLBS4rLHKvgta0FA%2FXJVg%2FiOCL0to8qLUwC9ICEAAxKYEArLwt6IMeICu%2BIq7uoeThWADnYnW5IBvhSvxvFBvwxf8CIvNiUIvCF4HRxizQBZRzQ4kF5WJUIqEkrwAswELogi6DLJZZDxG8jDFFUQjNGlRdXDyrr6O8f0WN1TxDXZPxzVts0ADyEQAJJSQAatPHD9eJ09OAA%2Bk6ZIUv19pc3682BtY3aljMcZYCaETDmAYMy5ZmY2SATj6NyyDIGcRyv3spwTO%2FozlAIuwnHsL8v7%2F2AeMYoP8%2F55DfiAg4YxYHHBSOAqBoC4FIJQd%2FX%2BqD4FoOgVgrBiCgGQIIdgwh0D8E4MwRQohZCSE0OIXQvBGCiG4MoeQ9BED6EsNoQw9hzCmGcNgdQjhfDhHZEEbw1hEjaFiP4eIrhkxGGSKEYo6RIi5GqJgOUH%2B4NcJYFpCLQ%2BPt3ZWCeqwLYWhjJQGtGgZMjxKp6y5Lbe2TsrZKxNOoJIMATZA3BhbUWqYYARC8F7TQbB6hgAsVYmxPIixSFNtYfw0BIl%2BOXEkYoWAAD0JhKjZJDq5M64ckDfU%2BAnYE8EMRvAMC8IKwVnpgRzi8T4MFwRrARKCf40VGKFziVcXgUAq6ZTZLXP0eVYa%2BS9ojWihSwR2K7gPPIvduI6lxgaLAkkJ4YnnO4Ceo9eCEEYMvCkOgTRGnMDCCmCgnTbzmjpE%2BvB%2FBn3gNLJshpbgX2WsfawBsWJsy%2BeoNm0s0xyxvi4Y6eS%2FQR2is0KCzR%2FLlMKgFdpzQQqwWjh%2BH8gJgKXSCpRQGJI4B3IeRSRUet%2BngxrkRYZDcLqfmKpMxAp4O5mGttVTGnE%2B5LL4lorkgcvCoAElgU05pLTWltGgB0zpXQen8BSNAcAnTNGwINGEaA2b0HdJ4wmbxCDiEUrtMw%2BZaDqBJIKi0VobR2jAI6F0bpPSmHELQQOCwZhyoVUqlVaqNVap1dQPVRdQgwESOwEIQ9DR4CIKQCgVA6BMFYJwHgvAKQT2oBSIMcASYAA1%2BrxGnvaOA1B8AKHcC8DgcA3jYCeRyI1WAw3EDIJQGgDBmDsG4HwO1JdHVYCTSmtNmbs25vzYW4tpby1dO8bAQNbBg142rQQWtkaG0xubfGikQkRJiSkjJOSCklIqTUhWw1JIa0RvrdGptcbW2F3bTAJ1q7RISWkuoWS8lFLKVUupUdJJx28CDUdad1gTXCvNWKy1EqbXSrah1LqPU%2BpDRGmNCaU1lz7qrf%2Bs0pqRUWqtZK21l6HXXtau1Tq3VeoDWGqNcak1pofv9ROqdKyR7jynpJWe89F4rzXgyTeFJsA6BaiKb4MAXj2hYKPCA9B6acEkgodQ2Adb6srSSDgY9J4zzngvJeq916bzbXhp1PG%2BOXUE8J0T4nJPSdk3a7pX6f0hurbx%2FjRmRNiYkxwKTMmIgUlwKPZo08KbzggCaBQMJ%2FDzhhBASg%2FU4DLhzshw99nDNCac6Z1z5m5P2o7cWbzvn%2FOBeC6F8LuBIvRY2NR6w1nJ2%2FvowjZTTGWPqfY1p%2B0nmst%2BYC0FkLYWItRZi2ZA1KHquMdU6xjTHGN5b1wxl0kLWcvtfy114rlmx0Bu%2FRV2z1gCbEzJpTamtMGZMxZuzQmFI1kbK2TsvZByjknMJOcy5vWFNYA26TcmVMaZ00ZszVmHMdOTZO5s7Zuz9mHOOac27i3P3LZs3%2BqbPnWu5Y6wVorOdjvrP%2B%2BdoHV3QcXNi1gLzsOZt5c64V7rJWCRXqdX9s7gPLsg5u9j0rwhIereh0pwbzG1Nsc05xprlOAcXeB9ds59P5MHprDVob9WudjZ%2B%2Fh6wvP0c08F2Dhn5Xg1aIFDAQIuixARAiIOdQjhTAhJFhYz9Jd%2FlCHUBEL01gqmmFwBEdS1hqyVCAA%3D%3D',
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
