# Sprite Assets

This folder contains sprite assets for the Evolution Simulation game.

## Folder Structure

- `sprites/` - Contains all sprite images
  - `terrain/` - Terrain tiles (grass, water, forest, mountain, clay)
  - `settlers/` - Settler characters (gatherer, hunter, builder, researcher)
  - `buildings/` - Building sprites (shelter, storage, crafting, research)
  - `resources/` - Resource items (food, water, wood, stone, etc.)

## Adding Sprites

To add sprites, simply place PNG images with the correct filenames in the appropriate folders.

### Required Filenames

#### Terrain
- `grass.png`
- `water.png`
- `forest.png`
- `mountain.png`
- `clay.png`

#### Settlers
- `gatherer.png`
- `hunter.png`
- `builder.png`
- `researcher.png`

#### Buildings
- `shelter.png`
- `storage.png`
- `crafting.png`
- `research.png`

#### Resources
- `food.png`
- `water.png`
- `wood.png`
- `stone.png`
- `plant_fiber.png`
- `metal_ore.png`
- `animal_hide.png`

## Image Guidelines

- Recommended size for terrain and resource tiles: 32x32 pixels
- Recommended size for settlers: 32x32 pixels
- Recommended size for buildings: 64x64 pixels (will be scaled to cover multiple tiles)
- Use transparent backgrounds (PNG format)
- Keep file sizes small for better performance

Until proper sprites are added, the game will use colored placeholders for all visual elements.