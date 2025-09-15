'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Text } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function RotatingBox() {
  const meshRef = useRef<any>()
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <Box ref={meshRef} args={[1, 1, 1]} position={[0, 0, 0]}>
      <meshStandardMaterial color="hotpink" />
    </Box>
  )
}

export default function ThreeScene() {
  return (
    <div className="w-full h-[400px] border rounded-lg overflow-hidden bg-black">
      <Canvas camera={{ position: [3, 3, 3] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <RotatingBox />
        <Text
          position={[0, -2, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Three.js + shadcn/ui
        </Text>
        <OrbitControls />
      </Canvas>
    </div>
  )
}
