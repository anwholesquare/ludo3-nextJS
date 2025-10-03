# 🎲 Ludo3 - Interactive 3D Ludo Board Template

A stunning 3D Ludo board built with **Next.js 15**, **Three.js**, and **shadcn/ui**. Features fully customizable themes, interactive gameplay elements, realistic physics-based dice rolling, and modern responsive design.

![Ludo3 Preview](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Three.js](https://img.shields.io/badge/Three.js-Interactive%203D-blue?style=for-the-badge&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue?style=for-the-badge&logo=typescript)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-black?style=for-the-badge)

## ✨ Features

### 🎮 Interactive 3D Board
- **Realistic 3D Ludo board** with detailed geometry and materials
- **Orbital camera controls** - drag to rotate, scroll to zoom, pan support
- **Auto-rotate mode** - hold Space for automatic camera orbit
- **Touch-friendly** - optimized for mobile and tablet interactions

### 🎨 Multiple Themes
- **Dark Theme** - Modern dark color scheme
- **Classic Theme** - Traditional Ludo board colors
- **Ocean Theme** - Cool blue and teal palette
- **Click to switch** - Interactive theme switching by clicking the board

### 🎲 Physics-Based Dice System
- **Realistic 3D dice** with high-resolution GLB model
- **Physics simulation** - gravity, bouncing, tumbling effects
- **Keyboard controls** - Press 1-6 for specific values, Enter for random
- **Visual feedback** - Animated rolling with exact value display
- **Collision prevention** - Blocks multiple throws until current roll completes

### 🏠 Detailed Board Components
- **Player home areas** with modern circular slots and typography
- **Cross-shaped track** with 52 squares and safe zones
- **Colored safe zones** with star markers
- **Home run paths** leading to center triangles
- **3D game pieces** with realistic pawn geometry

### 📱 Responsive Design
- **Mobile-first** - optimized for all screen sizes
- **Desktop two-column layout** - content left, 3D board right
- **Touch interactions** - mobile-specific instructions and controls
- **Adaptive sizing** - responsive heights and typography scaling

### 🛠 Developer-Friendly
- **TypeScript** - fully typed for better development experience
- **Component-based** - modular architecture for easy customization
- **Well-documented** - comprehensive coordinate system documentation
- **Easy theming** - simple color configuration system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/anwholesquare/ludo3-nextJS.git
cd ludo3-nextJS

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the interactive Ludo board.

## 📚 Comprehensive Documentation

We've created detailed guides to help you build your own Ludo game:

- **[🎮 Game Development Guide](./GAME_DEVELOPMENT_GUIDE.md)** - Complete step-by-step tutorial for building your own game
- **[🚀 Quick Customization Guide](./QUICK_CUSTOMIZATION_GUIDE.md)** - Rapid-fire customizations with copy-paste code
- **[📚 API Reference](./API_REFERENCE.md)** - Complete documentation of all interfaces and functions

### What You'll Learn

- ✅ **Complete game logic implementation** - Turn management, piece movement, win conditions
- ✅ **3D visual customization** - Themes, animations, custom pieces
- ✅ **Advanced features** - AI players, sound effects, multiplayer support
- ✅ **Mobile optimization** - Touch controls, performance tuning
- ✅ **Deployment strategies** - Vercel, Netlify, custom servers

### Build for Production

```bash
# Build the project
pnpm build

# Start production server
pnpm start
```

## 🎯 Usage

### Basic Interaction
- **Mouse/Touch**: Drag to rotate the camera around the board
- **Scroll/Pinch**: Zoom in and out
- **Click Board**: Switch between color themes
- **Space Key**: Enable auto-rotate mode

### Dice Controls
- **Enter**: Roll dice with random value (1-6)
- **Keys 1-6**: Roll dice with specific value
- **Visual Feedback**: Watch realistic physics simulation
- **Auto-Hide**: Dice disappears after 5 seconds

### Navigation
- **Landing Page**: Interactive demo with documentation
- **Simulate Page**: Full-screen experience (`/simulate`)
- **Responsive**: Optimized for mobile and desktop

## 🎨 Customization

### Adding New Themes

Edit `components/ludo-simulation.tsx` and add to the `colorThemes` array:

```typescript
const colorThemes = [
  // Existing themes...
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
]
```

### Modifying Board Layout

Adjust board dimensions and positions:

```typescript
// Board dimensions
<boxGeometry args={[15, 0.3, 15]} />

// Home area positions
const homes = [
  { x: -4.5, z: -4.5, name: 'PLAYER Y' },
  { x: -4.5, z: 4.5, name: 'PLAYER G' },
  // ... more positions
]
```

### Customizing Game Pieces

Modify piece geometry and materials:

```typescript
// Piece geometry
<cylinderGeometry args={[0.25, 0.3, 0.12]} />
<meshStandardMaterial 
  color={piece.color}
  roughness={0.2}
  metalness={0.1}
/>
```

### Camera Configuration

Adjust camera behavior and controls:

```typescript
<OrbitControls 
  enablePan={true}
  enableZoom={true}
  minDistance={8}
  maxDistance={40}
/>
```

## 📐 Coordinate System

The Ludo board uses a standard Three.js coordinate system:

- **X-Axis**: Left (-) to Right (+)
- **Y-Axis**: Down (-) to Up (+)  
- **Z-Axis**: Forward (+) to Back (-)
- **Origin**: Board center (0, 0, 0)

### Key Coordinates

| Element | Coordinates | Description |
|---------|-------------|-------------|
| Yellow Home | (-4.5, 0.16, -4.5) | Top-left quadrant |
| Green Home | (-4.5, 0.16, 4.5) | Bottom-left quadrant |
| Blue Home | (4.5, 0.16, 4.5) | Bottom-right quadrant |
| Red Home | (4.5, 0.16, -4.5) | Top-right quadrant |
| Track Range | (-7 to 7, 0.16, -7 to 7) | Cross-shaped pattern |
| Game Pieces | (x, 0.2, z) | Elevated above board |

## 🏗 Project Structure

```
ludo3/
├── app/
│   ├── page.tsx              # Landing page with embedded demo
│   ├── simulate/
│   │   └── page.tsx          # Full-screen simulation page
│   ├── layout.tsx            # Root layout with fonts
│   └── globals.css           # Global styles
├── components/
│   ├── ludo-simulation.tsx   # Main 3D Ludo board component
│   ├── three-scene.tsx       # Basic Three.js scene
│   ├── navigation.tsx        # Navigation component
│   └── ui/                   # shadcn/ui components
├── public/
│   ├── dice_highres_red.glb  # 3D dice model
│   └── ludo_center_texture.png # Center area texture
└── lib/
    └── utils.ts              # Utility functions
```

## 🛠 Tech Stack

- **[Next.js 15](https://nextjs.org/)** - React framework with Turbopack
- **[Three.js](https://threejs.org/)** - 3D graphics library
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber)** - React renderer for Three.js
- **[React Three Drei](https://github.com/pmndrs/drei)** - Useful helpers for R3F
- **[shadcn/ui](https://ui.shadcn.com/)** - Modern UI components
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Lucide React](https://lucide.dev/)** - Beautiful icons

## 📱 Browser Support

- **Chrome/Edge**: Full support with optimal performance
- **Firefox**: Full support with hardware acceleration
- **Safari**: Full support on macOS and iOS
- **Mobile**: Touch-optimized for iOS and Android

## 🎯 Performance

- **Optimized 3D models** - Efficient geometry and textures
- **Responsive loading** - Adaptive quality based on device
- **Memory management** - Proper cleanup of 3D resources
- **Mobile optimization** - Reduced complexity for mobile devices

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Three.js** - Amazing 3D graphics library
- **React Three Fiber** - Excellent React integration
- **shadcn/ui** - Beautiful component system
- **Next.js Team** - Fantastic React framework
- **Vercel** - Deployment platform

## 🔗 Links

- **Live Demo**: [Your deployment URL]
- **GitHub**: [https://github.com/anwholesquare/ludo3-nextJS](https://github.com/anwholesquare/ludo3-nextJS)
- **Documentation**: Available on the landing page
- **Issues**: [GitHub Issues](https://github.com/anwholesquare/ludo3-nextJS/issues)

---

Built with ❤️ using Next.js 15, Three.js, and shadcn/ui
