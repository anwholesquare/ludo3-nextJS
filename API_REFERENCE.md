# 📚 Ludo3 API Reference

Complete reference documentation for all interfaces, functions, and components in the Ludo3 game template.

## 📋 Table of Contents

1. [Core Interfaces](#core-interfaces)
2. [Game Logic Functions](#game-logic-functions)
3. [3D Components](#3d-components)
4. [Utility Functions](#utility-functions)
5. [Constants](#constants)
6. [Event Handlers](#event-handlers)

---

## 🔧 Core Interfaces

### GameState

The main game state interface that manages the entire game.

```typescript
interface GameState {
  players: Player[]              // Array of all players
  currentPlayerIndex: number     // Index of current player (0-3)
  diceValue: number | null       // Current dice value (1-6 or null)
  gamePhase: 'setup' | 'playing' | 'finished'
  winner: Player | null          // Winning player (null if game ongoing)
  lastRoll: number | null        // Previous dice roll for reference
  canRollAgain: boolean         // True if player gets extra turn
  turnStartTime: number | null   // Timestamp when turn started
  autoPlayEnabled: boolean      // AI assistance enabled/disabled
}
```

**Usage Example:**
```typescript
const [gameState, setGameState] = useState<GameState>({
  players: [],
  currentPlayerIndex: 0,
  diceValue: null,
  gamePhase: 'setup',
  winner: null,
  lastRoll: null,
  canRollAgain: false,
  turnStartTime: null,
  autoPlayEnabled: true
})
```

### Player

Represents a single player in the game.

```typescript
interface Player {
  id: string                    // Unique identifier (e.g., "player_0")
  name: string                  // Display name (e.g., "Alice")
  color: 'yellow' | 'green' | 'blue' | 'red'
  pieces: GamePiece[]          // Array of 4 game pieces
  isActive: boolean            // Currently playing (deprecated)
}
```

**Usage Example:**
```typescript
const createPlayer = (index: number, name: string, color: Player['color']): Player => ({
  id: `player_${index}`,
  name,
  color,
  pieces: Array(4).fill(null).map((_, pieceIndex) => ({
    id: `${color}_piece_${pieceIndex}`,
    playerId: `player_${index}`,
    position: -1,
    isSelected: false,
    canMove: false
  })),
  isActive: index === 0
})
```

### GamePiece

Represents a single game piece.

```typescript
interface GamePiece {
  id: string           // Unique identifier (e.g., "yellow_piece_0")
  playerId: string     // Owner's player ID
  position: number     // Current position (-1=home, 0-56=path, 57=finished)
  isSelected: boolean  // Currently selected by player
  canMove: boolean     // Can be moved with current dice value
}
```

**Position Values:**
- `-1`: Piece is at home (starting area)
- `0-56`: Piece is on the game path
- `57`: Piece has finished (reached center)

### ColorTheme

Defines the visual appearance of the game board.

```typescript
interface ColorTheme {
  name: string                  // Theme name for UI
  boardBase: string            // Base board color (hex)
  trackTiles: string           // Track tile color (hex)
  players: {                   // Player-specific colors
    yellow: string
    green: string
    blue: string
    red: string
  }
}
```

**Usage Example:**
```typescript
const customTheme: ColorTheme = {
  name: 'Neon',
  boardBase: '#0a0a0a',
  trackTiles: '#1a1a1a',
  players: {
    yellow: '#ffff00',
    green: '#00ff00',
    blue: '#00ffff',
    red: '#ff0040'
  }
}
```

---

## 🎮 Game Logic Functions

### canPieceMove

Determines if a piece can be moved with the current dice value.

```typescript
function canPieceMove(
  piece: GamePiece, 
  diceValue: number, 
  player: Player
): boolean
```

**Parameters:**
- `piece`: The game piece to check
- `diceValue`: Current dice roll (1-6)
- `player`: The piece owner

**Returns:** `true` if piece can move, `false` otherwise

**Rules:**
- Pieces at home (-1) need a 6 to start
- Finished pieces (57) cannot move
- Move must not overshoot the finish line

**Usage Example:**
```typescript
const moveablePieces = player.pieces.filter(piece => 
  canPieceMove(piece, diceValue, player)
)
```

### calculateNewPosition

Calculates where a piece would move with a given dice value.

```typescript
function calculateNewPosition(
  piece: GamePiece, 
  diceValue: number, 
  player: Player
): number | null
```

**Parameters:**
- `piece`: The game piece
- `diceValue`: Dice roll value
- `player`: The piece owner

**Returns:** New position number or `null` if move is invalid

**Usage Example:**
```typescript
const newPos = calculateNewPosition(selectedPiece, 4, currentPlayer)
if (newPos !== null) {
  movePiece(selectedPiece, newPos)
}
```

### movePiece

Executes a piece movement and updates game state.

```typescript
function movePiece(piece: GamePiece, newPosition: number): void
```

**Side Effects:**
- Updates piece position
- Handles captures (sends opponent pieces home)
- Checks win conditions
- Manages turn transitions
- Clears piece selections

**Capture Rules:**
- Only on main track (positions 0-50)
- Not on safe positions
- Captured pieces return to home (-1)

### getPositionCoordinates

Converts game position to 3D world coordinates.

```typescript
function getPositionCoordinates(
  position: number, 
  color: 'yellow' | 'green' | 'blue' | 'red', 
  pieceIndex?: number
): [number, number, number]
```

**Parameters:**
- `position`: Game position (-1 to 57)
- `color`: Player color for path calculation
- `pieceIndex`: For home positions (0-3)

**Returns:** 3D coordinates `[x, y, z]`

**Usage Example:**
```typescript
const [x, y, z] = getPositionCoordinates(piece.position, player.color, 0)
```

---

## 🎲 3D Components

### LudoBoard

Main 3D board component with dice functionality.

```typescript
const LudoBoard = forwardRef<{
  throwDice: () => void
  throwDiceWithValue: (value?: number) => void
  isDiceAnimating: boolean
}, {
  gameState: GameState
  onPieceClick: (piece: GamePiece) => void
  onDiceResult: (value: number) => void
}>(function LudoBoard(props, ref))
```

**Ref Methods:**
- `throwDice()`: Roll random dice value
- `throwDiceWithValue(value)`: Roll specific value
- `isDiceAnimating`: Check if dice is currently rolling

**Props:**
- `gameState`: Current game state
- `onPieceClick`: Callback when piece is clicked
- `onDiceResult`: Callback when dice stops rolling

### DiceComponent

Physics-based 3D dice with realistic animation.

```typescript
function DiceComponent({
  position: [number, number, number],
  rotation: [number, number, number],
  isAnimating: boolean
}): JSX.Element
```

**Features:**
- Realistic physics simulation
- Gravity and bouncing effects
- Smooth tumbling animation
- GLB model loading

### GamePieces

Renders all player pieces on the board.

```typescript
function GamePieces({
  colors: ColorTheme,
  gameState: GameState,
  onPieceClick: (piece: GamePiece) => void
}): JSX.Element
```

**Features:**
- Automatic positioning based on game state
- Visual feedback for moveable pieces
- Selection highlighting
- Collision offset for overlapping pieces

### HomeAreas

Renders player starting areas.

```typescript
function HomeAreas({
  colors: ColorTheme,
  gameState: GameState
}): JSX.Element
```

**Features:**
- Color-coded home zones
- Circular piece slots
- Player name labels
- Modern minimalist design

### PlayingTrack

Renders the cross-shaped game path.

```typescript
function PlayingTrack({
  colors: ColorTheme
}): JSX.Element
```

**Features:**
- 52-square cross pattern
- Safe zone highlighting
- Home run paths
- Star markers for safe positions

### CenterArea

Renders the finish area with colored triangles.

```typescript
function CenterArea({
  colors: ColorTheme
}): JSX.Element
```

**Features:**
- Four colored triangular sections
- Represents each player's finish zone
- Rotated and scaled for visual appeal

---

## 🛠 Utility Functions

### getDiceRotationForValue

Returns the exact rotation needed to show a specific dice face.

```typescript
function getDiceRotationForValue(value: number): [number, number, number]
```

**Parameters:**
- `value`: Dice face to show (1-6)

**Returns:** Euler rotation angles `[x, y, z]`

**Usage Example:**
```typescript
const rotation = getDiceRotationForValue(6)
diceRef.current.rotation.set(...rotation)
```

### getNameForColor

Gets display name for a player color.

```typescript
function getNameForColor(color: 'yellow' | 'green' | 'blue' | 'red'): string
```

**Returns:** Player name or color fallback

### performAutoPlay

Executes AI move for current player.

```typescript
function performAutoPlay(): void
```

**AI Strategy:**
1. Roll dice if needed
2. Prioritize finishing pieces
3. Look for capture opportunities
4. Move pieces from home
5. Advance furthest piece

---

## 📊 Constants

### PLAYER_PATHS

Defines the movement paths for each player color.

```typescript
const PLAYER_PATHS = {
  yellow_path: number[][],  // 57 positions [x, z]
  green_path: number[][],   // 57 positions [x, z]
  blue_path: number[][],    // 57 positions [x, z]
  red_path: number[][]      // 57 positions [x, z]
}
```

**Usage:**
```typescript
const playerPath = PLAYER_PATHS[`${player.color}_path`]
const [x, z] = playerPath[piece.position]
```

### BOARD_POSITIONS

Game board configuration constants.

```typescript
const BOARD_POSITIONS = {
  START_POSITIONS: { yellow: 0, green: 0, blue: 0, red: 0 },
  SAFE_POSITIONS: [0, 8, 13, 21, 26, 34, 39, 47],
  HOME_RUN_START: 50,
  FINISHED_POSITION: 56
}
```

---

## 🎯 Event Handlers

### handleRollDice

Initiates dice rolling animation.

```typescript
function handleRollDice(): void
```

**Behavior:**
- Checks if dice is already animating
- Calls board's `throwDice()` method
- Prevents multiple simultaneous rolls

### handlePieceClick

Processes player piece selection and movement.

```typescript
function handlePieceClick(piece: GamePiece): void
```

**Validation:**
- Piece must be moveable (`canMove: true`)
- Dice value must be available
- Calculates and validates new position

### handleDiceResult

Processes dice roll results and updates game state.

```typescript
function handleDiceResult(value: number): void
```

**Actions:**
1. Prevents duplicate processing
2. Updates piece moveability
3. Handles no-move scenarios
4. Switches turns when needed
5. Triggers AI moves

### onGameStart

Initializes game with selected players.

```typescript
function onGameStart(players: Player[]): void
```

**Setup:**
- Sets game phase to 'playing'
- Initializes first player's turn
- Starts turn timer
- Enables auto-play

---

## 🎨 Component Props Reference

### LudoPlay (Main Component)

```typescript
// No props - self-contained game
<LudoPlay />
```

### GameUI

```typescript
interface GameUIProps {
  gameState: GameState
  onRollDice: () => void
  onPieceClick: (piece: GamePiece) => void
  onAutoPlay: () => void
  onToggleAutoPlay: () => void
}
```

### PlayerSetup

```typescript
interface PlayerSetupProps {
  onGameStart: (players: Player[]) => void
}
```

### AutoPlayTimer

```typescript
interface AutoPlayTimerProps {
  startTime: number
  onAutoPlay: () => void
  gameState: GameState
}
```

### CameraController

```typescript
interface CameraControllerProps {
  isSpacePressed: boolean
  resetCamera: boolean
  cameraView: string | null
}
```

---

## 🔧 Advanced Usage Examples

### Custom Game Rules

```typescript
interface CustomGameRules {
  startingDiceValue: number[]     // [6] or [1, 6]
  winCondition: 'all_pieces' | 'first_piece' | 'most_pieces'
  captureBonus: boolean          // Extra turn on capture
  safeZoneRules: 'standard' | 'none' | 'all_positions'
}

const applyCustomRules = (rules: CustomGameRules) => {
  // Modify canPieceMove function
  const canStart = rules.startingDiceValue.includes(diceValue)
  if (piece.position === -1 && !canStart) return false
}
```

### Game State Persistence

```typescript
const saveGameState = (gameState: GameState) => {
  localStorage.setItem('ludo_game_save', JSON.stringify({
    ...gameState,
    timestamp: Date.now()
  }))
}

const loadGameState = (): GameState | null => {
  const saved = localStorage.getItem('ludo_game_save')
  if (!saved) return null
  
  const data = JSON.parse(saved)
  // Validate and restore game state
  return data
}
```

### Custom Piece Animations

```typescript
function AnimatedPiece({ piece, targetPosition }: {
  piece: GamePiece
  targetPosition: [number, number, number]
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth movement
      meshRef.current.position.lerp(
        new THREE.Vector3(...targetPosition),
        delta * 3
      )
      
      // Bounce animation
      const bounce = Math.sin(state.clock.elapsedTime * 10) * 0.1
      meshRef.current.position.y = targetPosition[1] + bounce
    }
  })
  
  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[0.25, 0.3, 0.12]} />
      <meshStandardMaterial color={piece.color} />
    </mesh>
  )
}
```

---

## 🚀 Performance Optimization

### Memoization

```typescript
const MemoizedGamePieces = React.memo(GamePieces, (prevProps, nextProps) => {
  return (
    prevProps.gameState.players === nextProps.gameState.players &&
    prevProps.colors === nextProps.colors
  )
})
```

### Conditional Rendering

```typescript
// Only render dice when needed
{isDiceVisible && (
  <DiceComponent 
    position={dicePosition}
    rotation={diceRotation}
    isAnimating={isDiceAnimating}
  />
)}

// Reduce geometry on mobile
const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent)
const segments = isMobile ? 8 : 16
```

### Resource Management

```typescript
// Preload 3D models
useGLTF.preload('/dice_highres_red.glb')

// Dispose of geometries when unmounting
useEffect(() => {
  return () => {
    geometry.dispose()
    material.dispose()
  }
}, [])
```

---

This API reference provides complete documentation for building and extending the Ludo3 game. Use it as a reference while developing your custom features and modifications.
