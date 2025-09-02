# Strudel Flow

A visual drum machine and pattern sequencer built with [Strudel.cc](https://strudel.cc), [React Flow](https://reactflow.dev), and styled using [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/). Create complex musical patterns by connecting instrument nodes to effect nodes with a drag-and-drop interface.

[Live Demo](https://xyflow.com/strudel-flow)

## Table of Contents

- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)
- [Node Types](#node-types)
- [Usage Guide](#usage-guide)
- [Pattern Syntax](#pattern-syntax)
- [Development](#development)
- [Contributing](#contributing)

## Getting Started

To get started, follow these steps:

1. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

2. **Run the development server**:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

## Tech Stack

- **Audio Engine**: [Strudel.cc](https://strudel.cc) - Web-based live coding environment

- **React Flow Components**: The project uses [React Flow Components](https://reactflow.dev/components) to build nodes. These components are designed to help you quickly get up to speed on projects.

- **shadcn CLI**: The project uses the [shadcn CLI](https://ui.shadcn.com/docs/cli) to manage UI components. This tool builds on top of [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/) components, making it easy to add and customize UI elements.

- **State Management with Zustand**: The application uses Zustand for state management, providing a simple and efficient way to manage the state of nodes, edges, and other workflow-related data.

## Node Types

### 🎵 Instruments

- **Pad Node** - Grid-based step sequencer with scales and modifiers
- **Beat Machine** - Classic drum machine with multiple instrument tracks
- **Arpeggiator** - Pattern-based arpeggiated sequences with visual feedback
- **Chord Node** - Interactive chord player with scale selection
- **Polyrhythm** - Multiple overlapping rhythmic patterns
- **Custom Node** - Direct Strudel pattern input

### 🎛️ Synths

- **Drum Sounds** - Sample-based drum sound selection
- **Sample Select** - Custom sample playback and selection

### 🎚️ Audio Effects

- **Gain** - Volume control and amplification
- **PostGain** - Secondary gain stage
- **Distortion** - Saturation and harmonic distortion
- **LPF** - Low-pass filtering with cutoff control
- **Pan** - Stereo positioning and width
- **Phaser** - Sweeping phase modulation effect
- **Crush** - Bit-crushing and sample rate reduction
- **Jux** - Alternating left/right channel effects
- **FM** - Frequency modulation synthesis
- **Room** - Realistic acoustic space simulation with size, fade, and filtering controls

### ⏱️ Time Effects

- **Fast** - Speed multiplication (×2, ×3, ×4)
- **Slow** - Speed division (÷2, ÷3, ÷4)
- **Late** - Pattern delay and offset timing
- **Attack** - Note attack time control
- **Release** - Note release time control
- **Sustain** - Note sustain level control
- **Reverse** - Reverse pattern playback
- **Palindrome** - Bidirectional pattern playback
- **Mask** - Probabilistic pattern masking
- **Ply** - Pattern subdivision and multiplication

## Usage Guide

### Creating Patterns

1. **Basic Pattern**:

   - Add a drum machine or pad node
   - Click buttons to activate steps
   - Adjust tempo with BPM control

2. **Complex Patterns**:
   - Use Shift+click to select multiple notes for grouping
   - Apply row modifiers for per-step effects
   - Chain multiple nodes for layered sounds

### Connecting Nodes

- **Source to Effect**: Drag from sound source to effect node
- **Effect Chaining**: Connect multiple effects in series
- **Multiple Sources**: Connect multiple sources to the same effect

### Pattern Modifiers

Each step can have modifiers applied:

- **Normal**: Standard playback
- **Fast (×2, ×3, ×4)**: Speed multiplication
- **Slow (/2, /3, /4)**: Speed division
- **Replicate (!2, !3, !4)**: Note repetition
- **Elongate (@2, @3, @4)**: Note duration extension

### Performance Controls

- **Global Play/Pause**: Press spacebar to pause/resume all active patterns
- **Group Controls**: Pause/resume connected node groups independently
- **Live Pattern Editing**: Modify patterns while playing with real-time updates
- **Pattern Preview**: View generated Strudel code for each node

### Keyboard Shortcuts

- **Spacebar**: Global play/pause toggle
- **Shift + Click**: Multi-select grid cells for grouping (in Pad nodes)
- **Right-click**: Context menu for pattern modifiers

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── nodes/          # Flow node components
│   │   ├── instruments/ # Instrument node implementations
│   │   ├── effects/    # Effect node implementations
│   │   └── synths/     # Synthesizer node implementations
│   ├── ui/             # shadcn/ui components
│   ├── workflow/       # Flow editor components
│   └── edges/          # Custom edge components
├── data/               # Static data and configurations
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and core logic
├── store/              # Zustand state management
└── types/              # TypeScript type definitions
```

## Acknowledgments

- [Strudel.cc](https://strudel.cc)
- [tweakcn](https://tweakcn.com)
- [React Flow](https://reactflow.dev)
- [shadcn/ui](https://ui.shadcn.com)

---

## Contact Us

We’re here to help! If you have any questions, feedback, instrument recommendations, or just want to share your project with us, feel free to reach out:

- **Contact Form**: Use the contact form on our [website](https://xyflow.com/contact).
- **Email**: Drop us an email at [info@xyflow.com](mailto:info@xyflow.com).
- **Discord**: Join our [Discord server](https://discord.com/invite/RVmnytFmGW) to connect with the community and get support.
