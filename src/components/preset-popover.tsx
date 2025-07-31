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
      description: 'Preset by Abbey',
      url: 'https://flow-machine.reactflow.dev?state=N4Igdg9gJgpgziAXAbVASykkAHAhlAOWhgH0BGEAGhClwBdclQ606AbGLABXypDQDGEMFgDK2NmjCdqUujABOYXG1EN5TEHHnYEiACzUAtsSy4F2PhAEMAbpwPU4MDjZhQA0jACeWAMJ8zq7yUKICKjAAKt7YDiBGuABWEAp8AOYKGEjIyHQKAK4wlABmKs4lZUWlbOXVtZWUeYUVNTAAupTIdVUN3S3lTT2t%2FUPOHV0NgyPTfbO9leNzw0v1y%2FNrrW0dIABG%2BXR0wgCy0GjFaIp6wAC%2BTi4wblAAQvuHYHrI25DyAOIKEPldExriDqNgIHBWGhhJoAB5IAC0ACYABxIgB0ZAArNRfIgyEiMQBOJFYgAMFMpVLItxAdBicTwUARkFgfCMMFwcHyCncmgA7hg6AALJD6ABsSOowpgaDSwroSAAzGQUbSgg8Qkg%2BjQFLg0mkpGltZVbuhMIgQPyUgBrYpsCD8oiwEhIvi0BiaFjsOKiAFgKAIWRCESWvwygQ28MPG0gWngyEsGGIUDwxAIpVYgDs6KxSqRZKzWKRBKJ4rLuKQWLISvRSP0WJRRMzZAbtPpsSwcFwRgkMARGps7M53N5FtAgqgIqQpKV0tl8sV%2BKR4vV90eJuGuv1hrAxsQ3TN%2FAtIHyuAEACkAJrYACiAEUABqRLE%2FABK3gwkToxSetnd9CMCmdKsBw3C8MGyYgOIkjSHwciKMoqjqA4oDaDAQKOPEpiWuYljUNYdgOIYWjriEXh4iAAR3ME7hhBE0SdpaCTJKk1AZFkKATBsqy8aM%2FEzAsnRTCsAkiesfGLBJAmiYJPHtJ0slKdJcljNsewHMcpznJcmhkAi%2BhegyXaxHyxj5GwLASBcqQGLS%2BlkkZTEgBAxTFHGa60c8rzCB8XwQL8%2FyAlcILxhCULJqmyrirW%2BhEkSZBkuWhZEvoKJknOIB4mQNZ1kqSqFgVhVKiiWKrtQHaMvgLKmMYI48nywGTtOBiSvOcoKsqqqeZqjU6lAeoGkam7OEenF0iQABe4YAOrCgAjkisLFPySpEgAIliojCjsRwXgBnrAd6YGWutBRGEG%2FAhlgRz5JCAhxmC4VJqGUWIJmOaqiiKpYhKf1kmQlaIOKuWNii4rpUiRIoqqWZIu2xmWgN%2BRGAO%2FqBsOXINeOVpCqKiD1jiIAyh1S4EuVpFeSNRTbkNe7U2NJ4KD8uAAJLrWgfh0JERj5IkOwAILzWQOx0DsXAkAdQHMKBcRnSjl2CFBt33Y9ODPdCr0gGmkpkui%2BglfocMw%2FoZJYkSWZA3mOalQlaIWyicUEgjznI6jcDo5dHJY2OAp4zODbtYuSDkz1G4Hg0tO7vuh6UOaWAC2wWIC2%2BUAzSiNpErYfg7PaSKsxAAskIq1AetLIE%2Blgb4QBARjwddYYRlGTdqwmEVa2mCJkESesUsWhKqtiKJFuKQNw8SSrigDBaoqia0u3E%2Fy1zVbJ1T7jUTv7BNrUHnWIL9%2Bhh1qEdbgNO7DSfo1x8eWBZgAWsUEBcCiF4In4F5Zt4JC2GSPwAGoQGwHQH4UsvSy24BANg3gFDCm8CKOukFQwgAADK4G8LpMKiZNZwhnEqfQ6IyQJTKlmbEPdh7iktllJA309ZZn0PWH6K59BkCLAvLA4IoEwLgcKVGrIZDxHqr7JqW88Gj2JguPezCsRHz6pHM%2BdMY6mmvuNO%2BDxOTinIAoOgqIC5KgABJHDIE8P%2BRxQFHXAY3FIGNEE3TuoIN0mD244PTBQjEBYazmw8WSBsmU8RZinuiIk2YiqNgtqlNhloBDCisSvfh3tRwb1xlOfGqIxEk2DgTFcMiLT9UGtHBmyiTw%2FDTgLbAAhWZpAvAQOAWZ1qkC4AAeTIKzI4ABVMxMtK6WlEA6fk9coJvhgIKAMrcNaRW1oicUzCCEkMhoWQk5ZfEh0SsSA20MSqtnFI2CmlUuy9NiZjBJONmopJVLvMmZVsnU1Lnki%2Bsd46WmQReJ4LphTrT%2FlmPRKJEg%2FBtDAdaF5WYsg6RXE6IABYWBgENegKR%2BlILvrgSwjiXrOLRLWJUWYzYqiShbFhSzEBZn8QQqZ%2FimwYqxGVHZiMQB4ShYaGFCgDlryOX7ZJYp6znLFI2K5l8abyPybyxmZgszIKvGQXAAAxCVXBMXeCVNgNIpT%2BRPBgA0kFx04h%2BAKHAUUNjLR6K5KKZF2DgJpnimQdE30sxBMJWSeskoiRAw8VidEkpzbxSStsrMESQACG1cKJlAj17HK3vWMknLlxkh5bk8%2B9NBWFKwK0i8F5kHpxgK0tIei9EkC4I%2BRIbB%2BR0DvhARI6qLEgB4CIPVIATj2FGVg8ZOsjb6wdtmO1U86GAyofiRsetswsObEbIsWZSo%2BrwGAQN8TsaspaqIiNBZD40V6jkuRty42Hm2O4NI8BsgPJwPgZ0pB9LWgUHaXph7XSBABAoAQVVCDEHIHwBgCht1LitLae0joL1ugqtS2ApQLIlxpWANACRj6DCFZaM8l4bwPmfK%2BD8X4fx%2FgRHQKas0FpLRWmtTa21dr7ScNe29WBoPXjvE%2BF875PxQG%2FL%2Bf8FVzCvqwGh6awo5qLWWqtDaW0dp7SfX%2BmAAHLJ8FwCBsDjUIMJqg%2BeMjcHKOIZo8h2wCJmZsw5lzHmfNBbC1FuLSWhGeTEekzB8j8GqNIbo0%2BxjMA32qfZpzbmvN%2BZCxFmLCW%2FHXaCdwIBkTYn6ASYKDASD77T2fqdA%2BpECJE7J1TunTO2dc5sHzoXYuV7DNxBPWer9EWrMvpswnJOKc04ZyzjnPOBci5Ad2UjLzPnqCidA%2F5i0km90QAaR4Xat5kFoHyA08UuBWkNKeAodaErhRQAFl3ZBsBbA2lwJEBQSI4ASr%2FsiGa61WZXieFwNLN64htY60cLrPW%2BsDaGyNsbE3ctMctGQabMBZvzcW8t1bSJ1ube2x5uI%2F7vPCfq358DgXguqNvbgDRZAtE6IgPowxxijgImKTNUp5TKnVNqfUppLT2kGb21gEH6jNHaJRLogxRiTHXfy5aRHyOKlVJqXUnNmO2lfawD9urwHGuA8KMFyauAZoXlvCiWEEBWn6EfPNIuV4wA7GwD8eaNoEQIgaetBEaBEjimFK0%2BaCOLxvh%2BEYYUYQFAEa0ERuIvP%2BeC%2BF6L8Xkvpey%2FlxTt9SuVdq411rnXeuDdG5N9VmgtW%2Fsc%2FE81oHUmQAu9V%2BrzX2ufi6%2F14bv1r8USPn0KIRIYAyBvizGAJ4V44BgAUPNC8Noc%2BXQ9ulrAEe3fR89%2FHn3TusDJ9T%2BnzP2fc%2F58L8X0vLOatCaAw14PSAWs30tBbgXQuRdi4lyQKXMu5cK8ShAR8RgyTeAgN4FaAasxwGwESLgyCBYEF20ZkAY%2BreT9tzP%2B38%2BG%2B3bJEvlfa%2BN%2F8i3zvvfB%2Bj%2B%2Fs8333znOAvc7DyeReVIDeQ%2BS%2BR%2BT%2BQBSBQnWUwRAEHWhRCvD0S4D%2FkiD0WKBtGmzAAIAaR2CrVNwr0eWeVeXeU%2BW%2BV%2BX%2BUBWBQYzyzfVgPgMQOQNQPQMwKgGwNwPwL9zZ0DwHyayH1Dz3SAJILAPIMgKoInVwBFTFUlWlVlXlUVWwGVVVWPziCEJANIPAIoKgOoLpGszfUkNFXFSlRlVX3kKVRVTVS%2F2%2BwD37wB3%2FyCzDwMOkOMLkIVXMNVQRCTRTTTQzSzRzTzQLSLRLRUOFUMJkJMLlTcMUIsNvxAC8NTRRHTUzWzVzXzULWLVLSsNZxsN%2F0H0QGH3GicKMNkNMKiKUIaQRAgCeB3z0WQX5CxBICeFhHvFTiOCRBtBRDSGKEiBCNwikOKIiLMOiOUJoJuxcmqOwFqPqMaOaNaPaM6O6J739x%2F3%2Bz%2FxDwAL3SKPCNcIUPKIRB2FsFvFwD8Dvj0QGlZj%2Fnmm8D8H5HWieCOFhBgB2F6JpX6O2NKN2JiNGMp12EOOONOPOMuOuNuPuMeOeKyN71%2B1sLWP4O522G0AKFgDYD8GEHOH3FACZAvQoGAm%2BB3UtGQDJAAAJxQ2hCTkB9BSTkAyA2hAhwgwU%2FB9BEAWJYVaRSNYMKMENqNaM%2FxNBcS9AQACTCT9AAAqCk2kiIfwRk5k1IWkfHMHQnKHGHMnUxHEgKPEgUqUIUygYkyknEQk8NQkpEGkpwOkzVKUpIFk6gaLIrOLUrRLZLSrTQJeOuW7AhRyWkTLMLb9TQcvEZS0SEOCWkOzdTRzLTFzXTdzYCX0k8RIfIPcMCdsdDNjTDTjHDHjfDH09GLAXkFQAQNgRFBAWke%2BR%2BZ%2BV%2Bd%2BT%2Bb%2BX%2BABIBEBYCDhbwHgA4RCbEkAGAfIPMjATkMAAACjnBRAAEo%2BB6y%2FQ4yoAWydhMB6sbA0B7AuBIEGz6B5AlB%2BS8AmylAKBaRqcylac0cGdGlmlmcozeksAHFqA1CSBQCyCIDKDoDNA8JGylykF9BDT9SXycpCSiRCSswPyRMLAGkbBcB7A9ApQaULBwwrFGI4hpTfzsAKJ%2FA1YtiXCPj3C1VgI%2FU7p8YQBxQ1Z4ifDkj%2FC0igjS06zRMsANz2wZQOQsAhA4AjBBAWRSY%2BAhAHQFATg2QkZzBYxrggA%3D%3D',
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
