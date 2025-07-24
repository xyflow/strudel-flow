import { useState, useEffect } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Define the internal state interface for URL persistence
interface SoundPaletteNodeInternalState {
  selectedSound: string;
  selectedCategory: string;
}

// Sound categories with visual grouping
const SOUND_CATEGORIES = {
  piano: {
    label: '🎹 Piano',
    sounds: [
      'gm_acoustic_grand_piano',
      'gm_bright_acoustic_piano',
      'gm_electric_grand_piano',
      'gm_honky_tonk_piano',
      'gm_electric_piano_1',
      'gm_electric_piano_2',
      'gm_harpsichord',
      'gm_clavinet',
    ],
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  organ: {
    label: '🎛️ Organ',
    sounds: [
      'gm_drawbar_organ',
      'gm_percussive_organ',
      'gm_rock_organ',
      'gm_church_organ',
      'gm_reed_organ',
    ],
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  guitar: {
    label: '🎸 Guitar',
    sounds: [
      'gm_acoustic_guitar_nylon',
      'gm_acoustic_guitar_steel',
      'gm_electric_guitar_jazz',
      'gm_electric_guitar_clean',
      'gm_electric_guitar_muted',
      'gm_overdriven_guitar',
      'gm_distortion_guitar',
    ],
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  bass: {
    label: '🎸 Bass',
    sounds: [
      'gm_acoustic_bass',
      'gm_electric_bass_finger',
      'gm_electric_bass_pick',
      'gm_fretless_bass',
      'gm_slap_bass_1',
      'gm_slap_bass_2',
      'gm_synth_bass_1',
      'gm_synth_bass_2',
    ],
    color: 'bg-red-500 hover:bg-red-600',
  },
  strings: {
    label: '🎻 Strings',
    sounds: [
      'gm_violin',
      'gm_viola',
      'gm_cello',
      'gm_contrabass',
      'gm_tremolo_strings',
      'gm_pizzicato_strings',
      'gm_orchestral_harp',
      'gm_timpani',
    ],
    color: 'bg-green-500 hover:bg-green-600',
  },
  brass: {
    label: '🎺 Brass',
    sounds: [
      'gm_trumpet',
      'gm_trombone',
      'gm_tuba',
      'gm_muted_trumpet',
      'gm_french_horn',
      'gm_brass_section',
      'gm_synth_brass_1',
      'gm_synth_brass_2',
    ],
    color: 'bg-yellow-500 hover:bg-yellow-600',
  },
  leads: {
    label: '🎵 Lead Synths',
    sounds: [
      'gm_lead_1_square',
      'gm_lead_2_sawtooth',
      'gm_lead_3_calliope',
      'gm_lead_4_chiff',
      'gm_lead_5_charang',
      'gm_lead_6_voice',
      'gm_lead_7_fifths',
      'gm_lead_8_bass_lead',
    ],
    color: 'bg-pink-500 hover:bg-pink-600',
  },
  pads: {
    label: '🌊 Pad Synths',
    sounds: [
      'gm_pad_1_new_age',
      'gm_pad_2_warm',
      'gm_pad_3_polysynth',
      'gm_pad_4_choir',
      'gm_pad_5_bowed',
      'gm_pad_6_metallic',
      'gm_pad_7_halo',
      'gm_pad_8_sweep',
    ],
    color: 'bg-teal-500 hover:bg-teal-600',
  },
};

export function SoundPaletteNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Get internal state from node data if it exists (for URL restoration)
  const savedInternalState = (
    data as { internalState?: SoundPaletteNodeInternalState }
  )?.internalState;

  // Initialize state with saved values or defaults
  const [selectedSound, setSelectedSound] = useState(
    savedInternalState?.selectedSound || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(
    savedInternalState?.selectedCategory || 'piano'
  );

  // State restoration flag to ensure we only restore once
  const [hasRestoredState, setHasRestoredState] = useState(false);

  // Restore state from saved internal state
  useEffect(() => {
    if (savedInternalState && !hasRestoredState) {
      setSelectedSound(savedInternalState.selectedSound);
      setSelectedCategory(savedInternalState.selectedCategory);
      setHasRestoredState(true);
    }
  }, [savedInternalState, hasRestoredState, id]);

  // Save internal state whenever it changes
  useEffect(() => {
    const internalState: SoundPaletteNodeInternalState = {
      selectedSound,
      selectedCategory,
    };

    updateNodeData(id, { internalState });
  }, [selectedSound, selectedCategory, id, updateNodeData]);

  // Update strudel whenever sound changes
  useEffect(() => {
    updateNode(id, { selectedSound });
  }, [selectedSound, id, updateNode]);

  const handleSoundClick = (sound: string) => {
    setSelectedSound(sound);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const getSoundDisplayName = (sound: string) => {
    return sound
      .replace('gm_', '')
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-80">
        {/* Category Buttons */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">
            Sound Category
          </label>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(SOUND_CATEGORIES).map(([categoryKey, category]) => (
              <Button
                key={categoryKey}
                className={`h-10 text-white font-bold text-xs ${
                  selectedCategory === categoryKey
                    ? category.color + ' ring-2 ring-white'
                    : category.color + ' opacity-70'
                }`}
                onClick={() => handleCategoryClick(categoryKey)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Category Sounds */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">
            {
              SOUND_CATEGORIES[
                selectedCategory as keyof typeof SOUND_CATEGORIES
              ].label
            }{' '}
            Sounds
          </label>
          <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
            {SOUND_CATEGORIES[
              selectedCategory as keyof typeof SOUND_CATEGORIES
            ].sounds.map((sound) => (
              <Button
                key={sound}
                variant={selectedSound === sound ? 'default' : 'outline'}
                size="sm"
                className={`text-left justify-start text-xs ${
                  selectedSound === sound
                    ? 'bg-primary text-primary-foreground'
                    : ''
                }`}
                onClick={() => handleSoundClick(sound)}
              >
                {getSoundDisplayName(sound)}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Selection Display */}
        {selectedSound && (
          <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
            s("{selectedSound}")
          </div>
        )}

        {/* Advanced */}
        <Accordion type="single" collapsible>
          <AccordionItem value="custom">
            <AccordionTrigger className="text-xs font-mono py-2">
              Custom Sound
            </AccordionTrigger>
            <AccordionContent className="overflow-hidden">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={selectedSound}
                  onChange={(e) => setSelectedSound(e.target.value)}
                  placeholder="Enter custom sound name"
                  className="font-mono text-sm px-3 py-2 border rounded-md bg-transparent border-input"
                />
                <div className="text-xs text-muted-foreground">
                  You can type any GM sound name or sample
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </WorkflowNode>
  );
}

SoundPaletteNode.strudelOutput = (node: AppNode, strudelString: string) => {
  const selectedSound =
    useStrudelStore.getState().config[node.id]?.selectedSound;

  if (!selectedSound) return strudelString;

  const soundCall = `s("${selectedSound}")`;
  return strudelString ? `${strudelString}.${soundCall}` : soundCall;
};
