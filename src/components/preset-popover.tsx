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
      url: '?state=N4Igdg9gJgpgziAXAbVASykkAJARgYQBFcBZXAD1wgEUAnAKQC9cBXAGwAsAOLgQxAA0IKLwAu%2FRKFFpRbGFgBCMMQiFoAxhDBYA4rQwBmcgcEg440fMQgADrxZwYmIbQgB3BCnRhztFgFsYMFEsKFpTO1FLWm0UADNeNkcBUT8YAQSk9MzknPTUlny0lLSAXQBfAW9fAKCQ6zCAVkaIsWjY5DyMxOSCosLurMHe4ryKqpA0HwLA4KwYOXVUiABGVqiYGKROnv694ezdg5KBvorx2wg4GTQtJFByJAB2ACYVgDoAFi4DADYATi4nyeXH%2B%2FyeBiEAE8kAYDB8AY1fr8eFwAAy%2FFagz6VECiKE2KwgXDKUQAWn8vHUHCmMDJkFgpkCvDgLFoTnuIDcGFEHCQjX%2BLyEHBgaAA5hx6i9%2Fr9cY5FpZMIgusJaLwxWKpmKkHlKuglSAADIAZX8v1EOjQcTYYDQMQA6oQAKpQLgsABK%2FlMInEnOksiJAAUIGwobQOFDeV61JpYkbeFDNqozBYiXYHByhDYQ1DjRAWGAoGtrLhnJdQ3mC1AXlgOPnHBEc5XCyZrBw%2BVmc4G2pswMWQDAWOo2BhlGAABSQrgASnW7RWAEElmgAG5WPqd0PdjYxGvWQfD0e8CefAQrF6zrM93dL6RrpB9XHZ67SO6SECPRCNNGfd7%2FRo%2FIinyfD%2BBj%2FNCSBkm8%2FzvGiXCNCC%2FzAQKXArLi%2BKElg2ahuGkYcP49LQPIQjMqy7JKqA3JQLysKfL8wqihK9SfAYXBygsMBLByypHKq6qamA2o8VkeqTAaYosG4bDkIwAByACiGhgIaCi%2FE61CiCu6ifOo3piBIUgyHIWDdtoMZviAJAQPeQjmGIab2I4ZZ2HGaLvL8LRPlcNxvg8%2FIse5LxAi8SIGC8AIrCsEGIE8wLuR5mIvE8TxoisgKNOhBIOWAhGMiRyhkdxlE8nyiAGHRDHipKSAvD%2B7EKtxKphPxWo6rsokYFgADS1DyQubAKI0snqCuAAqABaLxxAYC5oCQsnWXpvrvv6xnWKZpgaBZVk2Sm9lYY5ma2MeWBueFIBeS%2BtyxH5iAvHFKwIWCSJpa8SGQiAMJfmF7xvKhCGfGlKy%2FJ8LyZZh1gublxEgKRbJFVyJW0fRIAilVUp1bZHFcUqTVqhqrXCY4HUGoQjQAFYGAAjiu2AAJqBoQskvCQABi2CGk8slxAA1uTS0GXiRlEgutCEgTYgQOE5lxuNvA2KYdmWFgfhgLagmK9jirbu0oTuDlLAK1jDVQPgda0FAo1ZVg%2FhTFLmsm11MBfSAhAAMSmBASy8PeiCniAXviGu7rHmKVhg52V2%2BR%2BkHfC8sHfMlvxwk8mIQk80VQfHaKNOFdGNFikW1RlQgYUSvBizAEuiFL0NMgV8MUYj1GleVKNo0xNVcLKxucYqbVDHxBMa0TMAk7WjQAPI2AAkgpABq88cKNsnz2KAD6TokmSo32gLfrCyZvBlltcbGjYI5gDDStEqr6vakIYr6EqyDIBuXQf0cXTv1%2FuylAIOwhjf1GL%2FIBoCRiFH%2FoA3I4DDhDB%2FmAxBjgoGf3gSApBcCYEYJQbA44qCsEEMwTAHBGC8G4PwUQkhhCyGkIoQcKhRCaHULoWMABLDyEcOwWwzhzCeGUO4bQvhTD%2BHQMYewwRXDRHCOkeI5BAjeESIUYQhhMihEUJUbIsRfDSj%2F1hkRLA1IpZlkDj7KwH1WBRC0FZKAVo0BJnuPVPuTgnYu3dg7JxUBjTqESDAK2ENYZ22limGANhPD%2B00GwAIYBrG2Pse%2BYsUhrbWH8NAWJQSVyJEKFgAA9CYco%2BTI4%2BRujHP2HwU6AiQmiF4BgniRSip9SCBcnjvHgqCFYcJgS%2FCSmxUuSTjpQDrvlFkjdORURondRo%2FsO7VT9iCRxOMB7JCHgJISuoJidWsONGAgZZI82NAufq7oXgLjpuNeenxyZindCQLq%2B8VqH2sMaKEwQODJjgPmQsWBrhX02rGLAZtOI8wBeoHmitUwqwLPfC6hTXzFM%2FGSOE8cVgQgQmBKpSUwrRTAr%2BEEtU0SpwFBi%2F44MiRwGebyMk8o%2B6DNhg3cioykaICBpVTuTLwrzP7qPIQzVh6rParopwYdPCoDElgE0ZoLRWhtHaMAjoXRuk9GSNAcAnSNGwONKEaAeb0HdL48mLxCDiHUg%2FMw%2BZaDqCJOK80lprS2gdM6V0Hpox4grmHeokwVVqo1VqnVeqDVGuoCasuoQYAJHYCEce1g8BEFIBQKgdAmCsE4DwXgZIZ7UDJIGOAVMAAao04jz3tHAag%2BAFBuCeK8l42BFZmotVgaNxAyCUBoAwZg7BuB8FMOIWgbqsDpszdmvNBai0lrLRWuAVau19NgGGtgEb1kGgbbG5tCa23Jr4GSCSUkZIKSUipNSGktI6RrWyOtUaCCNrjS2xN7aU1dtdTAd1W7pJyUUuoZSql1KaW0rpXp%2FiZ32DndC%2FUYrTTWqlXa2VDqFUER6n1AaQ0RoTSmjNOaC0VwnvNZasDkrbUyrlY6z096e2Pu6r1fqg1hpjUmtNWa81Fp%2FqJAB8NwHRVtinrPBeS8V5r03tvXeZJsA6C6oKT4MAnj2hYJPCA9BWacHkgodQ2AjamtPUSDgHG57yUXsvVeG8t50l3sR3tUbhOifE5J6Tsn5OKeU1O%2F9obAPzpA6ZkT90LNSZk3JjgCmlM2DJLgSejR550wXBAY0CgoT%2BAXFCCAlBRpwBXAXTDZ6cBmfcxJzz1mfO2ZU92kzxIgshbCxFqLMW4u4AS0ltYjGQ2zuc2x1GmmuO6d4wZne9oAtFdC%2BFyL0XYvxcS8l2ytb1PNe09xvTfHDN71Lg%2B91gXgs9dK%2F1irVXht4mnY5ljkbXYU2prTBmTMWbs05tzPmZItk7L2QctgRyTlnIuVcm5KWiRk0pjTemjNmZsw5lzXm%2FM5skfdVd3Z%2BzDnHNOecy51zbm1YaNtoDu2NPTy0zpnj%2Bn%2BOddBzdiHD3ofPbh6prDE9UctYx9NjrxnSObO2WD2792odPdh%2FZpjiOI26N5DAQIBixA2BsEOdQUxTARKltYpjFdQVCHUDYL01hammFwDYXS1gazlCAA%3D',
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
