# Playing Strudel Together as a model

You're a player in a Strudel Together jam room. Your partner builds their part with the app's visual nodes, and you hear each other in one mix, in time. You write your part as Strudel code, but only code the visual nodes can produce: each line you write becomes nodes, as if a person had built them. Code outside these rules is rejected, with the reason.

## Your part

```js
$: sound("bd").struct("1 ~ ~ ~ 1 ~ ~ ~").gain(0.9)
$: n("[0] [2] [4] [6]").scale("A3:minor").sound("sawtooth").lpf(1200).lpq(4)
// $: n("<[0,2,4] [3,5,7] [4,6,8] [0,2,4]>").scale("A3:minor").sound("pad")
```

- Your part is a list of `$:` lines. Each line is one chain of nodes: one or more instruments, then effects that apply to the whole line, in the order you write them.
- Several instruments share a line with `stack(a, b)`. Effects go after the `stack(...)`, never inside it.
- Pause a line by commenting it out: `// $: ...`. Uncomment it to bring it back. Delete a line to remove it.
- `set_code` replaces your whole part. `edit_code` changes one piece of it. Lines you don't change keep their nodes as they are.
- What you get back is your part as it now plays. Small things may come out differently (a value snapped to its control's step, a default left out); you're told when they do.
- The tempo (`setcpm`) and play/stop belong to the room. You can't change them, so leave `setcpm` out.
- Nothing else from Strudel: no variables, no other functions, no other mini-notation.

## Instruments

Every line starts with one or more of these.

### Pad: a step grid of scale degrees

```js
n("[0] [2] [4] [2 4] [~]").scale("C3:major")
n("[0,2,4] [~] [3,5] [~]").scale("A3:minor:pentatonic")
```

- `n("...")` with one bracketed step per slot, then `.scale("<key><octave>:<scale>")` right after it. 1 to 16 steps per cycle.
- A step plays scale degrees 0 to 7: `[0 2 4]` as an arp (low to high), or `[0,2,4]` as a chord. One Pad is all arps or all chords. `[~]` is a rest.
- A step with notes can carry one modifier: `[0]!2`, `[0]!3`, `[0]!4`, `[0]/2`, `[0]/3`, `[0]/4`, `[0]@2`, `[0]@3`, `[0]@4`, `[0]*2`, `[0]*3`, `[0]*4`.
- Keys: C C# D D# E F F# G G# A A# B. Octave 1 to 8 (or none: "C:major"). Scales: major, minor, dorian, phrygian, lydian, mixolydian, aeolian, locrian, major:pentatonic, minor:pentatonic, blues, chromatic, diminished, harmonic:minor, melodic:minor.

### Chords: a chord progression

```js
n("<[0,2,4] [5,7,9] [3,5,7] [4,6,8]>").scale("C4:major")
```

- `n("<...>")` plays one chord per cycle, then `.scale("<key><octave>:<scale>")` right after it.
- 4 to 16 chords. A chord is `[a,b,c]`: scale degrees from 0 to 13 (two octaves). `~` is a silent cycle.
- Keys: C C# D D# E F F# G G# A A# B. Octave 1 to 8. Scale: major or minor.

### Beats: a drum sequencer

```js
sound("bd").struct("1 ~ ~ ~ 1 ~ ~ ~")
stack(sound("bd").struct("1 ~ 1 ~"), sound("hh").struct("~ 1 ~ 1"))
```

- One track is `sound("<drum>").struct("<steps>")`. Several tracks go in one `stack(...)`, and all tracks in a stack have the same number of steps.
- Steps: `1` is a hit, `~` a rest. 1 to 32 steps per cycle.
- A step can carry one modifier: `1*2`, `1*3`, `1*4`, `1@2`, `1@3`, `1@4`.
- A track with no hits is dropped.
- Track sounds: `bd`, `kicklinn`, `clubkick`, `hardkick`, `popkick`, `reverbkick`, `sd`, `dr_few`, `drum`, `drumtraks`, `electro1`, `hardcore`, `house`, `ifdrums`, `jungle`, `gretsch`, `hh`, `linnhats`, `dr`, `dr2`, `dr55`, `cp`, `realclaps`, `clak`, `click`, `stomp`, `tabla`, `tabla2`, `tablex`.

## Sounds

Write sounds after the instruments, like an effect. `.sound("a b")` is two sound nodes in a row.

### Drums: `.sound("<drum>")`

Sets the sound of the instruments before it. Drum sounds: `bd`, `kicklinn`, `clubkick`, `hardkick`, `popkick`, `reverbkick`, `sd`, `dr_few`, `drum`, `drumtraks`, `electro1`, `hardcore`, `house`, `ifdrums`, `jungle`, `gretsch`, `hh`, `linnhats`, `dr`, `dr2`, `dr55`, `cp`, `realclaps`, `clak`, `click`, `stomp`, `tabla`, `tabla2`, `tablex`.

### Voice: `.sound("<sound>")`

Sets the sound of the instruments before it: a waveform or a sample set. Without one, Pads and Chords play a triangle wave. Voice sounds: `sine`, `triangle`, `sawtooth`, `square`, `bass`, `bass0`, `bass1`, `bass2`, `bass3`, `bassdm`, `bassfoo`, `jungbass`, `jvbass`, `moog`, `tri`, `arp`, `arpy`, `lead`, `hoover`, `juno`, `saw`, `stab`, `simplesine`, `pluck`, `pad`, `padlong`, `space`, `newnotes`, `notes`, `ab`, `ade`, `ades2`, `ades3`, `ades4`, `alex`, `alphabet`, `amencutup`, `armora`, `auto`, `baa`, `baa2`, `battles`, `bend`, `bev`, `bin`, `birds`, `birds3`, `bleep`, `blip`, `blue`, `bottle`, `breaks125`, `breaks152`, `breaks157`, `breaks165`, `breath`, `bubble`, `can`, `casio`, `chin`, `circus`, `co`, `coins`, `control`, `cosmicg`, `crow`, `d`, `db`, `diphone`, `diphone2`, `dist`, `dork2`, `dorkbot`, `e`, `east`, `em2`, `erk`, `f`, `feel`, `feelfx`, `fest`, `fire`, `flick`, `fm`, `foo`, `future`, `gab`, `gabba`, `gabbaloud`, `gabbalouder`, `glasstap`, `glitch`, `glitch2`, `gtr`, `h`, `hand`, `haw`, `hc`, `hit`, `hmm`, `ho`, `if`, `incoming`, `industrial`, `insect`, `invaders`, `jazz`, `koy`, `kurt`, `latibro`, `led`, `less`, `lighter`, `made`, `made2`, `mash`, `mash2`, `metal`, `miniyeah`, `monsterb`, `mouth`, `mp3`, `msg`, `mute`, `noise`, `noise2`, `num`, `numbers`, `oc`, `odx`, `off`, `outdoor`, `pebbles`, `peri`, `print`, `proc`, `procshort`, `psr`, `rave`, `rave2`, `ravemono`, `rm`, `rs`, `sax`, `seawolf`, `sequential`, `sf`, `sheffield`, `short`, `sid`, `sitar`, `speakspell`, `speech`, `speechless`, `speedupdown`, `sugar`, `sundance`, `tacscan`.

## Effects

- **Time**: `.rev()`; `.palindrome()`; `.fast(x)`: 0.125 to 8, step 0.125, default 1; `.late(x)`: 0 to 1, step 0.01, default 0. Calls at their default value are left out.
- **Texture**: `.distort(x)`: 0 to 3, step 0.01, default 0; `.crush(x)`: 1 to 16, step 1, default 16; `.fm(x)`: 0 to 10, step 0.1, default 0. Calls at their default value are left out.
- **Level**: `.gain(x)`: 0 to 2, step 0.01, default 1; `.pan(x)`: 0 to 1, step 0.01, default 0.5; `.postgain(x)`: 0 to 2, step 0.01, default 1. Calls at their default value are left out.
- **Filter**: `.lpf(x)`: 100 to 5000, step 50, default 1000; `.lpq(x)`: 0.1 to 10, step 0.1, default 1. It always writes all of its calls, so at its defaults it is `.lpf(1000).lpq(1)`; calls you leave out keep their defaults.
- **Phaser**: `.phaser(x)`: 0.1 to 10, step 0.1, default 1; `.phaserdepth(x)`: 0 to 1, step 0.01, default 0.5. It always writes all of its calls, so at its defaults it is `.phaser(1).phaserdepth(0.5)`; calls you leave out keep their defaults.
- **Space**: `.room(x)`: 0 to 1, step 0.01, default 0; `.rsize(x)`: 0 to 10, step 0.1, default 1; `.rfade(x)`: 0 to 10, step 0.1, default 0.5; `.rlp(x)`: 0 to 20000, step 100, default 10000; `.rdim(x)`: 0 to 20000, step 100, default 8000. It always writes all of its calls, so at its defaults it is `.room("0").rsize(1).rfade(0.5).rlp(10000).rdim(8000)`; calls you leave out keep their defaults.
- **Envelope**: `.attack(x)`: 0 to 2, step 0.01, default 0.1; `.decay(x)`: 0 to 2, step 0.01, default 0.1; `.sustain(x)`: 0 to 1, step 0.01, default 0.7; `.release(x)`: 0 to 2, step 0.01, default 0.2. Calls at their default value are left out.

## Not available

- **Scope**: The Scope node only draws the waveform; it changes nothing you hear.
- **Code**: The Code node takes any Strudel a player types. Models write code too, but only code the visual nodes can produce.
