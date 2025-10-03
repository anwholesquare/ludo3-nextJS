# 🚀 Quick Customization Guide

A rapid-fire guide for developers who want to customize the Ludo game immediately. Each section provides copy-paste code examples for instant results.

## 🎨 Visual Customizations (5 minutes)

### Change Board Colors

**File**: `components/ludo-play.tsx` (lines 142-176)

```typescript
// Add your custom theme to the colorThemes array
{
  name: 'Cyberpunk',
  boardBase: '#0f0f23',
  trackTiles: '#1a1a2e',
  players: {
    yellow: '#ffff00',
    green: '#00ff41',
    blue: '#0080ff',
    red: '#ff0080'
  }
},
{
  name: 'Forest',
  boardBase: '#2d5016',
  trackTiles: '#3d6b26',
  players: {
    yellow: '#ffd700',
    green: '#228b22',
    blue: '#4169e1',
    red: '#dc143c'
  }
}
```

### Custom Game Pieces

**File**: `components/ludo-play.tsx` (lines 927-975)

Replace the standard cylinder pieces with custom shapes:

```typescript
{/* Replace existing piece geometry with custom shapes */}

{/* Diamond pieces */}
<mesh position={[0, 0, 0]}>
  <octahedronGeometry args={[0.3]} />
  <meshStandardMaterial 
    color={pieceColor}
    roughness={0.1}
    metalness={0.8}
  />
</mesh>

{/* Or glowing spheres */}
<mesh position={[0, 0, 0]}>
  <sphereGeometry args={[0.25]} />
  <meshStandardMaterial 
    color={pieceColor}
    emissive={pieceColor}
    emissiveIntensity={0.3}
  />
</mesh>

{/* Or custom robot-like pieces */}
<group>
  {/* Body */}
  <mesh position={[0, 0, 0]}>
    <boxGeometry args={[0.3, 0.4, 0.3]} />
    <meshStandardMaterial color={pieceColor} />
  </mesh>
  {/* Head */}
  <mesh position={[0, 0.3, 0]}>
    <sphereGeometry args={[0.15]} />
    <meshStandardMaterial color={pieceColor} />
  </mesh>
</group>
```

### Board Size and Layout

**File**: `components/ludo-play.tsx` (line 279)

```typescript
// Make board bigger
<boxGeometry args={[20, 0.3, 20]} /> // Was [15, 0.3, 15]

// Update home positions accordingly (lines 337-341)
const homes = [
  { color: colors.players.yellow, x: -6, z: -6, name: getNameForColor('yellow') },
  { color: colors.players.green, x: -6, z: 6, name: getNameForColor('green') },
  { color: colors.players.blue, x: 6, z: 6, name: getNameForColor('blue') },
  { color: colors.players.red, x: 6, z: -6, name: getNameForColor('red') }
]
```

## 🎮 Gameplay Modifications (10 minutes)

### Change Winning Condition

**File**: `components/ludo-play.tsx` (lines 1537-1543)

```typescript
// Win with 3 pieces instead of 4
const finishedPieces = newState.players[playerIndex].pieces.filter(p => p.position === 57).length
if (finishedPieces === 3) { // Changed from 4
  newState.winner = newState.players[playerIndex]
  newState.gamePhase = 'finished'
  return newState
}

// Or win by capturing 5 opponent pieces
const capturedPieces = gameHistory.filter(event => 
  event.type === 'capture' && event.capturer === newState.players[playerIndex].id
).length
if (capturedPieces >= 5) {
  newState.winner = newState.players[playerIndex]
  newState.gamePhase = 'finished'
  return newState
}
```

### Custom Dice Rules

**File**: `components/ludo-play.tsx` (lines 1459-1472)

```typescript
const canPieceMove = (piece: GamePiece, diceValue: number, player: Player): boolean => {
  if (!diceValue) return false
  
  // CUSTOM RULE: Need 1 OR 6 to start (instead of just 6)
  if (piece.position === -1 && diceValue !== 6 && diceValue !== 1) return false
  
  // CUSTOM RULE: Can't move on odd numbers if piece is on even position
  if (piece.position % 2 === 0 && diceValue % 2 === 1) return false
  
  if (piece.position === 57) return false
  
  const newPosition = calculateNewPosition(piece, diceValue, player)
  return newPosition !== null
}
```

### Add Power-ups

**File**: `components/ludo-play.tsx` (add after line 36)

```typescript
interface PowerUp {
  id: string
  type: 'double_move' | 'safe_turn' | 'extra_roll'
  position: [number, number, number]
  isActive: boolean
}

// Add to GameState interface
interface GameState {
  // ... existing properties
  powerUps: PowerUp[]
  playerPowerUps: Record<string, PowerUp[]>
}

// Power-up collection logic
const collectPowerUp = (piece: GamePiece, position: number) => {
  const powerUp = gameState.powerUps.find(p => 
    p.isActive && 
    Math.abs(p.position[0] - getPositionCoordinates(position, piece.color)[0]) < 0.5
  )
  
  if (powerUp) {
    // Add power-up to player
    setGameState(prev => ({
      ...prev,
      playerPowerUps: {
        ...prev.playerPowerUps,
        [piece.playerId]: [...(prev.playerPowerUps[piece.playerId] || []), powerUp]
      },
      powerUps: prev.powerUps.map(p => 
        p.id === powerUp.id ? { ...p, isActive: false } : p
      )
    }))
  }
}
```

## 🔊 Add Sound Effects (5 minutes)

### Install Audio Library

```bash
npm install howler @types/howler
```

### Add Sound Manager

**File**: Create `lib/sounds.ts`

```typescript
import { Howl } from 'howler'

export const sounds = {
  diceRoll: new Howl({
    src: ['/sounds/dice-roll.mp3'],
    volume: 0.5
  }),
  pieceMove: new Howl({
    src: ['/sounds/piece-move.mp3'],
    volume: 0.3
  }),
  capture: new Howl({
    src: ['/sounds/capture.mp3'],
    volume: 0.7
  }),
  win: new Howl({
    src: ['/sounds/win.mp3'],
    volume: 0.8
  }),
  buttonClick: new Howl({
    src: ['/sounds/click.mp3'],
    volume: 0.2
  })
}

export const playSound = (soundName: keyof typeof sounds) => {
  try {
    sounds[soundName].play()
  } catch (error) {
    console.warn('Could not play sound:', soundName)
  }
}
```

### Integrate Sounds

**File**: `components/ludo-play.tsx`

```typescript
import { playSound } from '@/lib/sounds'

// Add to dice roll (line 1575)
const handleRollDice = () => {
  if (ludoBoardRef.current && !ludoBoardRef.current.isDiceAnimating) {
    playSound('diceRoll') // Add this line
    ludoBoardRef.current.throwDice()
  }
}

// Add to piece movement (line 1512)
const movePiece = (piece: GamePiece, newPosition: number) => {
  playSound('pieceMove') // Add this line
  
  setGameState(prevState => {
    // ... existing logic
    
    // Add capture sound
    if (captureOccurred) {
      playSound('capture')
    }
    
    // Add win sound
    if (finishedPieces === 4) {
      playSound('win')
    }
    
    return newState
  })
}
```

## 🤖 Add AI Players (15 minutes)

### Basic AI Implementation

**File**: `components/ludo-play.tsx` (add after line 1627)

```typescript
const makeAIMove = async (player: Player, diceValue: number) => {
  // Wait a bit for realism
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const moveablePieces = player.pieces.filter(p => canPieceMove(p, diceValue, player))
  
  if (moveablePieces.length === 0) {
    // No moves available, skip turn
    setGameState(prev => ({
      ...prev,
      currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length,
      diceValue: null,
      canRollAgain: false,
      turnStartTime: Date.now()
    }))
    return
  }
  
  // AI Strategy
  let bestMove = null
  
  // 1. Try to finish a piece
  bestMove = moveablePieces.find(piece => {
    const newPos = calculateNewPosition(piece, diceValue, player)
    return newPos === 57
  })
  
  // 2. Try to capture opponent
  if (!bestMove) {
    bestMove = moveablePieces.find(piece => {
      const newPos = calculateNewPosition(piece, diceValue, player)
      return canCaptureAt(newPos, player)
    })
  }
  
  // 3. Move from home if possible
  if (!bestMove && diceValue === 6) {
    bestMove = moveablePieces.find(p => p.position === -1)
  }
  
  // 4. Move furthest piece
  if (!bestMove) {
    bestMove = moveablePieces.reduce((furthest, current) => 
      current.position > furthest.position ? current : furthest
    )
  }
  
  if (bestMove) {
    const newPosition = calculateNewPosition(bestMove, diceValue, player)
    if (newPosition !== null) {
      handlePieceClick(bestMove)
    }
  }
}

const canCaptureAt = (position: number, player: Player): boolean => {
  if (position < 0 || position >= 57) return false
  if (BOARD_POSITIONS.SAFE_POSITIONS.includes(position)) return false
  
  return gameState.players.some(opponent => 
    opponent.id !== player.id && 
    opponent.pieces.some(piece => piece.position === position)
  )
}

// Add AI player detection
const isAIPlayer = (player: Player): boolean => {
  return player.name.startsWith('AI') || player.id.includes('ai')
}

// Modify handleDiceResult to trigger AI moves
const handleDiceResult = (value: number) => {
  // ... existing logic
  
  setTimeout(() => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    
    // Check if current player is AI
    if (isAIPlayer(currentPlayer)) {
      makeAIMove(currentPlayer, value)
    }
  }, 1000)
}
```

### Add AI Players in Setup

**File**: `components/ludo-play.tsx` (modify PlayerSetup component around line 1220)

```typescript
// Add AI option in player setup
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium mb-2">Player Type:</label>
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => setPlayerType('human')}
        className={`py-2 px-4 rounded ${playerType === 'human' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        Human
      </button>
      <button
        onClick={() => setPlayerType('ai')}
        className={`py-2 px-4 rounded ${playerType === 'ai' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        AI Player
      </button>
    </div>
  </div>
  
  {playerType === 'ai' ? (
    <div>
      <input
        type="text"
        value={`AI Player ${currentPlayerSetup + 1}`}
        readOnly
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
      />
    </div>
  ) : (
    <div>
      <label className="block text-sm font-medium mb-2">Player Name:</label>
      <input
        type="text"
        value={currentPlayer?.name || ''}
        onChange={(e) => handlePlayerNameChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        placeholder="Enter player name"
      />
    </div>
  )}
</div>
```

## 📱 Mobile Optimizations (5 minutes)

### Touch-Friendly Controls

**File**: `components/ludo-play.tsx` (add after line 1800)

```typescript
// Detect mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

// Mobile-specific camera settings
<Canvas camera={{ 
  position: isMobile ? [0, 15, 15] : [0, 12, 12], 
  fov: isMobile ? 70 : 60 
}}>
  <OrbitControls 
    enablePan={true}
    enableZoom={true}
    enableRotate={!isSpacePressed}
    minDistance={isMobile ? 10 : 8}
    maxDistance={isMobile ? 50 : 40}
    // Mobile-specific settings
    enableDamping={true}
    dampingFactor={0.05}
    rotateSpeed={isMobile ? 0.5 : 1}
    zoomSpeed={isMobile ? 0.5 : 1}
    panSpeed={isMobile ? 0.5 : 1}
  />
</Canvas>

// Larger touch targets for mobile
{isMobile && (
  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
    <button
      onClick={handleRollDice}
      className="bg-blue-500 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg"
      disabled={gameState.diceValue !== null && !gameState.canRollAgain}
    >
      🎲 Roll Dice
    </button>
  </div>
)}
```

### Performance Optimizations

**File**: `components/ludo-play.tsx`

```typescript
// Reduce geometry complexity on mobile
const geometryArgs = isMobile ? [0.25, 0.3, 0.08, 8] : [0.25, 0.3, 0.12, 16]

<cylinderGeometry args={geometryArgs} />

// Conditional shadows
<directionalLight 
  position={[10, 10, 5]} 
  intensity={1.0}
  castShadow={!isMobile}
  shadow-mapSize-width={isMobile ? 512 : 2048}
  shadow-mapSize-height={isMobile ? 512 : 2048}
/>

// Reduce particle effects on mobile
{!isMobile && (
  <DiceComponent 
    position={dicePosition}
    rotation={diceRotation}
    isAnimating={isDiceAnimating}
  />
)}
```

## 🎯 Quick Testing Commands

```bash
# Test different screen sizes
# Add to package.json scripts:
"dev:mobile": "next dev --turbopack --port 3001",
"test:build": "next build && next start",
"analyze": "ANALYZE=true next build"

# Quick deployment test
vercel --prod

# Performance testing
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

## 🔧 Common Quick Fixes

### Fix Dice Not Showing
```typescript
// Check if GLB file exists in public folder
// Verify path in DiceComponent
const { scene: diceModel } = useGLTF('/dice_highres_red.glb')
```

### Fix Piece Movement Issues
```typescript
// Ensure position calculations are correct
console.log('Piece position:', piece.position)
console.log('New position:', newPosition)
console.log('Player path:', PLAYER_PATHS[`${player.color}_path`])
```

### Fix Camera Controls
```typescript
// Reset camera position
<Canvas camera={{ position: [0, 12, 12], fov: 60 }}>
  <OrbitControls makeDefault />
</Canvas>
```

---

## 🚀 Ready-to-Use Code Snippets

### Particle Effects for Captures
```typescript
function CaptureEffect({ position }: { position: [number, number, number] }) {
  const points = useMemo(() => {
    const temp = []
    for (let i = 0; i < 50; i++) {
      temp.push(new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2,
        (Math.random() - 0.5) * 2
      ))
    }
    return temp
  }, [])

  return (
    <points position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#ff0000" />
    </points>
  )
}
```

### Game Statistics Tracker
```typescript
const [gameStats, setGameStats] = useState({
  totalMoves: 0,
  captures: 0,
  gameStartTime: Date.now(),
  playerMoves: {} as Record<string, number>
})

// Track moves
const trackMove = (playerId: string) => {
  setGameStats(prev => ({
    ...prev,
    totalMoves: prev.totalMoves + 1,
    playerMoves: {
      ...prev.playerMoves,
      [playerId]: (prev.playerMoves[playerId] || 0) + 1
    }
  }))
}
```

### Custom Victory Animation
```typescript
function VictoryFireworks() {
  return (
    <group>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 20,
          Math.random() * 10 + 5,
          (Math.random() - 0.5) * 20
        ]}>
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial color={`hsl(${Math.random() * 360}, 100%, 50%)`} />
        </mesh>
      ))}
    </group>
  )
}
```

That's it! You now have everything you need to quickly customize your Ludo game. Each modification takes just a few minutes to implement. Happy coding! 🎮
