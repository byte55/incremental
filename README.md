# Evolution Simulation Game

A browser-based incremental game where you can watch a settlement evolve and grow.

## Features

- A zero-player simulation with automatic settlement development
- Visual representation of settlers, buildings, and resources on a tile-based map
- An ecosystem with plants, animals, and resources
- Technology research and development
- Building construction
- Population management
- Dynamic environment with seasons and weather

## Running the Game

There are several ways to run the game:

### Option 1: Open index.html directly

Simply open the `index.html` file in your browser. This works but might have limitations with loading resources.

### Option 2: Use a local HTTP server

Run a simple HTTP server to serve the game files:

#### Using PHP:

```bash
php -S localhost:8000
```
Then open http://localhost:8000/index.php in your browser.

#### Using Python:

```bash
python -m http.server 8000
```
Then open http://localhost:8000 in your browser.

#### Using Node.js:

```bash
npx http-server -p 8000
```
Then open http://localhost:8000 in your browser.

## Controls

- **WASD** or **Arrow Keys**: Move the camera around the map
- **+/-**: Zoom in and out
- **Mouse Drag**: Pan the camera
- **Mouse Click**: Get information about settlers, buildings, or resources

## Game Mechanics

The simulation runs automatically with settlers moving around, gathering resources, and constructing buildings based on AI decisions. You can observe the development of the settlement over time.

## Assets

The game uses color placeholders for visual elements until proper sprite images are added. To add your own sprites, place PNG files in the appropriate folders under `assets/sprites/`:

- `terrain/` - For terrain tiles (grass, water, forest, mountain, clay)
- `settlers/` - For settler characters (gatherer, hunter, builder, researcher)
- `buildings/` - For building sprites (shelter, storage, crafting, research)
- `resources/` - For resource items (food, water, wood, stone, etc.)

See the READMEs in those directories for specific file naming requirements.

## Troubleshooting

If you encounter any issues:

1. Check your browser console for error messages
2. Make sure your browser supports HTML5 Canvas
3. Try running the game using a local HTTP server instead of opening the file directly
4. Clear your browser cache and reload

## Development

This game is still under development. Future improvements may include:
- Better pathfinding for settlers
- More interactive elements
- Visual effects for weather and seasons
- More sophisticated building construction visualization
- Animations for resource gathering and other activities