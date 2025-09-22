'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, useGLTF } from '@react-three/drei'
import { useRef, useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Game types and interfaces
interface Player {
  id: string
  name: string
  color: 'yellow' | 'green' | 'blue' | 'red'
  pieces: GamePiece[]
  isActive: boolean
}

interface GamePiece {
  id: string
  playerId: string
  position: number // -1 = home, 0-56 = path positions, 57 = finished
  isSelected: boolean
  canMove: boolean
}

interface GameState {
  players: Player[]
  currentPlayerIndex: number
  diceValue: number | null
  gamePhase: 'setup' | 'playing' | 'finished'
  winner: Player | null
  lastRoll: number | null
  canRollAgain: boolean
  turnStartTime: number | null
  autoPlayEnabled: boolean
}

// Load player paths from JSON
let PLAYER_PATHS  = {
  yellow_path: [
      [-6,-1], [-5,1], [-4,-1], [-3, -1], [-2,-1],
      [-1,-2], [-1,-3], [-1,-4], [-1,-5], [-1,-6], [-1,-7],
      [0,-7], [1,-7], 
      [1,-6], [1,-5], [1,-4], [1,-3], [1,-2],
      [2,-1], [3,-1], [4,-1], [5,-1], [6,-1], [7,-1],
      [7,0], [7,1],
      [6,1], [5,1], [4,1], [3,1], [2,1],
      [1,2], [1,3], [1,4], [1,5], [1,6], [1,7],
      [0,7], [-1,7], 
      [-1,6], [-1,5], [-1,4], [-1,3], [-1,2],
      [-2,1], [-3,1], [-4,1], [-5,1], [-6,1], [-7,1],
      [-7,0],
      [-6,0], [-5,0], [-4,0], [-3,0], [-2,0],[-1,0]
  ],
  blue_path: [
      [6,1], [5,1], [4,1], [3,1], [2,1],
      [1,2], [1,3], [1,4], [1,5], [1,6], [1,7],
      [0,7], [-1,7], 
      [-1,6], [-1,5], [-1,4], [-1,3], [-1,2],
      [-2,1], [-3,1], [-4,1], [-5,1], [-6,1], [-7,1],
      [-7,0], [-7,-1],
      [-6,-1], [-5,1], [-4,-1], [-3, -1], [-2,-1],
      [-1,-2], [-1,-3], [-1,-4], [-1,-5], [-1,-6], [-1,-7],
      [0,-7], [1,-7], 
      [1,-6], [1,-5], [1,-4], [1,-3], [1,-2],
      [2,-1], [3,-1], [4,-1], [5,-1], [6,-1], [7,-1],
      [7,0],
      [6,0], [5,0], [4,0],[3,0],[2,0],[1,0]
  ],
  red_path: [
      [1,-6], [1,-5], [1,-4], [1,-3], [1,-2],
      [2,-1], [3,-1], [4,-1], [5,-1], [6,-1], [7,-1],
      [7,0], [7,1],
      [6,1], [5,1], [4,1], [3,1], [2,1],
      [1,2], [1,3], [1,4], [1,5], [1,6], [1,7],
      [0,7], [-1,7], 
      [-1,6], [-1,5], [-1,4], [-1,3], [-1,2],
      [-2,1], [-3,1], [-4,1], [-5,1], [-6,1], [-7,1],
      [-7,0], [-7,-1],
      [-6,-1], [-5,1], [-4,-1], [-3, -1], [-2,-1],
      [-1,-2], [-1,-3], [-1,-4], [-1,-5], [-1,-6], [-1,-7],
      [0,-7], 
      [0,-6], [0,-5], [0,-4], [0,-3], [0,-2],[0,-1]

  ],
  green_path: [
      [-1,6], [-1,5], [-1,4], [-1,3], [-1,2],
      [-2,1], [-3,1], [-4,1], [-5,1], [-6,1], [-7,1],
      [-7,0], [-7,-1],
      [-6,-1], [-5,1], [-4,-1], [-3, -1], [-2,-1],
      [-1,-2], [-1,-3], [-1,-4], [-1,-5], [-1,-6], [-1,-7],
      [0,-7], [1,-7],
      [1,-6], [1,-5], [1,-4], [1,-3], [1,-2],
      [2,-1], [3,-1], [4,-1], [5,-1], [6,-1], [7,-1],
      [7,0], [7,1],
      [6,1], [5,1], [4,1], [3,1], [2,1],
      [1,2], [1,3], [1,4], [1,5], [1,6], [1,7],
      [0,7],
      [0,6], [0,5], [0,4], [0,3], [0,2], [0,1]
  ]
}



// Board position mapping - path-based Ludo layout
const BOARD_POSITIONS = {
  // Starting positions for each color (first position in their path)
  START_POSITIONS: { yellow: 0, green: 0, blue: 0, red: 0 },
  // Safe positions on main track (star positions)
  SAFE_POSITIONS: [0, 8, 13, 21, 26, 34, 39, 47],
  // Home run start (last 6 positions of each path)
  HOME_RUN_START: 50,
  // Finished position
  FINISHED_POSITION: 56
}

// Simple working Ludo board with color themes
const LudoBoard = forwardRef<{ 
  throwDice: () => void, 
  throwDiceWithValue: (value?: number) => void,
  isDiceAnimating: boolean 
}, { gameState: GameState, onPieceClick: (piece: GamePiece) => void, onDiceResult: (value: number) => void }>(function LudoBoard({ gameState, onPieceClick, onDiceResult }, ref) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [currentTheme, setCurrentTheme] = useState(0)
  const [diceValue, setDiceValue] = useState(1)
  const [isDiceAnimating, setIsDiceAnimating] = useState(false)
  const [isDiceVisible, setIsDiceVisible] = useState(false) // Start hidden, show during animation
  const [dicePosition, setDicePosition] = useState<[number, number, number]>([0, 1.2, 0]) // Center position
  const [diceRotation, setDiceRotation] = useState<[number, number, number]>([0, 0, 0])
  const [diceVelocity, setDiceVelocity] = useState<[number, number, number]>([0, 0, 0])
  const [diceAngularVelocity, setDiceAngularVelocity] = useState<[number, number, number]>([0, 0, 0])
  const [targetValue, setTargetValue] = useState(1)
  const [isDiceActive, setIsDiceActive] = useState(false) // True from throw until vanish

  // Color themes for the board
  const colorThemes = [
    {
      name: 'Dark',
      boardBase: '#2F2F2F',
      trackTiles: '#404040',
      players: {
        yellow: '#DAA520',
        green: '#228B22',
        blue: '#4169E1',
        red: '#DC143C'
      }
    }
    // {
    //   name: 'Classic',
    //   boardBase: '#F0F000',
    //   trackTiles: '#FFFFFF',
    //   players: {
    //     yellow: '#FFD700',
    //     green: '#00CED1', 
    //     blue: '#1E90FF',
    //     red: '#FF6347'
    //   }
    // },
    // {
    //   name: 'Ocean',
    //   boardBase: '#737373',
    //   trackTiles: '#E0FFFF',
    //   players: {
    //     yellow: '#FFD700',
    //     green: '#00CED1',
    //     blue: '#1E90FF',
    //     red: '#FF6347'
    //   }
    // }
  ]

  const currentColors = colorThemes[currentTheme]

  const handleClick = () => {
    setCurrentTheme((prev) => (prev + 1) % colorThemes.length)
  }

  // Get the exact rotation to show a specific dice value
  const getDiceRotationForValue = (value: number): [number, number, number] => {
    switch (value) {
      case 1: return [Math.PI/2, 0, 0] // This rotation shows face 1 (confirmed by key 4)
      case 2: return [Math.PI,0,0] // Try different rotation for face 2
      case 3: return [3* Math.PI/ 2, Math.PI/2, 0] // Try different rotation 
      case 4: return [3* Math.PI/ 2, -Math.PI/2, 0] // Opposite of face 1
      case 5: return [0, 0, 0] // This was showing for keys 1,5,6 - assign to 5
      case 6: return [-Math.PI/2, 0, 0] // This rotation shows face 6 (confirmed by key 3)
      default: return [0, 0, 0]
    }
  }


  // Realistic dice throwing with physics animation
  const throwDiceWithValue = (specificValue?: number) => {
    if (isDiceActive) {
      // Prevent multiple throws - blocked message is handled in main component
      return
    }
    
    setIsDiceAnimating(true)
    setIsDiceVisible(true)
    setIsDiceActive(true) // Mark dice as active for entire lifecycle
    
    // Use specific value or generate random
    const newValue = specificValue || Math.floor(Math.random() * 6) + 1
    setTargetValue(newValue)
    setDiceValue(newValue)
    
    // Start from above center, thrown with realistic physics
    const centerX = 0
    const centerZ = 0
    
    // Start directly above center and fall straight down to center
    const initialPosition: [number, number, number] = [
      centerX, // No horizontal offset - start directly above center
      8,       // Start 8 units high
      centerZ  // No depth offset - start directly above center
    ]
    const initialVelocity: [number, number, number] = [
      0,  // No horizontal velocity - fall straight down
      1,  // Small upward velocity for natural arc
      0   // No depth velocity - fall straight down
    ]
    const initialAngularVelocity: [number, number, number] = [
      (Math.random() - 0.5) * 12, // Reduced initial tumbling (was 20)
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12
    ]
    const initialRotation: [number, number, number] = [
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    ]
    
    // Set initial physics state
    setDicePosition(initialPosition)
    setDiceRotation(initialRotation)
    setDiceVelocity(initialVelocity)
    setDiceAngularVelocity(initialAngularVelocity)
    
    // Simple: physics stops, show exact value immediately
    setTimeout(() => {
      setIsDiceAnimating(false)
      setDicePosition([centerX, 1.2, centerZ])
      setDiceRotation(getDiceRotationForValue(newValue))
      
      console.log(`Dice showing exact value: ${newValue}`)
      
      // Notify parent of dice result
      onDiceResult(newValue)
      
      // Vanish after 5 seconds and mark as inactive
      setTimeout(() => {
        setIsDiceVisible(false)
        setIsDiceActive(false) // Mark dice as inactive - ready for next throw
      }, 2000)
    }, 2000) // 2 seconds for physics

    
  }

  // Legacy function for random throws
  const throwDice = () => throwDiceWithValue()

  // Expose dice functions to parent
  useImperativeHandle(ref, () => ({
    throwDice,
    throwDiceWithValue,
    isDiceAnimating: isDiceActive // Use isDiceActive instead of isDiceAnimating
  }))

  return (
    <group>
      {/* Board base */}
      <mesh ref={meshRef} position={[0, 0, 0]} onClick={handleClick}>
        <boxGeometry args={[15, 0.3, 15]} />
        <meshStandardMaterial color={currentColors.boardBase} />
      </mesh>

      {/* Board components */}
      <BoardComponents colors={currentColors} gameState={gameState} onPieceClick={onPieceClick} />
      
      {/* 3D Dice with Physics - only show when visible */}
      {isDiceVisible && (
        <DiceComponent 
          position={dicePosition}
          rotation={diceRotation}
          value={diceValue}
          isAnimating={isDiceAnimating}
        />
      )}
    </group>
  )
})

// All board components
function BoardComponents({ colors, gameState, onPieceClick }: { 
  colors: any, 
  gameState: GameState, 
  onPieceClick: (piece: GamePiece) => void 
}) {
  return (
    <group>
      {/* Home areas */}
      <HomeAreas colors={colors} gameState={gameState} />
      
      {/* Playing track */}
      <PlayingTrack colors={colors} />
      
      {/* Center area */}
      <CenterArea colors={colors} />
      
      {/* Game pieces */}
      <GamePieces colors={colors} gameState={gameState} onPieceClick={onPieceClick} />
      
    </group>
  )
}

// Modern minimalist home areas
function HomeAreas({ colors, gameState }: { colors: any, gameState: GameState }) {
  const getNameForColor = (color: 'yellow' | 'green' | 'blue' | 'red') => {
    const player = gameState.players.find(p => p.color === color)
    if (player?.name) return player.name
    // Fallbacks during setup or if not selected yet
    switch (color) {
      case 'yellow': return 'Yellow'
      case 'green': return 'Green'
      case 'blue': return 'Blue'
      case 'red': return 'Red'
    }
  }

  const homes = [
    { color: colors.players.yellow, x: -4.5, z: -4.5, name: getNameForColor('yellow') }, // Yellow
    { color: colors.players.green, x: -4.5, z: 4.5, name: getNameForColor('green') },   // Green
    { color: colors.players.blue, x: 4.5, z: 4.5, name: getNameForColor('blue') },     // Blue
    { color: colors.players.red, x: 4.5, z: -4.5, name: getNameForColor('red') }      // Red
  ]

  return (
    <>
      {homes.map((home, index) => (
        <group key={index}>
          {/* Modern flat base with subtle gradient */}
          <mesh position={[home.x, 0.16, home.z]}>
            <boxGeometry args={[6, 0.02, 6]} />
            <meshStandardMaterial 
              color={home.color} 
              roughness={0.1}
              metalness={0.0}
              transparent
              opacity={0.9}
            />
          </mesh>
          
          {/* Clean white center area */}
          <mesh position={[home.x, 0.17, home.z]}>
            <boxGeometry args={[4.5, 0.01, 4.5]} />
            <meshStandardMaterial 
              color="#FAFAFA" 
              roughness={0.05}
              metalness={0.0}
            />
          </mesh>
          
         
          
          {/* Modern circular slots */}
          {[[-1.1, -1.1], [1.1, -1.1], [1.1, 1.1], [-1.1, 1.1]].map((offset, i) => (
            <group key={i}>
              {/* Slot base */}
              <mesh position={[home.x + offset[0], 0.175, home.z + offset[1]]}>
                <cylinderGeometry args={[0.4, 0.4, 0.005]} />
                <meshStandardMaterial 
                  color="#A0A0A0" 
                  roughness={0.1}
                  metalness={0.0}
                />
              </mesh>
              
            
              
              {/* Inner circle for contrast */}
              <mesh position={[home.x + offset[0], 0.177, home.z + offset[1]]}>
                <cylinderGeometry args={[0.3, 0.3, 0.002]} />
                <meshStandardMaterial 
                  color="#FFFFFF"
                  roughness={0.0}
                  metalness={0.0}
                />
              </mesh>
            </group>
          ))}
          
          {/* Modern typography label */}
          <Text
            position={[home.x, 0.19, home.z]}
            fontSize={0.4}
            color="#000000"
            anchorX="center"
            anchorY="middle"
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {home.name}
          </Text>
          
        </group>
      ))}
    </>
  )
}

// Cross-shaped playing track with safe zones
function PlayingTrack({ colors }: { colors: any }) {
  const squares = []
  
  // Safe zone positions with dynamic colors
  const safeZones = [
    // Entry safe zones (player colors)
    { x: -6, z: -1, color: colors.players.yellow }, // Yellow entry area
    { x: 6, z: 1, color: colors.players.blue },     // Blue entry area
    { x: 1, z: -6, color: colors.players.red },     // Red entry area
    { x: -1, z: 6, color: colors.players.green },   // Green entry area
    
    // Corner safe zones (neutral dark)
    { x: 1, z: 5, color: '#1a1a1a' },   // Neutral
    { x: -1, z: -5, color: '#1a1a1a' }, // Neutral
    { x: -5, z: 1, color: '#1a1a1a' },  // Neutral
    { x: 5, z: -1, color: '#1a1a1a' },  // Neutral
  ]


  
  // Get safe zone color for position
  const getSafeZoneColor = (x: number, z: number) => {
    const safeZone = safeZones.find(safe => safe.x === x && safe.z === z)
    return safeZone ? safeZone.color : colors.trackTiles
  }
  
  // Check if position is a safe zone
  const isSafeZone = (x: number, z: number) => {
    return safeZones.some(safe => safe.x === x && safe.z === z)
  }
  
  // Horizontal track
  for (let x = -7; x <= 7; x++) {
    for (let z = -1; z <= 1; z++) {
      const color = getSafeZoneColor(x, z)
      squares.push(
        <mesh key={`h-${x}-${z}`} position={[x, 0.16, z]}>
          <boxGeometry args={[0.9, 0.02, 0.9]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )
    }
  }
  
  // Vertical track
  for (let z = -7; z <= 7; z++) {
    for (let x = -1; x <= 1; x++) {
      if (Math.abs(z) > 1 || Math.abs(x) > 1) {
        const color = getSafeZoneColor(x, z)
        squares.push(
          <mesh key={`v-${x}-${z}`} position={[x, 0.16, z]}>
            <boxGeometry args={[0.9, 0.02, 0.9]} />
            <meshStandardMaterial color={color} />
          </mesh>
        )
      }
    }
  }

  // Home run paths
  const homeRuns = [
    { color: colors.players.yellow, positions: [[-6, 0.17, 0], [-5, 0.17, 0], [-4, 0.17, 0], [-3, 0.17, 0], [-2, 0.17, 0]] },
    { color: colors.players.green, positions: [[0, 0.17, 6], [0, 0.17, 5], [0, 0.17, 4], [0, 0.17, 3], [0, 0.17, 2]] },
    { color: colors.players.blue, positions: [[6, 0.17, 0], [5, 0.17, 0], [4, 0.17, 0], [3, 0.17, 0], [2, 0.17, 0]] },
    { color: colors.players.red, positions: [[0, 0.17, -6], [0, 0.17, -5], [0, 0.17, -4], [0, 0.17, -3], [0, 0.17, -2]] }
  ]

  homeRuns.forEach((run, runIndex) => {
    run.positions.forEach((pos, posIndex) => {
      squares.push(
        <mesh key={`run-${runIndex}-${posIndex}`} position={pos as [number, number, number]}>
          <boxGeometry args={[0.8, 0.02, 0.8]} />
          <meshStandardMaterial color={run.color} />
        </mesh>
      )
    })
  })

  return (
    <>
      {squares}
      {/* Star markers for safe zones */}
      <SafeZoneStars safeZones={safeZones} />
    </>
  )
}

// Safe zone star markers
function SafeZoneStars({ safeZones }: { safeZones: Array<{ x: number, z: number, color: string }> }) {
  return (
    <>
      {safeZones.map((zone, index) => (
        <group key={`star-${index}`}>
          {/* Star symbol using Text - white for visibility on colored background */}
          <Text
            position={[zone.x, 0.18, zone.z]}
            fontSize={0.5}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            rotation={[-Math.PI / 2, 0, 0]}
          >
            ⭐
          </Text>
        </group>
      ))}
    </>
  )
}



// Center finish area with 4 colored triangles
function CenterArea({ colors }: { colors: any }) {
  // Create triangle geometries using BufferGeometry
  const triangleGeometries = useMemo(() => {
    // Yellow triangle (top-right quadrant)
    const yellowGeometry = new THREE.BufferGeometry()
    const yellowVertices = new Float32Array([
      0, 0, 0,     // Center
      1.5, 0, 0,   // Right
      0, 0, -1.5   // Top
    ])
    const yellowNormals = new Float32Array([
      0, 1, 0,
      0, 1, 0,
      0, 1, 0
    ])
    yellowGeometry.setAttribute('position', new THREE.BufferAttribute(yellowVertices, 3))
    yellowGeometry.setAttribute('normal', new THREE.BufferAttribute(yellowNormals, 3))
    yellowGeometry.setIndex([0, 1, 2])

    // Green triangle (top-left quadrant)
    const greenGeometry = new THREE.BufferGeometry()
    const greenVertices = new Float32Array([
      0, 0, 0,     // Center
      0, 0, -1.5,  // Top
      -1.5, 0, 0   // Left
    ])
    const greenNormals = new Float32Array([
      0, 1, 0,
      0, 1, 0,
      0, 1, 0
    ])
    greenGeometry.setAttribute('position', new THREE.BufferAttribute(greenVertices, 3))
    greenGeometry.setAttribute('normal', new THREE.BufferAttribute(greenNormals, 3))
    greenGeometry.setIndex([0, 1, 2])

    // Blue triangle (bottom-left quadrant)
    const blueGeometry = new THREE.BufferGeometry()
    const blueVertices = new Float32Array([
      0, 0, 0,     // Center
      -1.5, 0, 0,  // Left
      0, 0, 1.5    // Bottom
    ])
    const blueNormals = new Float32Array([
      0, 1, 0,
      0, 1, 0,
      0, 1, 0
    ])
    blueGeometry.setAttribute('position', new THREE.BufferAttribute(blueVertices, 3))
    blueGeometry.setAttribute('normal', new THREE.BufferAttribute(blueNormals, 3))
    blueGeometry.setIndex([0, 1, 2])

    // Red triangle (bottom-right quadrant)
    const redGeometry = new THREE.BufferGeometry()
    const redVertices = new Float32Array([
      0, 0, 0,     // Center
      0, 0, 1.5,   // Bottom
      1.5, 0, 0    // Right
    ])
    const redNormals = new Float32Array([
      0, 1, 0,
      0, 1, 0,
      0, 1, 0
    ])
    redGeometry.setAttribute('position', new THREE.BufferAttribute(redVertices, 3))
    redGeometry.setAttribute('normal', new THREE.BufferAttribute(redNormals, 3))
    redGeometry.setIndex([0, 1, 2])

    return { yellowGeometry, greenGeometry, blueGeometry, redGeometry }
  }, [])

  return (
    <group rotation={[0, (Math.PI / 4 )+ (Math.PI /2), 0]} scale={[1.40, 1, 1.40]}>

      {/* Yellow triangle (top-right quadrant) */}
      <mesh position={[0, 0.19, 0]}>
        <primitive object={triangleGeometries.yellowGeometry} />
        <meshStandardMaterial 
          color={colors.players.yellow}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Green triangle (top-left quadrant) */}
      <mesh position={[0, 0.19, 0]}>
        <primitive object={triangleGeometries.greenGeometry} />
        <meshStandardMaterial 
          color={colors.players.green}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Blue triangle (bottom-left quadrant) */}
      <mesh position={[0, 0.19, 0]}>
        <primitive object={triangleGeometries.blueGeometry} />
        <meshStandardMaterial 
          color={colors.players.blue}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Red triangle (bottom-right quadrant) */}
      <mesh position={[0, 0.19, 0]}>
        <primitive object={triangleGeometries.redGeometry} />
        <meshStandardMaterial 
          color={colors.players.red}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// 3D Dice with GLB model and Three.js rotation
function DiceComponent({ position, rotation, value, isAnimating }: { 
  position: [number, number, number], 
  rotation: [number, number, number], 
  value: number,
  isAnimating: boolean
}) {
  const diceRef = useRef<THREE.Group>(null)
  const [currentPosition, setCurrentPosition] = useState(position)
  const [currentVelocity, setCurrentVelocity] = useState<[number, number, number]>([0, 0, 0])
  const [currentAngularVelocity, setCurrentAngularVelocity] = useState<[number, number, number]>([0, 0, 0])
  
  // Load the GLB dice model
  const { scene: diceModel } = useGLTF('/dice_highres_red.glb')
  
  // Clone the model to avoid sharing between instances
  const clonedModel = useMemo(() => {
    const cloned = diceModel.clone()
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return cloned
  }, [diceModel])

  // Initialize physics when animation starts
  useEffect(() => {
    if (isAnimating) {
      setCurrentPosition(position)
      // Initialize velocities from parent component's initial values
      setCurrentVelocity([0, 1, 0]) // Fall straight down with small upward start
      setCurrentAngularVelocity([
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12
      ])
    }
  }, [isAnimating, position])

  // Realistic physics simulation with smooth animation
  useFrame((state, delta) => {
    if (isAnimating && diceRef.current) {
      const gravity = -9.8 * 3 // Strong gravity for realistic fall
      const friction = 0.98 // Air resistance
      const bounceDamping = 0.4 // More energy loss on bounce (was 0.65)
      const angularDamping = 0.92 // Much stronger angular damping (was 0.985)
      const groundLevel = 1.2 // Board surface level (slightly above center)
      const groundAngularDamping = 0.85 // Extra damping when touching ground

      // Update velocity with gravity
      setCurrentVelocity(prev => [
        prev[0] * friction,
        prev[1] + gravity * delta,
        prev[2] * friction
      ])

      // Update angular velocity with damping (stronger when on ground)
      const isOnGround = currentPosition[1] <= groundLevel + 0.1
      const currentAngularDampingRate = isOnGround ? groundAngularDamping : angularDamping
      
      setCurrentAngularVelocity(prev => [
        prev[0] * currentAngularDampingRate,
        prev[1] * currentAngularDampingRate, 
        prev[2] * currentAngularDampingRate
      ])

      // Update position
      setCurrentPosition(prev => {
        const newPos: [number, number, number] = [
          prev[0] + currentVelocity[0] * delta,
          prev[1] + currentVelocity[1] * delta,
          prev[2] + currentVelocity[2] * delta
        ]
        
        // Ground collision with realistic bouncing
        if (newPos[1] <= groundLevel && currentVelocity[1] < 0) {
          newPos[1] = groundLevel
          setCurrentVelocity(prevVel => [
            prevVel[0] * bounceDamping,
            -prevVel[1] * bounceDamping,
            prevVel[2] * bounceDamping
          ])
          
          // Add much smaller random spin on bounce for realism
          setCurrentAngularVelocity(prevAngular => [
            prevAngular[0] + (Math.random() - 0.5) * 1.5, // Reduced from 5 to 1.5
            prevAngular[1] + (Math.random() - 0.5) * 1.5,
            prevAngular[2] + (Math.random() - 0.5) * 1.5
          ])
        }
        
        return newPos
      })

      // Apply position
      diceRef.current.position.set(...currentPosition)
      
      // Apply rotation using quaternions for smooth tumbling
      const quaternion = new THREE.Quaternion()
      quaternion.setFromEuler(new THREE.Euler(
        currentAngularVelocity[0] * delta,
        currentAngularVelocity[1] * delta,
        currentAngularVelocity[2] * delta
      ))
      diceRef.current.quaternion.multiplyQuaternions(quaternion, diceRef.current.quaternion)
      
    } else {
      // When not animating, directly use the provided position and rotation
      if (diceRef.current) {
        diceRef.current.position.set(...position)
        diceRef.current.rotation.set(...rotation)
      }
    }
  })

  return (
    <group ref={diceRef} position={position} rotation={rotation}>
      {/* GLB Dice Model */}
      <primitive 
        object={clonedModel} 
        scale={[0.5, 0.5, 0.5]} // Scale down the model to fit our scene
      />
    </group>
  )
}

// Preload the dice model
useGLTF.preload('/dice_highres_red.glb')

// Convert game position to 3D coordinates using path.json
function getPositionCoordinates(position: number, color: 'yellow' | 'green' | 'blue' | 'red', pieceIndex: number = 0): [number, number, number] {
  if (position === -1) {
    // Home positions - use pieceIndex to place pieces in different slots
    const homePositions = {
      yellow: [[-5.6, 0.2, -5.6], [-3.4, 0.2, -5.6], [-5.6, 0.2, -3.4], [-3.4, 0.2, -3.4]],
      green: [[-5.6, 0.2, 3.4], [-3.4, 0.2, 3.4], [-5.6, 0.2, 5.6], [-3.4, 0.2, 5.6]],
      blue: [[3.4, 0.2, 3.4], [5.6, 0.2, 3.4], [3.4, 0.2, 5.6], [5.6, 0.2, 5.6]],
      red: [[3.4, 0.2, -5.6], [5.6, 0.2, -5.6], [3.4, 0.2, -3.4], [5.6, 0.2, -3.4]]
    }
    return homePositions[color][pieceIndex % 4] as [number, number, number]
  }
  
  if (position === 57) {
    // Finished position (center)
    return [0, 0.2, 0]
  }
  
  // Use path from JSON file
  let playerPath: number[][] | undefined;
  switch (color) {
    case 'yellow':
      playerPath = PLAYER_PATHS.yellow_path;
      break;
    case 'green':
      playerPath = PLAYER_PATHS.green_path;
      break;
    case 'blue':
      playerPath = PLAYER_PATHS.blue_path;
      break;
    case 'red':
      playerPath = PLAYER_PATHS.red_path;
      break;
    default:
      playerPath = undefined;
  }

  if (playerPath && position >= 0 && position < playerPath.length) {
    const [x, z] = playerPath[position];
    return [x, 0.2, z];
  }
  
  
  // Fallback to center if position not found
  return [0, 0.2, 0]
}

// Game pieces positioned based on game state
function GamePieces({ colors, gameState, onPieceClick }: { 
  colors: any, 
  gameState: GameState,
  onPieceClick: (piece: GamePiece) => void 
}) {
  if (gameState.gamePhase === 'setup') {
    return null // Don't show pieces during setup
  }

  // Build occupancy map for tiles so we can offset pieces sharing the same tile
  // Compute every render to account for potential nested mutations in state
  const tileOccupancy = (() => {
    const map = new Map<string, Array<{ piece: GamePiece, playerId: string }>>()
    gameState.players.forEach(player => {
      player.pieces.forEach(piece => {
        if (piece.position >= 0 && piece.position  !== 57) {
          const playerPath = PLAYER_PATHS[`${player.color}_path` as keyof typeof PLAYER_PATHS] as number[][]
          const [x, z] = playerPath?.[piece.position] || [0, 0]
          const key = `${x}:${z}`
          if (!map.has(key)) map.set(key, [])
          map.get(key)!.push({ piece, playerId: player.id })
        } else if (piece.position === 57) {
          const key = 'center'
          if (!map.has(key)) map.set(key, [])
          map.get(key)!.push({ piece, playerId: player.id })
        }
      })
    })
    return map
  })()

  // Compute small radial offset for pieces sharing a tile
  const getOffsetForPiece = (piece: GamePiece, player: Player): [number, number] => {
    // Finished center tile
    if (piece.position === 57) {
      const key = 'center'
      const group = tileOccupancy.get(key) || []
      const index = group.findIndex(g => g.piece.id === piece.id)
      const count = group.length
      if (count > 1) {
        const radius = 0.35
        const angle = (index / count) * Math.PI * 2
        return [radius * Math.cos(angle), radius * Math.sin(angle)]
      }
      return [0, 0]
    }

    // In-play tiles (non-home, non-finished)
    if (piece.position >= 0) {
      const playerPath = PLAYER_PATHS[`${player.color}_path` as keyof typeof PLAYER_PATHS] as number[][]
      const [x, z] = playerPath?.[piece.position] || [0, 0]
      const key = `${x}:${z}`
      const group = tileOccupancy.get(key) || []
      const index = group.findIndex(g => g.piece.id === piece.id)
      const count = group.length
      if (count > 1) {
        const radius = 0.3
        const angle = (index / count) * Math.PI * 2
        return [radius * Math.cos(angle), radius * Math.sin(angle)]
      }
    }

    // Home positions use dedicated slots already
    return [0, 0]
  }

  return (
    <>
      {gameState.players.map(player => 
        player.pieces.map((piece, pieceIndex) => {
          const [x, y, z] = getPositionCoordinates(piece.position, player.color, pieceIndex)
          const [dx, dz] = getOffsetForPiece(piece, player)
          const pieceColor = colors.players[player.color]
          
          return (
            <group 
              key={piece.id} 
              position={[x + dx, y, z + dz]}
              onClick={() => onPieceClick(piece)}
              onPointerOver={() => document.body.style.cursor = piece.canMove ? 'pointer' : 'default'}
              onPointerOut={() => document.body.style.cursor = 'default'}
            >
              {/* Highlight ring for moveable pieces */}
              {piece.canMove && (
                <mesh position={[0, -0.15, 0]}>
                  <cylinderGeometry args={[0.4, 0.4, 0.02]} />
                  <meshStandardMaterial 
                    color="#00FF00"
                    transparent
                    opacity={0.6}
                    emissive="#00FF00"
                    emissiveIntensity={0.2}
                  />
                </mesh>
              )}
              
              {/* Selection ring for selected pieces */}
              {piece.isSelected && (
                <mesh position={[0, -0.12, 0]}>
                  <cylinderGeometry args={[0.35, 0.35, 0.03]} />
                  <meshStandardMaterial 
                    color="#FFFF00"
                    transparent
                    opacity={0.8}
                    emissive="#FFFF00"
                    emissiveIntensity={0.3}
                  />
                </mesh>
              )}
              
              {/* Large pawn base */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.25, 0.3, 0.12]} />
                <meshStandardMaterial 
                  color={pieceColor}
                  roughness={0.2}
                  metalness={0.1}
                />
              </mesh>
              
              {/* Large pawn body */}
              <mesh position={[0, 0.12, 0]}>
                <cylinderGeometry args={[0.2, 0.23, 0.24]} />
                <meshStandardMaterial 
                  color={pieceColor}
                  roughness={0.2}
                  metalness={0.1}
                />
              </mesh>
              
              {/* Large pawn neck */}
              <mesh position={[0, 0.28, 0]}>
                <cylinderGeometry args={[0.13, 0.16, 0.12]} />
                <meshStandardMaterial 
                  color={pieceColor}
                  roughness={0.2}
                  metalness={0.1}
                />
              </mesh>
              
              {/* Large pawn head */}
              <mesh position={[0, 0.38, 0]}>
                <sphereGeometry args={[0.14]} />
                <meshStandardMaterial 
                  color={pieceColor}
                  roughness={0.2}
                  metalness={0.1}
                />
              </mesh>
              
              {/* Large pawn crown/top */}
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.06, 0.09, 0.06]} />
                <meshStandardMaterial 
                  color={pieceColor}
                  roughness={0.1}
                  metalness={0.2}
                />
              </mesh>
            </group>
          )
        })
      )}
    </>
  )
}



// Camera-facing blocked message notification
function BlockedMessageNotification() {
  const meshRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      // Always face the camera (billboard effect)
      meshRef.current.lookAt(state.camera.position)
      
      // Position it in front of the camera at a reasonable distance
      const cameraDirection = new THREE.Vector3()
      state.camera.getWorldDirection(cameraDirection)
      
      // Position 8 units in front of camera
      const notificationPosition = state.camera.position.clone()
      notificationPosition.add(cameraDirection.multiplyScalar(8))
      
      meshRef.current.position.copy(notificationPosition)
    }
  })

  return (
    <group ref={meshRef}>
      {/* Bright red background - impossible to miss */}
      <mesh>
        <planeGeometry args={[6, 1.5]} />
        <meshBasicMaterial 
          color="#ff0000"
          transparent 
          opacity={0.9}
        />
      </mesh>
      
      {/* White border for contrast */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[6.2, 1.7]} />
        <meshBasicMaterial 
          color="#ffffff"
          transparent 
          opacity={1.0}
          wireframe
        />
      </mesh>
      
      {/* Reasonably sized black text on red background */}
      <Text
        position={[0, 0.1, 0.01]}
        fontSize={0.3}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        🎲 DICE IS ALREADY ROLLING
      </Text>
      
      {/* Subtitle */}
      <Text
        position={[0, -0.3, 0.01]}
        fontSize={0.2}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        PLEASE WAIT...
      </Text>
    </group>
  )
}

// Camera controller with reset and preset views
function CameraController({ 
  isSpacePressed, 
  resetCamera, 
  cameraView 
}: { 
  isSpacePressed: boolean,
  resetCamera: boolean,
  cameraView: string | null
}) {
  const [angle, setAngle] = useState(0)
  
  useFrame((state) => {
    // Handle camera reset
    if (resetCamera) {
      state.camera.position.set(0, 12, 12)
      state.camera.lookAt(0, 0, 0)
      return
    }

    // Handle preset camera views
    if (cameraView) {
      const distance = 20
      switch (cameraView) {
        case 'top':
          state.camera.position.set(0, 25, 0)
          state.camera.lookAt(0, 0, 0)
          break
        case 'front':
          state.camera.position.set(0, 12, distance)
          state.camera.lookAt(0, 0, 0)
          break
        case 'left':
          state.camera.position.set(-distance, 12, 0)
          state.camera.lookAt(0, 0, 0)
          break
        case 'right':
          state.camera.position.set(distance, 12, 0)
          state.camera.lookAt(0, 0, 0)
          break
        case 'perspective':
          state.camera.position.set(0, 12, 12)
          state.camera.lookAt(0, 0, 0)
          break
      }
      return
    }

    // Handle space-pressed auto-rotate
    if (isSpacePressed) {
      setAngle((prev) => prev + 0.01)
      const radius = 20
      state.camera.position.x = Math.cos(angle) * radius
      state.camera.position.z = Math.sin(angle) * radius
      state.camera.position.y = 15
      state.camera.lookAt(0, 0, 0)
    }
  })

  return null
}

// Auto-play Timer Component
function AutoPlayTimer({ startTime, onAutoPlay, gameState }: {
  startTime: number
  onAutoPlay: () => void
  gameState: GameState
}) {
  const [timeLeft, setTimeLeft] = useState(30)

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = Math.max(0, 30 - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0 && gameState.gamePhase === 'playing') {
        onAutoPlay()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime, onAutoPlay, gameState.gamePhase])

  if (timeLeft > 25) return null // Only show when close to auto-play

  return (
    <div className="text-xs mb-2 p-2 bg-orange-500/20 rounded border border-orange-500/50">
      <div className="flex items-center justify-between">
        <span>Auto-play in:</span>
        <span className="font-bold text-orange-400">{timeLeft}s</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
        <div 
          className="bg-orange-500 h-1 rounded-full transition-all duration-1000"
          style={{ width: `${((30 - timeLeft) / 30) * 100}%` }}
        />
      </div>
    </div>
  )
}

// Player Setup Component
function PlayerSetup({ onGameStart }: { onGameStart: (players: Player[]) => void }) {
  const [numPlayers, setNumPlayers] = useState<number | null>(null)
  const [players, setPlayers] = useState<Partial<Player>[]>([])
  const [currentPlayerSetup, setCurrentPlayerSetup] = useState(0)

  const availableColors: Array<'yellow' | 'green' | 'blue' | 'red'> = ['yellow', 'green', 'blue', 'red']
  const usedColors = players.map(p => p.color).filter(Boolean)
  const availableColorsForSelection = availableColors.filter(color => !usedColors.includes(color))

  const handleNumPlayersSelect = (num: number) => {
    setNumPlayers(num)
    setPlayers(Array(num).fill(null).map(() => ({ name: '', color: undefined })))
    setCurrentPlayerSetup(0)
  }

  const handlePlayerNameChange = (name: string) => {
    const updatedPlayers = [...players]
    updatedPlayers[currentPlayerSetup] = { ...updatedPlayers[currentPlayerSetup], name }
    setPlayers(updatedPlayers)
  }

  const handleColorSelect = (color: 'yellow' | 'green' | 'blue' | 'red') => {
    const updatedPlayers = [...players]
    updatedPlayers[currentPlayerSetup] = { ...updatedPlayers[currentPlayerSetup], color }
    setPlayers(updatedPlayers)
  }

  const handleNextPlayer = () => {
    if (currentPlayerSetup < players.length - 1) {
      setCurrentPlayerSetup(currentPlayerSetup + 1)
    } else {
      // All players set up, start the game
      const completePlayers: Player[] = players.map((player, index) => ({
        id: `player_${index}`,
        name: player.name!,
        color: player.color!,
        pieces: Array(4).fill(null).map((_, pieceIndex) => ({
          id: `${player.color}_piece_${pieceIndex}`,
          playerId: `player_${index}`,
          position: -1, // Start at home
          isSelected: false,
          canMove: false
        })),
        isActive: index === 0 // First player starts
      }))
      onGameStart(completePlayers)
    }
  }

  const currentPlayer = players[currentPlayerSetup]
  const canProceed = currentPlayer?.name && currentPlayer?.color

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6">Ludo Game Setup</h2>
        
        {numPlayers === null ? (
          <div>
            <h3 className="text-lg font-semibold mb-4">How many players? (1-4)</h3>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => handleNumPlayersSelect(num)}
                  className="py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                >
                  {num} Player{num > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Player {currentPlayerSetup + 1} of {numPlayers}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Player Name:</label>
                <input
                  type="text"
                  value={currentPlayer?.name || ''}
                  onChange={(e) => handlePlayerNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter player name"
                  maxLength={20}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Choose Color:</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableColorsForSelection.map(color => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-colors capitalize ${
                        currentPlayer?.color === color
                          ? 'ring-2 ring-black'
                          : 'hover:opacity-80'
                      }`}
                      style={{
                        backgroundColor: color === 'yellow' ? '#FFD700' : 
                                       color === 'green' ? '#228B22' :
                                       color === 'blue' ? '#4169E1' :
                                       '#DC143C',
                        color: color === 'yellow' ? '#000' : '#fff'
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleNextPlayer}
                disabled={!canProceed}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  canProceed
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {currentPlayerSetup < players.length - 1 ? 'Next Player' : 'Start Game'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Game UI Component
function GameUI({ gameState, onRollDice, onPieceClick, onAutoPlay, onToggleAutoPlay }: {
  gameState: GameState
  onRollDice: () => void
  onPieceClick: (piece: GamePiece) => void
  onAutoPlay: () => void
  onToggleAutoPlay: () => void
}) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  
  return (
    <div className="absolute bottom-4 left-4 z-10 bg-black/40 backdrop-blur-sm rounded-lg p-4 text-white min-w-[300px]">

      {/* Current Player */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: 
              currentPlayer.color === 'yellow' ? '#FFD700' : 
              currentPlayer.color === 'green' ? '#228B22' :
              currentPlayer.color === 'blue' ? '#4169E1' :
              '#DC143C'
            }}
          />
          <span className="font-semibold">{currentPlayer.name}'s Turn</span>
        </div>
        
        {gameState.diceValue && (
          <div className="text-sm">Last Roll: {gameState.diceValue}</div>
        )}
      </div>
      
      {/* Roll Dice Button */}
      <button
        onClick={onRollDice}
        disabled={gameState.diceValue !== null && !gameState.canRollAgain}
        className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors mb-3 ${
          gameState.diceValue === null || gameState.canRollAgain
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-gray-500 text-gray-300 cursor-not-allowed'
        }`}
      >
        {gameState.diceValue === null ? 'Roll Dice' : 
         gameState.canRollAgain ? 'Roll Again (6 or Finish)' : 
         'Dice Rolled - Select Piece'}
      </button>
      
      {/* Turn Status */}
      {gameState.diceValue && (
        <div className="text-xs mb-2 p-2 bg-white/10 rounded">
          <div>Dice: {gameState.diceValue}</div>
          <div>Moveable pieces: {currentPlayer.pieces.filter(p => p.canMove).length}</div>
        </div>
      )}
      
      {/* Auto-play Timer */}
      {gameState.autoPlayEnabled && gameState.turnStartTime && (
        <AutoPlayTimer 
          startTime={gameState.turnStartTime}
          onAutoPlay={onAutoPlay}
          gameState={gameState}
        />
      )}
      
      {/* Player Status */}
      <div className="space-y-1 text-xs">
        {gameState.players.map((player, index) => (
          <div 
            key={player.id}
            className={`flex items-center gap-2 p-1 rounded ${
              index === gameState.currentPlayerIndex ? 'bg-white/20' : ''
            }`}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: 
                player.color === 'yellow' ? '#FFD700' : 
                player.color === 'green' ? '#228B22' :
                player.color === 'blue' ? '#4169E1' :
                '#DC143C'
              }}
            />
            <span>{player.name}</span>
            <span className="ml-auto">
              {player.pieces.filter(p => p.position === 57).length}/4 finished
            </span>
          </div>
        ))}
      </div>
      
      {/* Auto-play Toggle */}
      <div className="mb-3">
        <button
          onClick={onToggleAutoPlay}
          className={`w-full py-1 px-2 rounded text-xs font-semibold transition-colors ${
            gameState.autoPlayEnabled
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          Auto-play: {gameState.autoPlayEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-3 text-xs text-gray-300">
        {gameState.diceValue && !currentPlayer.pieces.some(p => p.canMove) && (
          <div className="text-yellow-400 font-semibold mt-2">
            {currentPlayer.pieces.every(p => p.position === -1) && gameState.diceValue !== 6 ? (
              <>⚠️ Need 6 to start - next player...</>
            ) : (
              <>⚠️ No valid moves - switching turns...</>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Main Play component
export default function LudoPlay() {
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [showBlockedMessage, setShowBlockedMessage] = useState(false)
  const [resetCamera, setResetCamera] = useState(false)
  const [cameraView, setCameraView] = useState<string | null>(null)
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
  
  const ludoBoardRef = useRef<{ 
    throwDice: () => void, 
    throwDiceWithValue: (value?: number) => void,
    isDiceAnimating: boolean 
  }>(null)
  
  const lastProcessedDiceRoll = useRef<{ value: number; timestamp: number } | null>(null)

  // Game Logic Functions
  const initializeGame = (players: Player[]) => {
    setGameState({
      players,
      currentPlayerIndex: 0,
      diceValue: null,
      gamePhase: 'playing',
      winner: null,
      lastRoll: null,
      canRollAgain: false,
      turnStartTime: Date.now(),
      autoPlayEnabled: true
    })
  }

  const canPieceMove = (piece: GamePiece, diceValue: number, player: Player): boolean => {
    // Can't move without dice value
    if (!diceValue) return false
    
    // If piece is at home, need 6 to start
    if (piece.position === -1 && diceValue !== 6) return false
    
    // If piece is finished, can't move
    if (piece.position === 57) return false
    
    // Check if move would go beyond finish
    const newPosition = calculateNewPosition(piece, diceValue, player)
    return newPosition !== null
  }

  // Check if player has any possible moves at all
  const playerHasPossibleMoves = (player: Player, diceValue: number): boolean => {
    return player.pieces.some(piece => canPieceMove(piece, diceValue, player))
  }

  const calculateNewPosition = (piece: GamePiece, diceValue: number, player: Player): number | null => {
    if (piece.position === -1) {
      // Moving from home - must roll 6
      if (diceValue === 6) {
        return BOARD_POSITIONS.START_POSITIONS[player.color]
      }
      return null
    }
    
    if (piece.position === 57) {
      // Already finished
      return null
    }
    
    // Calculate new position along the player's path
    const playerPath = PLAYER_PATHS[`${player.color}_path` as keyof typeof PLAYER_PATHS]
    
    if (!playerPath) return null
    
    const newPos = piece.position + diceValue
    
    // Check if move goes beyond the end of the path
    if (newPos >= playerPath.length) {
      // Can only finish with exact count
      if (newPos === playerPath.length) {
        return 57 // Finished
      }
      return null // Can't overshoot
    }
    
    return newPos
  }

  const movePiece = (piece: GamePiece, newPosition: number) => {
    setGameState(prevState => {
      const newState = { ...prevState }
      const playerIndex = newState.players.findIndex(p => p.id === piece.playerId)
      const pieceIndex = newState.players[playerIndex].pieces.findIndex(p => p.id === piece.id)
      
      // Check for captures (only on main track, not in home run or finished)
      if (newPosition >= 0 && newPosition < 51 && !BOARD_POSITIONS.SAFE_POSITIONS.includes(newPosition)) {
        // Check if any opponent pieces are on this position
        newState.players.forEach((player, pIndex) => {
          if (pIndex !== playerIndex) {
            player.pieces.forEach((opponentPiece, opIndex) => {
              if (opponentPiece.position === newPosition) {
                // Capture! Send opponent piece home
                newState.players[pIndex].pieces[opIndex].position = -1
                console.log(`${newState.players[playerIndex].name} captured ${player.name}'s piece!`)
              }
            })
          }
        })
      }
      
      // Move the piece
      newState.players[playerIndex].pieces[pieceIndex].position = newPosition
      
      // Check for win condition
      const finishedPieces = newState.players[playerIndex].pieces.filter(p => p.position === 57).length
      if (finishedPieces === 4) {
        newState.winner = newState.players[playerIndex]
        newState.gamePhase = 'finished'
        return newState
      }
      
      // Determine if player gets another turn
      const rolledSix = newState.diceValue === 6
      const justFinishedPiece = newPosition === 57
      
      if (rolledSix || justFinishedPiece) {
        // Player gets another turn
        newState.canRollAgain = true
        newState.diceValue = null
        newState.turnStartTime = Date.now()
      } else {
        // Next player's turn
        newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length
        newState.diceValue = null
        newState.canRollAgain = false
        newState.turnStartTime = Date.now()
      }
      
      // Clear piece selection
      newState.players.forEach(player => {
        player.pieces.forEach(piece => {
          piece.isSelected = false
          piece.canMove = false
        })
      })
      
      return newState
    })
  }


  const handleRollDice = () => {
    if (ludoBoardRef.current && !ludoBoardRef.current.isDiceAnimating) {
      ludoBoardRef.current.throwDice()
    }
  }

  const handlePieceClick = (piece: GamePiece) => {
    if (!piece.canMove || !gameState.diceValue) return
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    const newPosition = calculateNewPosition(piece, gameState.diceValue, currentPlayer)
    
    if (newPosition !== null) {
      movePiece(piece, newPosition)
    }
  }

  // Auto-play functionality
  const performAutoPlay = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    
    if (!gameState.diceValue) {
      // Auto-roll dice
      console.log(`Auto-playing for ${currentPlayer.name}: rolling dice`)
      handleRollDice()
    } else {
      // Check if player has any moves available
      const moveablePieces = currentPlayer.pieces.filter(p => p.canMove)
      if (moveablePieces.length > 0) {
        // Auto-move a piece
        // Prioritize: 1) Moving from home, 2) Finishing pieces, 3) First available piece
        const priorityPiece = moveablePieces.find(p => p.position === -1) || // From home
                            moveablePieces.find(p => {
                              const newPos = calculateNewPosition(p, gameState.diceValue!, currentPlayer)
                              return newPos === 57 // Finishing
                            }) ||
                            moveablePieces[0] // First available
        
        console.log(`Auto-playing for ${currentPlayer.name}: moving piece ${priorityPiece.id}`)
        handlePieceClick(priorityPiece)
      } else {
        // No moves available - this should have been handled by handleDiceResult
        // but adding this as a safety net
        console.log(`Auto-playing for ${currentPlayer.name}: no moves available, skipping turn`)
        setGameState(prevState => ({
          ...prevState,
          currentPlayerIndex: (prevState.currentPlayerIndex + 1) % prevState.players.length,
          diceValue: null,
          canRollAgain: false,
          turnStartTime: Date.now()
        }))
      }
    }
  }

  // Handle dice results from the 3D dice component
  const handleDiceResult = (value: number) => {
    // Prevent duplicate calls for the same dice roll
    const now = Date.now()
    if (lastProcessedDiceRoll.current && 
        lastProcessedDiceRoll.current.value === value && 
        now - lastProcessedDiceRoll.current.timestamp < 1000) {
      console.log('Skipping duplicate handleDiceResult call')
      return
    }
    
    lastProcessedDiceRoll.current = { value, timestamp: now }
    
    // Debug logging
    console.log(`Player ${gameState.players[gameState.currentPlayerIndex]?.name} rolled ${value}`)
    
    // Update possible moves after dice settles
    setTimeout(() => {
      setGameState(prevState => {
        const newState = { 
          ...prevState
        }
        const currentPlayer = newState.players[newState.currentPlayerIndex]
        
        // Mark which pieces can move
        currentPlayer.pieces.forEach(piece => {
          piece.canMove = canPieceMove(piece, value, currentPlayer)
        })
        
        // Check if any pieces can move
        const canMovePieces = currentPlayer.pieces.some(piece => piece.canMove)
        
        if (!canMovePieces) {
          // Check if all pieces are at home (very first scenario)
          const allPiecesAtHome = currentPlayer.pieces.every(piece => piece.position === -1)
          const isFirstTurnScenario = allPiecesAtHome && value !== 6
          
          // Log appropriate message
          if (isFirstTurnScenario) {
            console.log(`${currentPlayer.name} didn't roll 6 to start, switching to next player immediately`)
          } else {
            console.log(`${currentPlayer.name} has no valid moves, switching to next player`)
          }
          
          newState.currentPlayerIndex= (prevState.currentPlayerIndex + 1) % prevState.players.length;
          newState.diceValue= null; // Reset dice value when switching turns
          newState.canRollAgain = false;
          newState.turnStartTime= Date.now();
          newState.players= prevState.players.map(player => ({
            ...player,
            pieces: player.pieces.map(piece => ({
              ...piece,
              canMove: false,
              isSelected: false
            }))
          }));
          return newState;
        }
        newState.diceValue= value;
        newState.lastRoll= value;
        newState.turnStartTime= Date.now();
        return newState;
      })
    }, 500)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Debug logging for Mac keyboard issues
      console.log('Key pressed:', { key: event.key, code: event.code, keyCode: event.keyCode })
      
      // Check if dice is currently animating - if so, show blocked message and ignore key presses
      if (ludoBoardRef.current?.isDiceAnimating) {
        setShowBlockedMessage(true)
        setTimeout(() => setShowBlockedMessage(false), 2000)
        return
      }

      if (event.code === 'Space') {
        event.preventDefault()
        setIsSpacePressed(prev => !prev) // Toggle instead of just setting to true
      }

      // Handle R key for camera reset
      // if (event.code === 'KeyR') {
      //   event.preventDefault()
      //   console.log('Resetting camera to initial position')
      //   setResetCamera(true)
      //   setCameraView(null)
      //   setTimeout(() => setResetCamera(false), 100) // Reset flag after brief moment
      // }
      
      // Handle Enter key for random dice throw
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        event.preventDefault()
        if (gameState.gamePhase === 'playing') {
          handleRollDice()
        }
      }

      // Handle 1-6 keys for specific dice values (Mac compatible)
      // Use multiple detection methods for better compatibility
      const key = event.key
      const code = event.code
      const keyCode = event.keyCode
      
      // Method 1: event.key (most reliable for Mac)
      // Method 2: event.code (backup)
      // Method 3: event.keyCode (legacy support)
      if (gameState.gamePhase === 'playing') {
        if (key === '1' || code === 'Digit1' || code === 'Numpad1' || keyCode === 49) {
          event.preventDefault()
          console.log('Throwing dice with value 1')
          ludoBoardRef.current?.throwDiceWithValue(1)
          handleDiceResult(1)
        }
        else if (key === '2' || code === 'Digit2' || code === 'Numpad2' || keyCode === 50) {
          event.preventDefault()
          console.log('Throwing dice with value 2')
          ludoBoardRef.current?.throwDiceWithValue(2)
          handleDiceResult(2)
        }
        else if (key === '3' || code === 'Digit3' || code === 'Numpad3' || keyCode === 51) {
          event.preventDefault()
          console.log('Throwing dice with value 3')
          ludoBoardRef.current?.throwDiceWithValue(3)
          handleDiceResult(3)
        }
        else if (key === '4' || code === 'Digit4' || code === 'Numpad4' || keyCode === 52) {
          event.preventDefault()
          console.log('Throwing dice with value 4')
          ludoBoardRef.current?.throwDiceWithValue(4)
          handleDiceResult(4)
        }
        else if (key === '5' || code === 'Digit5' || code === 'Numpad5' || keyCode === 53) {
          event.preventDefault()
          console.log('Throwing dice with value 5')
          ludoBoardRef.current?.throwDiceWithValue(5)
          handleDiceResult(5)
        }
        else if (key === '6' || code === 'Digit6' || code === 'Numpad6' || keyCode === 54) {
          event.preventDefault()
          console.log('Throwing dice with value 6')
          ludoBoardRef.current?.throwDiceWithValue(6)
          handleDiceResult(6)
        }
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      // Space key now works as toggle, no need for keyup handler
      // Keeping this function for potential future use
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState.gamePhase])

  // Handle camera view changes
  const handleCameraView = (view: string) => {
    console.log(`Switching to ${view} view`)
    setCameraView(view)
    setResetCamera(false)
    setTimeout(() => setCameraView(null), 100) // Reset flag after brief moment
  }

  return (
    <div className="w-full h-full overflow-hidden relative" style={{ backgroundColor: "#333333" }}>
      {/* Player Setup Modal */}
      {gameState.gamePhase === 'setup' && (
        <PlayerSetup onGameStart={initializeGame} />
      )}
      
      {/* Game UI */}
      {gameState.gamePhase === 'playing' && (
        <GameUI 
          gameState={gameState} 
          onRollDice={handleRollDice}
          onPieceClick={handlePieceClick}
          onAutoPlay={performAutoPlay}
          onToggleAutoPlay={() => setGameState(prev => ({ ...prev, autoPlayEnabled: !prev.autoPlayEnabled }))}
        />
      )}
      
      {/* Winner Announcement */}
      {gameState.gamePhase === 'finished' && gameState.winner && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center max-w-md">
            <h2 className="text-3xl font-bold mb-4">🎉 Game Over! 🎉</h2>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div 
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: 
                  gameState.winner.color === 'yellow' ? '#FFD700' : 
                  gameState.winner.color === 'green' ? '#228B22' :
                  gameState.winner.color === 'blue' ? '#4169E1' :
                  '#DC143C'
                }}
              />
              <span className="text-2xl font-semibold">{gameState.winner.name} Wins!</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      <Canvas camera={{ position: [0, 12, 12], fov: 60 }}>
        {/* Enhanced lighting optimized for container */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.0} />
        <pointLight position={[-10, 10, -10]} intensity={0.4} />

        {/* 3D Grid Background */}
        <gridHelper args={[100, 100, '#ffffff', '#4D4D4D']} />
        
        {/* Ludo Board */}
        <LudoBoard 
          ref={ludoBoardRef} 
          gameState={gameState}
          onPieceClick={handlePieceClick}
          onDiceResult={handleDiceResult}
        />

        {/* Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={!isSpacePressed}
          minDistance={8}
          maxDistance={40}
        />

        {/* Camera controller */}
        <CameraController 
          isSpacePressed={isSpacePressed}
          resetCamera={resetCamera}
          cameraView={cameraView}
        />

        {/* Camera-facing blocked message notification */}
        {showBlockedMessage && <BlockedMessageNotification />}
      </Canvas>
      
      {/* Camera View Controls - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 text-white">
          <div className="text-xs font-semibold mb-2 text-center">Camera Views</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <button
              onClick={() => handleCameraView('top')}
              className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
              title="Top View"
            >
              Top
            </button>
            <button
              onClick={() => handleCameraView('front')}
              className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
              title="Front View"
            >
              Front
            </button>
            <button
              onClick={() => handleCameraView('left')}
              className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
              title="Left View"
            >
              Left
            </button>
            <button
              onClick={() => handleCameraView('right')}
              className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
              title="Right View"
            >
              Right
            </button>
          </div>
          
          
          {/* Auto-rotate Toggle */}
          <button
            onClick={() => setIsSpacePressed(!isSpacePressed)}
            className={`w-full mt-1 px-2 py-1 rounded transition-colors text-xs font-semibold ${
              isSpacePressed 
                ? 'bg-green-500/80 hover:bg-green-500 text-white' 
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            title="Toggle Auto-rotate (Space key)"
          >
            {isSpacePressed ? '🔄 Auto-rotate ON' : '⏸️ Auto-rotate OFF'}
          </button>
        </div>
        
        {/* Reset Camera Button */}
        <button
          onClick={() => {
            setResetCamera(true)
            setCameraView(null)
            setIsSpacePressed(false) // Also stop auto-rotate on reset
            setTimeout(() => setResetCamera(false), 100)
          }}
          className="bg-red-500/80 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors backdrop-blur-sm"
          title="Reset Camera (R key)"
        >
          Reset
        </button>
      </div>
    </div>
  )
}