# Strudel Flow Machine

A visual drum machine and pattern sequencer built with [Strudel.cc](https://strudel.cc), [React Flow](https://reactflow.dev), [React Flow Components](https://reactflow.dev/components) and styled using [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/).

## Table of Contents

- [Features](#features)
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

## Features

- **Drag-and-Drop Sidebar**: Add and arrange nodes using a drag-and-drop mechanism.
- **Customizable Components**: Uses React Flow Components and the shadcn library to create highly-customizable nodes and edges.
- **Dark Mode**: Toggles between light and dark themes, managed through the Zustand store.
- **Runner Functionality**: Executes and monitors nodes sequentially with a workflow runner.

## Node Types

### 🎵 Sound Sources
- **Drum Machine Node** - Classic drum sounds with step sequencer
- **Pad Node** - Melodic patterns with scales and chords
- **Arpeggiator Node** - Complex arpeggiated sequences
- **Sounds Node** - Custom sample playback

### 🎛️ Effect Nodes

#### Audio Effects
- **Gain** - Volume control
- **Distortion** - Add saturation
- **LPF** - Low-pass filtering
- **Pan** - Stereo positioning
- **Phaser** - Sweeping phase effect
- **Compressor** - Dynamic range control

#### Time Effects
- **Fast** - Speed up patterns
- **Slow** - Slow down patterns
- **Attack** - Control note attack
- **Release** - Control note release
- **Sustain** - Control note sustain

#### Pattern Effects
- **Jux** - Alternating channel effects
- **Palindrome** - Reverse pattern playback
- **Size** - Reverb room size
- **Crush** - Bit-crushing distortion

#### Room Simulation
- **Room** - Realistic acoustic spaces with adjustable parameters

## Usage Guide

### Creating Patterns

1. **Basic Pattern**:

   - Add a drum machine or pad node
   - Click buttons to activate steps
   - Adjust tempo with CPM control

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

- **Global Play/Pause**: Control all patterns
- **Group Controls**: Pause/resume connected node groups
- **Individual Muting**: Mute specific nodes
- **Live Pattern Editing**: Modify patterns while playing

## Pattern Syntax

The app generates [Strudel](https://strudel.cc) code in real-time. Here are some examples:

```javascript
// Basic drum pattern
$: sound('bd sd bd sd');

// Melodic pattern with scale
$: n('[0 2 4]').scale('C4:major');

// Effect chain
$: sound('bd sd').gain(0.8).lpf(1000);

// Complex pattern with modifiers
$: sound('bd sd').fast(2).palindrome();
```

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── nodes/          # Flow node components
│   │   ├── effects/    # Effect node implementations
│   │   └── synths/     # Synthesizer node implementations
│   ├── ui/             # shadcn/ui components
│   └── workflow/       # Flow editor components
├── data/               # Static data and configurations
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── store/              # Zustand state management
└── types/              # TypeScript type definitions
```

## Acknowledgments

- [Strudel.cc](https://strudel.cc) - The amazing live coding platform
- [React Flow](https://reactflow.dev) - Node-based editor foundation
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- The live coding and web audio communities

---

## Contact Us

We’re here to help! If you have any questions, feedback, or just want to share your projects with us, feel free to reach out:

- **Contact Form**: Use the contact form on our [website](https://xyflow.com/contact).
- **Email**: Drop us an email at [info@xyflow.com](mailto:info@xyflow.com).
- **Discord**: Join our [Discord server](https://discord.com/invite/RVmnytFmGW) to connect with the community and get support.
