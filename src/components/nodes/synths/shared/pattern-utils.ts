/**
 * Utility functions for pattern generation
 */

import { CellState, SoundSelection } from './types';
import { applyRowModifier } from './cell-state-utils';
import { getGroupedTrackIndices } from './button-utils';

/**
 * Generate pattern for step sequencer nodes
 */
export function generateStepPattern(
  steps: number,
  tracks: number[],
  selectedSounds: SoundSelection,
  soundGroups: Record<number, number[][]>,
  rowModifiers: CellState[],
  soundOptions: string[]
): string {
  const stepPatterns = Array.from({ length: steps }, (_, stepIdx) => {
    // Get individual sounds for this step
    const individualSounds: string[] = [];
    for (let trackIdx = 0; trackIdx < tracks.length; trackIdx++) {
      const buttonKey = `${stepIdx}-${trackIdx}`;
      const soundIndex = selectedSounds[buttonKey];
      if (soundIndex !== undefined) {
        individualSounds.push(soundOptions[soundIndex]);
      }
    }

    // Get groups for this step and convert to patterns
    const stepGroups = soundGroups[stepIdx] || [];
    const groupPatterns = stepGroups
      .map((group) => {
        const groupSoundValues = group
          .map((trackIdx) => {
            const buttonKey = `${stepIdx}-${trackIdx}`;
            const soundIndex = selectedSounds[buttonKey];
            return soundIndex !== undefined ? soundOptions[soundIndex] : null;
          })
          .filter(Boolean);

        if (groupSoundValues.length > 0) {
          return `<${groupSoundValues.join(' ')}>`;
        }
        return null;
      })
      .filter(Boolean);

    // Remove grouped sounds from individual sounds
    const groupedTrackIndices = getGroupedTrackIndices(stepIdx, soundGroups);

    const ungroupedSounds = individualSounds.filter((_, index) => {
      // Find the track index for this sound
      const trackIndices = [];
      for (let trackIdx = 0; trackIdx < tracks.length; trackIdx++) {
        const buttonKey = `${stepIdx}-${trackIdx}`;
        const soundIndex = selectedSounds[buttonKey];
        if (soundIndex !== undefined) {
          trackIndices.push(trackIdx);
        }
      }
      const trackIdx = trackIndices[index];
      return trackIdx !== undefined && !groupedTrackIndices.has(trackIdx);
    });

    // Combine individual sounds and groups
    const allPatterns = [...ungroupedSounds, ...groupPatterns];

    if (allPatterns.length === 0) return '';

    const soundPattern = allPatterns.join(' ');
    return applyRowModifier(soundPattern, rowModifiers[stepIdx]);
  });

  return stepPatterns.filter(Boolean).join(' ') || '';
}

/**
 * Generate pattern for simple drum machine style nodes
 */
export function generateDrumPattern(
  padStates: Record<string, CellState>,
  soundOptions: string[]
): string {
  const activePads = soundOptions
    .filter((sound) => padStates[sound]?.type !== 'off')
    .map((sound) => {
      const state = padStates[sound];
      return applyRowModifier(sound, state);
    });

  return activePads.join(' ');
}

/**
 * Generate note pattern for scale-based nodes
 */
export function generateNotePattern(
  steps: number,
  tracks: number[],
  selectedNotes: Record<string, number>,
  rowModifiers: CellState[],
  scaleNotes: string[]
): string {
  const stepPatterns = Array.from({ length: steps }, (_, stepIdx) => {
    const stepNotes: string[] = [];
    
    for (let trackIdx = 0; trackIdx < tracks.length; trackIdx++) {
      const buttonKey = `${stepIdx}-${trackIdx}`;
      const noteIndex = selectedNotes[buttonKey];
      if (noteIndex !== undefined && scaleNotes[noteIndex]) {
        stepNotes.push(scaleNotes[noteIndex]);
      }
    }

    if (stepNotes.length === 0) return '';

    const notePattern = stepNotes.join(' ');
    return applyRowModifier(notePattern, rowModifiers[stepIdx]);
  });

  return stepPatterns.filter(Boolean).join(' ') || '';
}

/**
 * Generate pattern for grid-based nodes (like pad-node)
 */
export function generateGridPattern(
  grid: boolean[][],
  noteGroups: Record<number, number[][]>,
  rowModifiers: CellState[],
  notes: string[],
  mode: 'arp' | 'chord'
): string {
  const stepPatterns = grid.map((row, stepIdx) => {
    // Get active individual notes
    const individualNotes = row
      .map((on, noteIdx) => on ? notes[noteIdx] : null)
      .filter(Boolean);

    // Get groups for this step and convert to patterns
    const stepGroups = noteGroups[stepIdx] || [];
    const groupPatterns = stepGroups.map((group) => {
      const groupNoteValues = group.map((noteIdx) => notes[noteIdx]);
      return `<${groupNoteValues.join(' ')}>`;
    });

    // Combine individual notes and groups
    const allPatterns = [...individualNotes, ...groupPatterns];
    
    if (allPatterns.length === 0) return '';

    // Both modes use brackets, but different separators
    const separator = mode === 'arp' ? ' ' : ', ';
    const notesPattern = allPatterns.join(separator);
    const basePattern = `[${notesPattern}]`;
    
    return applyRowModifier(basePattern, rowModifiers[stepIdx]);
  });

  return stepPatterns.filter(Boolean).join(' ') || '';
}
