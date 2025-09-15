import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LudoSimulation from "@/components/ludo-simulation";
import Navigation from "@/components/navigation";
import { Code2, Palette, Gamepad2, Zap, Github, ExternalLink, Sparkles, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-center">
          {/* Left Content */}
          <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              3D Ludo Board Template
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-space-grotesk bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Interactive Ludo Board
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-inter leading-relaxed">
              A stunning 3D Ludo board built with Next.js 15, Three.js, and shadcn/ui. 
              Fully customizable themes, interactive gameplay, and modern design.
            </p>
            
            <div className="flex gap-3 sm:gap-4 justify-center lg:justify-start flex-col sm:flex-row">
              <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto" asChild>
                <a href="/simulate" className="flex items-center justify-center gap-2">
                  <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Try Interactive Demo
                </a>
              </Button>
              <Button size="lg" variant="outline" className="hidden lg:flex text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto" asChild>
                <a href="#docs" className="flex items-center justify-center gap-2">
                  <Code2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  View Documentation
                </a>
              </Button>
            </div>
          </div>

          {/* Right - 3D Ludo Simulation */}
          <div id="simulation" className="relative order-last lg:order-last">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl sm:rounded-2xl blur-3xl"></div>
            <Card className="relative backdrop-blur-sm border-0 shadow-2xl py-0">
              <CardContent className="p-0">
                <div className="h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px] rounded-xl sm:rounded-2xl overflow-hidden relative">
                  <LudoSimulation />
                </div>
              </CardContent>
            </Card>
            <div className="absolute -bottom-2 sm:-bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-white dark:bg-slate-800 px-3 sm:px-4 py-2 rounded-full shadow-lg border max-w-xs sm:max-w-none">
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  <span className="hidden sm:inline">Click board to switch themes • Drag to rotate • Space for auto-rotate</span>
                  <span className="sm:hidden">Touch board for themes • Drag to rotate</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-space-grotesk mb-3 sm:mb-4 px-4">
            Built with Modern Technology
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Every component is crafted with performance, accessibility, and developer experience in mind.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Next.js 15 + TypeScript</CardTitle>
              <CardDescription>
                Latest Next.js with Turbopack for lightning-fast development and production builds.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Gamepad2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Three.js Integration</CardTitle>
              <CardDescription>
                Immersive 3D graphics with React Three Fiber, orbital controls, and realistic lighting.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            <CardTitle>shadcn/ui Components</CardTitle>
            <CardDescription>
                Beautiful, accessible UI components built with Radix UI and Tailwind CSS.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>Multiple Themes</CardTitle>
              <CardDescription>
                Dark, Classic, and Ocean themes. Click the board to switch between color schemes.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle>Fully Customizable</CardTitle>
              <CardDescription>
                Easy to modify colors, piece positions, board layout, and add new features.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Interactive Features</CardTitle>
              <CardDescription>
                Orbital camera controls, theme switching, auto-rotate mode, and responsive design.
            </CardDescription>
          </CardHeader>
          </Card>
            </div>
      </section>

      {/* Documentation Section - Hidden on Mobile */}
      <section id="docs" className="hidden lg:block container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-space-grotesk mb-3 sm:mb-4 px-4">
            Easy to Customize
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Modify colors, themes, and board elements with simple configuration changes.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          <Card className="border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm min-w-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Customization
              </CardTitle>
              <CardDescription>
                Add new color themes by modifying the colorThemes array
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-3 sm:p-4 overflow-x-auto min-w-0">
                <pre className="text-xs sm:text-sm text-slate-300 whitespace-nowrap lg:whitespace-pre overflow-x-auto lg:overflow-x-visible">
                  <code className="block">{`const colorThemes = [
  {
    name: 'Custom',
    boardBase: '#1a1a2e',
    trackTiles: '#16213e',
    players: {
      yellow: '#ffd700',
      green: '#00ff7f',
      blue: '#1e90ff',
      red: '#ff6b6b'
    }
  }
]`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm min-w-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Board Layout
              </CardTitle>
              <CardDescription>
                Customize board dimensions and piece positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-3 sm:p-4 overflow-x-auto min-w-0">
                <pre className="text-xs sm:text-sm text-slate-300 whitespace-nowrap lg:whitespace-pre overflow-x-auto lg:overflow-x-visible">
                  <code className="block">{`// Board dimensions
<boxGeometry args={[15, 0.3, 15]} />

// Home area positions
const homes = [
  { x: -4.5, z: -4.5, name: 'PLAYER Y' },
  { x: -4.5, z: 4.5, name: 'PLAYER G' },
  // ... more positions
]`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm min-w-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                Game Pieces
              </CardTitle>
              <CardDescription>
                Modify piece shapes, sizes, and starting positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-3 sm:p-4 overflow-x-auto min-w-0">
                <pre className="text-xs sm:text-sm text-slate-300 whitespace-nowrap lg:whitespace-pre overflow-x-auto lg:overflow-x-visible">
                  <code className="block">{`// Piece geometry
<cylinderGeometry args={[0.25, 0.3, 0.12]} />
<meshStandardMaterial 
  color={piece.color}
  roughness={0.2}
  metalness={0.1}
/>`}</code>
                </pre>
              </div>
            </CardContent>
        </Card>

          <Card className="border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm min-w-0">
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Camera Controls
              </CardTitle>
            <CardDescription>
                Customize camera behavior and controls
            </CardDescription>
          </CardHeader>
            <CardContent>
              <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-3 sm:p-4 overflow-x-auto min-w-0">
                <pre className="text-xs sm:text-sm text-slate-300 whitespace-nowrap lg:whitespace-pre overflow-x-auto lg:overflow-x-visible">
                  <code className="block">{`<OrbitControls 
  enablePan={true}
  enableZoom={true}
  minDistance={8}
  maxDistance={40}
/>`}</code>
                </pre>
              </div>
            </CardContent>
        </Card>
      </div>

        <div className="mt-8 sm:mt-12 text-center">
          <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <h3 className="text-xl sm:text-2xl font-bold font-space-grotesk mb-3 sm:mb-4">Quick Start Guide</h3>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-3 text-left">
                <div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Clone & Install</h4>
                  <p className="text-sm text-muted-foreground">Clone the repository and run <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">pnpm install</code></p>
                </div>
                <div>
                  <div className="bg-green-100 dark:bg-green-900/30 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Customize Themes</h4>
                  <p className="text-sm text-muted-foreground">Edit the colorThemes array in <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">ludo-simulation.tsx</code></p>
                </div>
                <div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Deploy</h4>
                  <p className="text-sm text-muted-foreground">Run <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">pnpm build</code> and deploy to your favorite platform</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-space-grotesk px-4">
            Ready to Build Your Ludo Game?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Start with this template and create your own interactive 3D Ludo experience.
          </p>
          
          <div className="flex gap-3 sm:gap-4 justify-center flex-col sm:flex-row px-4">
            <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto" asChild>
              <a href="#simulation" className="flex items-center justify-center gap-2">
                <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5" />
                Play Interactive Demo
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto" asChild>
              <a href="https://github.com/anwholesquare/ludo3-nextJS" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                <Github className="h-4 w-4 sm:h-5 sm:w-5" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Coordinate System Documentation */}
      <section className="container mx-auto px-4 py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold font-space-grotesk mb-4">
            Ludo Board Coordinate System
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-inter">
            Understanding the 3D coordinate system used for positioning board elements
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Coordinate Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-space-grotesk flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Coordinate System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The Ludo board uses a standard Three.js coordinate system with the origin (0,0,0) at the board center:
              </p>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><strong>X-Axis:</strong> Left (-) to Right (+)</div>
                  <div><strong>Y-Axis:</strong> Down (-) to Up (+)</div>
                  <div><strong>Z-Axis:</strong> Forward (+) to Back (-)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Home Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-space-grotesk">Home Areas Coordinates</CardTitle>
              <CardDescription>
                Each player's home area is positioned in a corner quadrant, 4.5 units from center
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Yellow Player</h4>
                  <code className="text-sm">x: -4.5, z: -4.5</code>
                  <p className="text-xs text-muted-foreground mt-1">Top-left quadrant</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Green Player</h4>
                  <code className="text-sm">x: -4.5, z: 4.5</code>
                  <p className="text-xs text-muted-foreground mt-1">Bottom-left quadrant</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Blue Player</h4>
                  <code className="text-sm">x: 4.5, z: 4.5</code>
                  <p className="text-xs text-muted-foreground mt-1">Bottom-right quadrant</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">Red Player</h4>
                  <code className="text-sm">x: 4.5, z: -4.5</code>
                  <p className="text-xs text-muted-foreground mt-1">Top-right quadrant</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Playing Track */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-space-grotesk">Playing Track Coordinates</CardTitle>
              <CardDescription>
                The main track forms a cross pattern with 52 squares total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Horizontal Track</h4>
                  <code className="text-sm">x: -7 to 7, z: -1 to 1</code>
                  <p className="text-xs text-muted-foreground mt-1">15 × 3 = 45 squares</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Vertical Track</h4>
                  <code className="text-sm">x: -1 to 1, z: -7 to 7</code>
                  <p className="text-xs text-muted-foreground mt-1">3 × 15 = 45 squares</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safe Zones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-space-grotesk">Safe Zone Coordinates</CardTitle>
              <CardDescription>
                Special colored squares where pieces cannot be captured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Player Entry Zones</h4>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded text-sm font-mono space-y-1">
                    <div>Yellow: (-6, -1)</div>
                    <div>Green: (-1, 6)</div>
                    <div>Blue: (6, 1)</div>
                    <div>Red: (1, -6)</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Corner Safe Zones</h4>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded text-sm font-mono space-y-1">
                    <div>(1, 5), (-1, -5)</div>
                    <div>(-5, 1), (5, -1)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Height Levels */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-space-grotesk">Height Levels (Y-Coordinates)</CardTitle>
              <CardDescription>
                Different board elements positioned at specific heights for proper layering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
                  <div className="space-y-1">
                    <div><strong>y: 0.16</strong> - Home areas & track base</div>
                    <div><strong>y: 0.17</strong> - Home inner areas</div>
                    <div><strong>y: 0.175</strong> - Player slots base</div>
                    <div><strong>y: 0.177</strong> - Player slots inner</div>
                  </div>
                  <div className="space-y-1">
                    <div><strong>y: 0.18</strong> - Center area base</div>
                    <div><strong>y: 0.19</strong> - Center triangles & labels</div>
                    <div><strong>y: 0.2</strong> - Game pieces</div>
                    <div><strong>y: 0.6</strong> - Home symbols</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Example Positions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-space-grotesk">Example Game Piece Positions</CardTitle>
              <CardDescription>
                Sample coordinates for pieces in different game states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-3">Yellow Player Examples</h4>
                <div className="text-sm font-mono space-y-1">
                  <div><strong>Home slots:</strong> (-5.6, -5.6), (-3.4, -5.6)</div>
                  <div><strong>Main track:</strong> (-7, -1) - starting position</div>
                  <div><strong>Home run:</strong> (-4, 0) - path to center</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center items-center text-xs sm:text-sm text-muted-foreground">
            <a
              className="flex items-center gap-2 hover:text-foreground transition-colors"
              href="https://nextjs.org/docs"
          target="_blank"
          rel="noopener noreferrer"
        >
              <ExternalLink className="h-4 w-4" />
              Next.js Docs
        </a>
        <a
              className="flex items-center gap-2 hover:text-foreground transition-colors"
              href="https://ui.shadcn.com/docs"
          target="_blank"
          rel="noopener noreferrer"
        >
              <ExternalLink className="h-4 w-4" />
              shadcn/ui Docs
        </a>
        <a
              className="flex items-center gap-2 hover:text-foreground transition-colors"
              href="https://docs.pmnd.rs/react-three-fiber"
          target="_blank"
          rel="noopener noreferrer"
        >
              <ExternalLink className="h-4 w-4" />
              React Three Fiber
            </a>
          </div>
          
        </div>
      </footer>
    </div>
  );
}
