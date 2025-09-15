'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, useGLTF } from '@react-three/drei'
import { useRef, useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Simple working Ludo board with color themes
const LudoBoard = forwardRef<{ 
  throwDice: () => void, 
  throwDiceWithValue: (value?: number) => void,
  isDiceAnimating: boolean 
}, {}>(function LudoBoard(props, ref) {
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
    },
    {
      name: 'Classic',
      boardBase: '#F0F000',
      trackTiles: '#FFFFFF',
      players: {
        yellow: '#FFB347',
        green: '#90EE90', 
        blue: '#87CEEB',
        red: '#FA8072'
      }
    },
    {
      name: 'Ocean',
      boardBase: '#737373',
      trackTiles: '#E0FFFF',
      players: {
        yellow: '#FFD700',
        green: '#00CED1',
        blue: '#1E90FF',
        red: '#FF6347'
      }
    }
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
      
      // Vanish after 5 seconds and mark as inactive
      setTimeout(() => {
        setIsDiceVisible(false)
        setIsDiceActive(false) // Mark dice as inactive - ready for next throw
      }, 5000)
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
      <BoardComponents colors={currentColors} />
      
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
function BoardComponents({ colors }: { colors: any }) {
  return (
    <group>
      {/* Home areas */}
      <HomeAreas colors={colors} />
      
      {/* Playing track */}
      <PlayingTrack colors={colors} />
      
      {/* Center area */}
      <CenterArea colors={colors} />
      
      {/* Game pieces */}
      <GamePieces colors={colors} />
      
    </group>
  )
}

// Modern minimalist home areas
function HomeAreas({ colors }: { colors: any }) {
  const homes = [
    { color: colors.players.yellow, x: -4.5, z: -4.5, name: 'PLAYER Y' }, // Yellow
    { color: colors.players.green, x: -4.5, z: 4.5, name: 'PLAYER G' },   // Green
    { color: colors.players.blue, x: 4.5, z: 4.5, name: 'PLAYER B' },     // Blue
    { color: colors.players.red, x: 4.5, z: -4.5, name: 'PLAYER R' }      // Red
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

// Game pieces positioned in homes and on track
function GamePieces({ colors }: { colors: any }) {
  const pieces = [
    // Yellow pieces - 2 at home, 2 on track
    { color: colors.players.yellow, x: -5.6, z: -5.6 }, // Home slot 1
    { color: colors.players.yellow, x: -3.4, z: -5.6 }, // Home slot 2
    { color: colors.players.yellow, x: -7, z: -1 },     // On main track
    { color: colors.players.yellow, x: -4, z: 0 },      // On home run path
    
    // Green pieces - 1 at home, 3 on track
    { color: colors.players.green, x: -5.6, z: 3.4 },   // Home slot
    { color: colors.players.green, x: -2, z: 1 },       // On main track
    { color: colors.players.green, x: 0, z: 4 },        // On home run path
    { color: colors.players.green, x: 3, z: 1 },        // On main track
    
    // Blue pieces - 1 at home, 3 on track
    { color: colors.players.blue, x: 3.4, z: 5.6 },     // Home slot
    { color: colors.players.blue, x: 1, z: 3 },         // On main track
    { color: colors.players.blue, x: 5, z: 0 },         // On home run path
    { color: colors.players.blue, x: -3, z: -1 },       // On main track
    
    // Red pieces - 1 at home, 3 on track
    { color: colors.players.red, x: 5.6, z: -3.4 },     // Home slot
    { color: colors.players.red, x: 0, z: -4 },         // On home run path
    { color: colors.players.red, x: 6, z: -1 },         // On main track
    { color: colors.players.red, x: -1, z: -7 }         // On main track
  ]

  return (
    <>
      {pieces.map((piece, index) => (
        <group key={index} position={[piece.x, 0.2, piece.z]}>
          {/* Large pawn base */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.3, 0.12]} />
            <meshStandardMaterial 
              color={piece.color}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
          
          {/* Large pawn body */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.2, 0.23, 0.24]} />
            <meshStandardMaterial 
              color={piece.color}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
          
          {/* Large pawn neck */}
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.13, 0.16, 0.12]} />
            <meshStandardMaterial 
              color={piece.color}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
          
          {/* Large pawn head */}
          <mesh position={[0, 0.38, 0]}>
            <sphereGeometry args={[0.14]} />
            <meshStandardMaterial 
              color={piece.color}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
          
          {/* Large pawn crown/top */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.06, 0.09, 0.06]} />
            <meshStandardMaterial 
              color={piece.color}
              roughness={0.1}
              metalness={0.2}
            />
          </mesh>
        </group>
      ))}
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

// Camera controller
function CameraController({ isSpacePressed }: { isSpacePressed: boolean }) {
  const [angle, setAngle] = useState(0)
  
  useFrame((state) => {
    if (isSpacePressed) {
      setAngle((prev) => prev + 0.01)
      const radius = 20
      state.camera.position.x = Math.cos(angle) * radius
      state.camera.position.z = Math.sin(angle) * radius
      state.camera.position.y = 12
      state.camera.lookAt(0, 0, 0)
    }
  })

  return null
}

// Main simulation component
export default function LudoSimulation() {
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [showBlockedMessage, setShowBlockedMessage] = useState(false)
  const ludoBoardRef = useRef<{ 
    throwDice: () => void, 
    throwDiceWithValue: (value?: number) => void,
    isDiceAnimating: boolean 
  }>(null)

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
        setIsSpacePressed(true)
      }
      
      // Handle Enter key for random dice throw
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        event.preventDefault()
        ludoBoardRef.current?.throwDice()
      }

      // Handle 1-6 keys for specific dice values (Mac compatible)
      // Use multiple detection methods for better compatibility
      const key = event.key
      const code = event.code
      const keyCode = event.keyCode
      
      // Method 1: event.key (most reliable for Mac)
      // Method 2: event.code (backup)
      // Method 3: event.keyCode (legacy support)
      if (key === '1' || code === 'Digit1' || code === 'Numpad1' || keyCode === 49) {
        event.preventDefault()
        console.log('Throwing dice with value 1')
        ludoBoardRef.current?.throwDiceWithValue(1)
      }
      else if (key === '2' || code === 'Digit2' || code === 'Numpad2' || keyCode === 50) {
        event.preventDefault()
        console.log('Throwing dice with value 2')
        ludoBoardRef.current?.throwDiceWithValue(2)
      }
      else if (key === '3' || code === 'Digit3' || code === 'Numpad3' || keyCode === 51) {
        event.preventDefault()
        console.log('Throwing dice with value 3')
        ludoBoardRef.current?.throwDiceWithValue(3)
      }
      else if (key === '4' || code === 'Digit4' || code === 'Numpad4' || keyCode === 52) {
        event.preventDefault()
        console.log('Throwing dice with value 4')
        ludoBoardRef.current?.throwDiceWithValue(4)
      }
      else if (key === '5' || code === 'Digit5' || code === 'Numpad5' || keyCode === 53) {
        event.preventDefault()
        console.log('Throwing dice with value 5')
        ludoBoardRef.current?.throwDiceWithValue(5)
      }
      else if (key === '6' || code === 'Digit6' || code === 'Numpad6' || keyCode === 54) {
        event.preventDefault()
        console.log('Throwing dice with value 6')
        ludoBoardRef.current?.throwDiceWithValue(6)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        setIsSpacePressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <div className="w-full h-full overflow-hidden" style={{ backgroundColor: "#333333" }}>
      <Canvas camera={{ position: [0, 12, 12], fov: 60 }}>
        {/* Enhanced lighting optimized for container */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.0} />
        <pointLight position={[-10, 10, -10]} intensity={0.4} />

        {/* 3D Grid Background */}
        <gridHelper args={[100, 100, '#ffffff', '#4D4D4D']} />
        
        {/* Ludo Board */}
        <LudoBoard ref={ludoBoardRef} />

        {/* Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={!isSpacePressed}
          minDistance={8}
          maxDistance={40}
        />

        {/* Camera controller */}
        <CameraController isSpacePressed={isSpacePressed} />

        {/* Camera-facing blocked message notification */}
        {showBlockedMessage && <BlockedMessageNotification />}
      </Canvas>
    </div>
  )
}