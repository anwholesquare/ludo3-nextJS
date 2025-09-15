'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Simple working Ludo board with color themes
function LudoBoard() {
  const meshRef = useRef<THREE.Mesh>(null)
  const [currentTheme, setCurrentTheme] = useState(0)

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
      boardBase: '#008B8B',
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

  return (
    <group>
      {/* Board base */}
      <mesh ref={meshRef} position={[0, 0, 0]} onClick={handleClick}>
        <boxGeometry args={[15, 0.3, 15]} />
        <meshStandardMaterial color={currentColors.boardBase} />
      </mesh>

      {/* Board components */}
      <BoardComponents colors={currentColors} />
    </group>
  )
}

// All board components
function BoardComponents({ colors }: { colors: any }) {
  return (
    <group>
      {/* Home areas */}
      <HomeAreas colors={colors} />
      
      {/* Playing track */}
      <PlayingTrack colors={colors} />
      
      {/* Center area */}
      <CenterArea />
      
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
          
          {/* Subtle corner accent */}
          <mesh position={[home.x + 2.5, 0.172, home.z + 2.5]} rotation={[0, Math.PI/4, 0]}>
            <boxGeometry args={[0.3, 0.004, 0.3]} />
            <meshStandardMaterial 
              color={home.color}
              roughness={0.0}
              metalness={0.2}
              transparent
              opacity={0.4}
            />
          </mesh>
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



// Center finish area with texture
function CenterArea() {
  // Load the center texture
  const centerTexture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const texture = loader.load('/ludo_center_texture.png')
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture
  }, [])

  return (
    <group>
      {/* Center area with texture */}
      <mesh position={[0, 0.19, 0]} rotation={[0, -1 * Math.PI /2, 0]} >
        <boxGeometry args={[3, 0.02, 3]} />
        <meshStandardMaterial map={centerTexture} />
      </mesh>
    </group>
  )
}

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        setIsSpacePressed(true)
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
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-b from-blue-800 to-purple-800">
      <Canvas camera={{ position: [15, 10, 15], fov: 75 }}>
        {/* Enhanced lighting for full screen */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.0} />
        <pointLight position={[-10, 10, -10]} intensity={0.4} />

        {/* Ludo Board */}
        <LudoBoard />

       

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
      </Canvas>
    </div>
  )
}