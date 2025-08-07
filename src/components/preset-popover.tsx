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
      url: '?state=N4Igdg9gJgpgziAXAbVASykkB3CAnAawDMAbCbAOWhgH0AmEAGhCgEMAXVpUdtdkmFgDKATzDsAFgmZwIAVzCZEIOGjCDmaAMYQwWAMISYWgoeMEmKzu0HK8CsGoDmIAL7MADhFW9d3EAAeSAAMzCJIAGzBwe4g7CIetiqsALYeAgC0cDACWuyWKTCscHJ4MEqg2BiSSACMAJy1zEZoThL5iLV0EbHZuTZKRKwk2e7oSiAAEgBG%2BgAi0wCy0wHTEACKeABSAF7TciQSABxHXMxsnP68%2FEkAQkXs0iDafsoA4ngYAMwBX5Zw1iS9jAjjALmYeHICBQ6DAAPshXEWC8HgI2gsng4NjwehQ7HsMEYQxGhOJ2SJw3J%2BLkpMptJJFJJAF0xs84dTER0WHgAKw8yweLEwHFIZBk%2BlUgmMakS2XSqXilmMWHwuScrA5Yz4iC1AVCkUocXymnGuVGo0y00spUgLw%2BNCvUBBRAAdjotQAdAAWI5fCL1I5el1Her1F1fMJIL5fT3%2BnkRCInI7BCK1ENe2LxRJYaYPDIpVhaCRqGAZSCwApFEplCo4aoSJA8%2Bp0ZowVrtJB0eo9GSavLlJCW7msJxOZxIcWsjBYAAyQhSEXYbzQpEcOIA6nMAKpQI5yABKKUsFy4iB4fAEWAAChASCI8BIRJIj5odLiQDPWCJhU8ARwgQ446eLeIhCPIii6so0yYMBd5gQoUAMMocAwbaIHwYofzKBIDawSIV76mAkEgDAchaCQGBFGAAAUEZHAAlHq7DYkRACCeRoAAbrYMqxHafAOriTqNsEXoevUPK%2BnGXpeqJXz1JGiAZO69QesERw8sG9QyU2Ry1JmCRJF4d4Pk%2BEgpGW1CVsUpQDmedZQDUiBfF6EStu2HRel8Ry9H2AwTnS5x4COY5ggFJJThMThyNgJABDsFAAKLaGAM63BEW7rOwnFaF6WjHhwp7njc16sHor6vCAiwQNx%2FyAlgwKguCtplVgwQehE%2FJ8d4AmOoEjZeR1dCBnQ8ZfN0jRNCA4SukGHWdamdAui6wQNBpBnZsogpgJZFbMIUNk1v4VSOQ2zmue5bQdHQom%2Bf0dlGsOo7jogk7Ks8EwANLrIlrEkLcPIUFonEACoAFp0EQXysWgixUJxBWXPZ1yXsoBHlc8b5YNVtUyPVdiAWFmLvu13RuMB9p9c6dBzbUmmhvGDRutpEbTY240eu6emaV6DS1BEXp0BtRllbtGggAd1Z2ZU9ZRhdIAtFdna3b292DIFT2hS4r10pFWBzDyABWXwAI6cZMACaV5zBQdCLAAYpMM4uhQRAEIbiNFXEF5JKxeCJM9HD4JYLzvmDrAeHV%2F4NYTzV9Fq5QEcxwrvlA5A7XIkeqwnUCGPgUAg4ZWApGowfZ%2F2UCfTAM0gHMADElgQHkrC1YgQsU71Qn9UpPp0GpPrLRE0Yuqm4Yuopyl98EPLdK5PJprUXTT8LWCsP7MCB%2Bw%2BBi9ZUu1idTkuW5CttkrbdHD2Kh%2BQ9GtQMFz1hTrEXvdO2E8gA8h4ACSSUAGq%2FxIEGFBf5OBoFuXMGQQbrk9lcH2pVUKh2EOkEsUcbAxxBEBEAThPhKGQMgS05pAqEIZAQohdImSMDFGQkhCpqHkmIZKGkFCqEMgYXKUhrC6EwGYWw00jJ6FcP4bKHhgjeFiK4SIzhUiBHSLNBIyh4jZFCOUWwyRMj1FyKUaohRojdFaPkSwjRKi9FGMVDo%2FRFjTEGMUVYyxwjzG2McZojRajnFuOMbI1xHinHePsYY9xNi3FMgoRLKyygiz50bs3VurN9jMV0NVKAK40A%2Fm4HdHOVca713%2BNfKAQgtDDBgIXTaEtS54DqjADw0IMwd18F3Z0vMPTDwDNpYIdAvgukXlNGaGR54ug9BpEMtRoxBgiEtHyzAswiygDvfaVZbL71lm3HkXpLodkQEGCZV81bhXJJrF6b1xg5nfjyX%2BFtWIQCELcEQKRWIiAgKsEGcBOLzxgcjOByghBkGwCHLGyh9wwCqIoVBAEMFExUN8rADBuqU3qVGdqAYh5fHUk2fm4Zj4zWGqpTSokeTIroASzq7c4hF2Qt82ZEt5lHXsgfM6tQXQ8jWR0Oml944V12YSfZj9DkfSwE4OgX99xfyIGgLcXov7rHqCIZ5%2BhC5ei8G84qqMQCiHEFIf44EJjTGKChF8mNKpmBMIajEVho4EzBS4GFnd%2FDOgyILfp9QOlMxOBJca8sZqou9I6o4S0Gj1FErUGpJKSlwFSOkUsbL8hzMOtLByTk%2BZMrqN0dJ7Kn57LviFA5usQnlCcPAUURzlBzgXEuFcJA1xgE3DuPch4MhoDgFuHkkwwYiDQAQLYAKQaGzoHMTgmU47yDwFoJIxbFzLlXGgDc25dwHj1ZwPAeauT1sbc21t7bO3dt7awftlgplYFgEMA4%2BQ9bKBmPMJYKw1ibF2PsQ4JxWAZAlRkK8cATYAA0QZEF%2FuuOA6x9C3GwC6KQdBJgatKMOrAZ6FjLFWBsbYewDjHFOLutei6sBPpfe%2Bz937f3%2FsA8B0DkzSUsBgIekgx6X4TCgxe2D16EN3tOBkaKsV4pJRSmlDKWUcp5TA0OpI1GYNXvg7epDZw4ioZgFyZjcUErJS0KldKmVsq5XykRkpB7WBHvJoWj884x1lorVWmdtbvq%2FX%2BoDYG4NIbQ1hvDXjEGi16dLROqd1bZ0oYXZJrApm%2FoAyBqDCGUMYZwxqru4jGmtMnpAIcPAb69L7g8HMbAX8v4yXttgNodA3iTAyLgQgpByBUFgPQezSQYtxdqAlpLKW0sZYkFlwj4nPNcjy8Qb5RXaAMDU0kCL5HtO8rfp%2FH%2BiV%2F6AOAaA8BpYoEZEmG8T6zYvQwBdOuOQ78IBbHtocRKtwtCTCzioQdDmFYf2%2Fn%2FABQCQFgIgVAjzaHT1zYW0tlba2NtbZ23tsL6nSOab61F2b82aZPdW%2BtzbEhtu7Y8BkaYJyzkXKuTcu5DzphPJebqGQh3%2BMPcB8t4Hr2wfvf2%2FOu7IBoenPOZc65tz7mPOea87r%2B7vuRco8csncPKeI5p6j3L%2BA2uFeoCV9H4Gkik9hxThH1Pke07R014nrWCuUH5114NPXGe%2FeZ4N07I3zvjau1N9cUOYfk%2Fh1TpHKO6cHaF1gCQJ3hujYuxN670DJkSa5CLo37OJdm%2Bl3u5QvWKM6YNsbM2ltra2wdk7F2btDZMYFUKkVYqJVSplXKhVgu%2BP6yNqbc2VsbZ20ds7V27tbteeUPywVwrRXisldKzisqRDyogJ9lXZHj0hMkDAQoWACnsA8B4MiWg1CWB0GQPAiSetrwsK4IAA%3D%3D',
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
