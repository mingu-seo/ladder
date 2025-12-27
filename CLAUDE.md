# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EduLadder is an educational "Ghost Leg" (Amidakuji/사다리타기) game built for classroom environments. It allows teachers to fairly assign seats, presentation orders, or team assignments through an animated ladder game that can be projected to a class.

**Key characteristics:**
- Fully client-side React/TypeScript application (no backend)
- Canvas-based rendering for smooth animations
- Designed for large-screen projection (classrooms)
- Korean language UI
- Supports up to 30 participants

## Development Commands

```bash
# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### State Machine Flow

The application follows a strict state machine:

1. **INPUT**: User configures participants and results
2. **READY**: Ladder is generated, awaiting animation start
3. **ANIMATING**: Participants traverse the ladder
4. **FINISHED**: Results are displayed

Once the game moves past INPUT state, users are warned before leaving (beforeunload handler).

### Core Algorithm (utils/ladderUtils.ts)

**Bridge Generation (`generateBridges`)**:
- Randomly generates horizontal bridges between vertical ladder lines
- Prevents adjacent bridges at the same level to maintain visual clarity
- Uses `LADDER_CONFIG.bridgeProbability` (0.4) to control density

**Path Calculation (`calculatePaths`)**:
- Pre-calculates the complete path for each participant before animation
- Paths are arrays of {x, y} coordinates
- Each participant starts at their column and follows horizontal bridges when encountered
- Paths are computed once and used for both animation and final result determination

**Important**: The ladder structure (bridges) is randomized, but participant and result order is never randomized. Only the "Randomize" button regenerates bridges.

### Component Structure

**App.tsx** - Main orchestrator
- Manages all state (participants, results, bridges, paths, game status)
- Synchronizes participant count with participant/result arrays
- Handles state transitions

**SetupForm.tsx** - Input phase UI
- Dual-column layout: participants on left, results on right
- Auto-generates default names ("학생1", "학생2", etc.)
- Character emoji auto-assigned from CHARACTERS array

**LadderGame.tsx** - Canvas rendering & animation
- Uses `requestAnimationFrame` for 60fps animation
- Supports both individual click-to-start and batch start modes
- `progressRef` tracks animation progress (0 to 1) for each participant
- Canvas is scaled for high-DPI displays using `devicePixelRatio`

**Header.tsx** - Navigation
- Provides reset functionality to return to INPUT state

### Canvas Rendering Details

The canvas draws in specific layers (order matters):

1. Background vertical lines (light gray)
2. Horizontal bridge lines (light gray)
3. Participant cards at top (white boxes with character + name)
4. Result boxes at bottom (green background)
5. Animated paths (colored lines following participant colors)
6. Moving character icons (white circles with emoji)
7. Final participant names (rendered below character icons when animation completes)

### Configuration (constants.ts)

`LADDER_CONFIG` controls all layout dimensions:
- `colWidth: 120` - Horizontal spacing between participants
- `rowHeight: 40` - Vertical spacing between bridge levels
- `numRows: 15` - Number of horizontal levels where bridges can appear
- `headerHeight: 120` - Top margin for participant cards
- `footerHeight: 100` - Bottom margin for result boxes
- `strokeWidth: 4` - Line thickness
- `bridgeProbability: 0.4` - Likelihood of bridge generation at each position

**Color Assignment**: Participants receive colors from `COLORS` array (30 colors) and characters from `CHARACTERS` array (30 emoji) based on their index using modulo.

## Key Implementation Notes

### Path Calculation Logic

The path calculation in `calculatePaths` simulates walking the ladder:
- Start at top of assigned column
- For each row, check for bridges:
  - If bridge exists to the right (fromCol === currentCol), move right
  - Else if bridge exists to the left (fromCol === currentCol - 1), move left
  - Else continue straight down
- Add coordinate to path at each step

### Animation System

Animation uses a progress-based approach:
- Each participant has a progress value (0.0 to 1.0)
- Progress increments based on elapsed time (`speed * deltaTime`)
- Canvas redraws on every frame showing partial path based on progress
- Character icon position interpolated between path points
- Animation completes when all participants reach progress = 1.0

### Individual vs Batch Start

- **Individual**: Click participant card in READY/ANIMATING state sets their progress to 0.0001 (triggers animation)
- **Batch**: "일괄 시작" button transitions to ANIMATING state, triggering all participants simultaneously
- Progress values of 0 are treated as "not started yet"

## Important Constraints

- Maximum 30 participants (enforced by UI and constants)
- No backend/persistence - all state is client-side only
- Browser refresh after INPUT state triggers warning dialog
- Results cannot be shared via URL (no URL state encoding)
- Image export captures canvas as-is using `toDataURL('image/png')`

## Testing the Ladder Algorithm

When modifying ladder generation or path calculation:
1. Test with edge cases: 1 participant, 2 participants, 30 participants
2. Verify no participant ends at their starting position when bridges exist
3. Check that all paths end at valid result positions (0 to count-1)
4. Ensure no visual overlaps in bridge generation

## Korean UI Text

The application uses Korean throughout. Key terms:
- 참가자 = Participant
- 결과 = Result
- 사다리 = Ladder
- 학생 = Student

When making UI changes, maintain Korean language consistency.
