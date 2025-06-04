# 3D Red Light, Green Light Game

A modern 3D implementation of the popular "Red Light, Green Light" game from Squid Game, built with React Three Fiber and Three.js.

## Features

- 🎮 Immersive 3D environment with realistic lighting and shadows
- 🎯 Smooth player movement and animations
- 🎭 Detailed 3D models for characters and environment
- 🌟 Dynamic lighting and atmospheric effects
- 🎵 Immersive sound effects and audio feedback
- 🎨 Beautiful visual effects and post-processing
- 🎲 Multiple AI players with realistic behavior
- 🎪 Detailed environment with guard towers, walls, and decorative elements

## Prerequisites

- Node.js 16.x or later
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/3d-red-light-green-light.git
cd 3d-red-light-green-light
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Download 3D models:
```bash
chmod +x scripts/download-models.sh
./scripts/download-models.sh
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## How to Play

1. Use the `W` or `↑` key to move forward
2. Use the `S` or `↓` key to move backward
3. When the doll is facing away (green light), you can move
4. When the doll turns around (red light), you must stop moving
5. If you move during red light, you're eliminated
6. Reach the finish line to win!

## Game Features

### Environment
- Realistic ground textures with normal mapping
- Dynamic lighting with shadows
- Atmospheric effects and fog
- Decorative elements like rocks and bushes
- Guard towers with spotlights
- High walls surrounding the play area

### Characters
- Detailed 3D models for all characters
- Smooth animations for movement
- Realistic lighting and shadows
- Fallback basic shapes if models fail to load

### Game Mechanics
- Smooth player movement
- Realistic AI player behavior
- Dynamic difficulty adjustment
- Win/lose conditions
- Sound effects for all actions

## Technical Details

### Built With
- React 18
- Three.js
- React Three Fiber
- React Three Drei
- TypeScript
- Vite

### Project Structure
```
src/
  ├── components/     # React components
  ├── context/       # React context providers
  ├── utils/         # Utility functions
  ├── models/        # 3D model loaders
  └── assets/        # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Squid Game TV series
- 3D models from Sketchfab (free models)
- Sound effects from [source]
- Textures from Pexels 