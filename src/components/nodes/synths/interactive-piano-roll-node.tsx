import { useState, useEffect, useRef } from 'react';
import { useStrudelStore } from '@/store/strudel-store';
import { useAppStore } from '@/store/app-context';
import WorkflowNode from '@/components/nodes/workflow-node';
import { WorkflowNodeProps, AppNode } from '..';
import { Button } from '@/components/ui/button';
import { StrudelConfig } from '@/types';

// Define note structure
interface Note {
  id: string;
  pitch: number; // 0-11 (C to B)
  octave: number; // 3-6
  step: number; // 0-15 (16 steps)
  velocity: number; // 0-127
}

// Define the internal state interface for URL persistence
interface InteractivePianoRollNodeInternalState {
  notes: Note[];
  selectedSound: string;
  octaveRange: { min: number; max: number };
}

const PIANO_SOUNDS = [
  { id: 'piano', label: 'Piano' },
  { id: 'epiano', label: 'Electric Piano' },
  { id: 'bell', label: 'Bell' },
  { id: 'pluck', label: 'Pluck' },
  { id: 'pad', label: 'Pad' },
  { id: 'bass', label: 'Bass' },
];

// Piano notes (C to B)
const PITCH_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];
const BLACK_KEYS = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#

export function InteractivePianoRollNode({ id, data }: WorkflowNodeProps) {
  const updateNode = useStrudelStore((state) => state.updateNode);
  const updateNodeData = useAppStore((state) => state.updateNodeData);

  // Get internal state from node data if it exists (for URL restoration)
  const savedInternalState = (
    data as { internalState?: InteractivePianoRollNodeInternalState }
  )?.internalState;

  // Initialize state with saved values or defaults
  const [notes, setNotes] = useState<Note[]>(savedInternalState?.notes || []);
  const [selectedSound, setSelectedSound] = useState(
    savedInternalState?.selectedSound || 'piano'
  );
  const [octaveRange] = useState(
    savedInternalState?.octaveRange || { min: 3, max: 6 }
  );

  // Drag state
  const [draggedNote, setDraggedNote] = useState<Note | null>(null);

  // State restoration flag
  const [hasRestoredState, setHasRestoredState] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);

  // Restore state from saved internal state
  useEffect(() => {
    if (savedInternalState && !hasRestoredState) {
      setNotes(savedInternalState.notes);
      setSelectedSound(savedInternalState.selectedSound);
      setHasRestoredState(true);
    }
  }, [savedInternalState, hasRestoredState, id]);

  // Save internal state whenever it changes
  useEffect(() => {
    const internalState: InteractivePianoRollNodeInternalState = {
      notes,
      selectedSound,
      octaveRange,
    };

    updateNodeData(id, { internalState });
  }, [notes, selectedSound, octaveRange, id, updateNodeData]);

  // Update strudel whenever settings change
  useEffect(() => {
    const config: Partial<StrudelConfig> = {
      interactivePianoNotes: notes,
      interactivePianoSound: selectedSound,
    };

    updateNode(id, config);
  }, [notes, selectedSound, id, updateNode]);

  // Generate all pitches for the octave range
  const getAllPitches = () => {
    const pitches = [];
    for (let octave = octaveRange.max; octave >= octaveRange.min; octave--) {
      for (let pitch = 11; pitch >= 0; pitch--) {
        pitches.push({ pitch, octave });
      }
    }
    return pitches;
  };

  const allPitches = getAllPitches();
  const steps = Array.from({ length: 16 }, (_, i) => i);

  // Helper functions

  const generateNoteId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const isBlackKey = (pitch: number) => BLACK_KEYS.includes(pitch);

  const getNoteAt = (pitch: number, octave: number, step: number) => {
    return notes.find(
      (note) =>
        note.pitch === pitch && note.octave === octave && note.step === step
    );
  };

  // Event handlers
  const handleCellClick = (pitch: number, octave: number, step: number) => {
    const existingNote = getNoteAt(pitch, octave, step);

    if (existingNote) {
      // Remove note
      setNotes((prev) => prev.filter((note) => note.id !== existingNote.id));
    } else {
      // Add note
      const newNote: Note = {
        id: generateNoteId(),
        pitch,
        octave,
        step,
        velocity: 100,
      };
      setNotes((prev) => [...prev, newNote]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    e.stopPropagation();

    setDraggedNote(note);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNote || !gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate new position
    const cellWidth = rect.width / 16; // 16 steps
    const cellHeight = rect.height / allPitches.length;

    const newStep = Math.max(0, Math.min(15, Math.floor(x / cellWidth)));
    const pitchIndex = Math.max(
      0,
      Math.min(allPitches.length - 1, Math.floor(y / cellHeight))
    );

    const { pitch: newPitch, octave: newOctave } = allPitches[pitchIndex];

    // Update dragged note position if it's different
    if (
      newStep !== draggedNote.step ||
      newPitch !== draggedNote.pitch ||
      newOctave !== draggedNote.octave
    ) {
      // Check if target position is empty
      const targetNote = getNoteAt(newPitch, newOctave, newStep);
      if (!targetNote || targetNote.id === draggedNote.id) {
        setNotes((prev) =>
          prev.map((note) =>
            note.id === draggedNote.id
              ? { ...note, pitch: newPitch, octave: newOctave, step: newStep }
              : note
          )
        );
        setDraggedNote({
          ...draggedNote,
          pitch: newPitch,
          octave: newOctave,
          step: newStep,
        });
      }
    }
  };

  const handleMouseUp = () => {
    setDraggedNote(null);
  };

  const clearAll = () => {
    setNotes([]);
  };

  const getPitchLabel = (pitch: number, octave: number) => {
    return `${PITCH_NAMES[pitch]}${octave}`;
  };

  return (
    <WorkflowNode id={id} data={data}>
      <div className="flex flex-col gap-3 p-3 bg-card text-card-foreground rounded-md min-w-[600px]">
        {/* Controls */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="text-xs"
            >
              Clear All
            </Button>
            <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
              {notes.length} notes
            </div>
          </div>
        </div>

        {/* Sound Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">Sound</label>
          <div className="grid grid-cols-3 gap-1">
            {PIANO_SOUNDS.map((sound) => (
              <Button
                key={sound.id}
                variant={selectedSound === sound.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSound(sound.id)}
              >
                {sound.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Piano Roll Grid */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium">
            Piano Roll (Click to place notes, drag to move)
          </label>

          <div className="border rounded-md bg-white overflow-hidden">
            {/* Step numbers header */}
            <div className="flex border-b bg-gray-50">
              <div className="w-12 flex items-center justify-center text-xs font-mono border-r">
                Step
              </div>
              {steps.map((step) => (
                <div
                  key={step}
                  className="flex-1 text-center text-xs font-mono py-1 border-r last:border-r-0"
                >
                  {step + 1}
                </div>
              ))}
            </div>

            {/* Piano roll grid */}
            <div
              ref={gridRef}
              className="relative select-none"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {allPitches.map(({ pitch, octave }) => (
                <div
                  key={`${pitch}-${octave}`}
                  className="flex border-b last:border-b-0"
                >
                  {/* Piano key */}
                  <div
                    className={`w-12 flex items-center justify-center text-xs font-mono border-r ${
                      isBlackKey(pitch)
                        ? 'bg-gray-800 text-white'
                        : 'bg-white text-black'
                    }`}
                  >
                    {getPitchLabel(pitch, octave)}
                  </div>

                  {/* Step cells */}
                  {steps.map((step) => {
                    const note = getNoteAt(pitch, octave, step);
                    const isDownbeat = step % 4 === 0;

                    return (
                      <div
                        key={step}
                        className={`flex-1 h-6 border-r last:border-r-0 relative cursor-pointer ${
                          isDownbeat ? 'bg-blue-50' : 'bg-white'
                        } hover:bg-blue-100 transition-colors`}
                        onClick={() => handleCellClick(pitch, octave, step)}
                      >
                        {note && (
                          <div
                            className={`absolute inset-0 bg-blue-500 opacity-80 rounded-sm cursor-move ${
                              draggedNote?.id === note.id
                                ? 'ring-2 ring-blue-300'
                                : ''
                            }`}
                            onMouseDown={(e) => handleMouseDown(e, note)}
                            title={`${getPitchLabel(pitch, octave)} at step ${
                              step + 1
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Pattern Display */}
        <div className="text-xs font-mono bg-muted px-2 py-1 rounded max-h-20 overflow-y-auto">
          <div className="font-bold">Pattern ({notes.length} notes)</div>
          <div className="opacity-70">
            {notes.length === 0 ? (
              <div>No notes - click on the grid to add notes</div>
            ) : (
              notes
                .sort(
                  (a, b) =>
                    a.step - b.step ||
                    b.octave * 12 + b.pitch - (a.octave * 12 + a.pitch)
                )
                .map((note) => (
                  <div key={note.id}>
                    Step {note.step + 1}:{' '}
                    {getPitchLabel(note.pitch, note.octave)}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </WorkflowNode>
  );
}

InteractivePianoRollNode.strudelOutput = (
  node: AppNode,
  strudelString: string
) => {
  const config = useStrudelStore.getState().config[node.id];
  const notes = config?.interactivePianoNotes as Note[] | undefined;
  const sound = config?.interactivePianoSound;

  if (!notes || notes.length === 0 || !sound) return strudelString;

  // Helper function for MIDI conversion
  const noteToMidiNumber = (pitch: number, octave: number) => {
    return (octave + 1) * 12 + pitch;
  };

  // Group notes by step to create chords
  const notesByStep = notes.reduce((acc, note) => {
    if (!acc[note.step]) acc[note.step] = [];
    acc[note.step].push(note);
    return acc;
  }, {} as Record<number, Note[]>);

  // Create pattern array for 16 steps
  const pattern = Array(16).fill('~');

  Object.entries(notesByStep).forEach(([stepStr, stepNotes]) => {
    const step = parseInt(stepStr);
    if (stepNotes.length === 1) {
      // Single note
      const note = stepNotes[0];
      const midiNote = noteToMidiNumber(note.pitch, note.octave);
      pattern[step] = `${midiNote}`;
    } else {
      // Chord - multiple notes
      const midiNotes = stepNotes.map((note) =>
        noteToMidiNumber(note.pitch, note.octave)
      );
      pattern[step] = `[${midiNotes.join(',')}]`;
    }
  });

  const patternString = pattern.join(' ');
  const pianoCall = `n("${patternString}").s("${sound}")`;

  return strudelString ? `${strudelString}.stack(${pianoCall})` : pianoCall;
};
