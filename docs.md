# Evolution Simulation Visualization

This document explains the visualization system used in the Evolution Simulation game, which is inspired by "The Settlers 2" game style.

## Overview

The simulation has been transformed from a text-based system to a visual canvas-based game where:

1. Settlers are visible entities that move around the map
2. Buildings are displayed and can be constructed
3. Resources are visually represented on the map
4. The environment features different terrain types

## Components

### Renderer (src/js/renderer.js)

The main visualization component that handles:

- Canvas setup and rendering
- Terrain generation and rendering
- Entity management (settlers, buildings, resources)
- Camera controls and movement
- Sprite management

### Game Integration

The Renderer is integrated with the existing game systems:
- Settlement logic still handles resource management and AI decisions
- Ecosystem systems still control environment rules
- The renderer visualizes these systems and provides feedback

## Visual Elements

### Terrain

The map consists of different terrain types:
- Grass: Basic passable terrain
- Water: Non-passable water bodies
- Forest: Passable terrain with trees (wood resources)
- Mountain: Non-passable terrain with stone/ore deposits
- Clay: Special terrain with clay deposits

### Settlers

Settlers are represented as moving entities on the map:
- Gatherers: Collect food, water, and plant fibers
- Hunters: Hunt for food
- Builders: Construct buildings and gather construction materials
- Researchers: Work at research buildings

### Buildings

Buildings appear on the map and show construction progress:
- Shelter: Housing for settlers
- Storage: Resource storage
- Crafting: Tool creation and crafting
- Research: Technology development

### Resources

Resources are displayed on the map:
- Food (plants, berries)
- Water sources
- Wood (trees)
- Stone deposits
- Metal ore
- Clay

## Implementation Notes

### Sprite System

The game uses a color-based placeholder system until proper sprite assets are available:
- Each entity type has a designated color for development
- The system is ready for proper sprite images to replace these placeholders
- Just add PNG files to the `assets/sprites/` directories

### Pathfinding

Settlers use a simple direct movement system:
- They move directly toward their targets
- Future improvements could include A* pathfinding

### Interaction

Currently, settlers move based on the AI system in the settlement logic:
- Future enhancements could include player-directed movement
- Click interactions could be added to select or direct settlers

## Future Improvements

1. Add actual sprite images for all entities
2. Implement proper pathfinding algorithm
3. Add more interactive elements
4. Add visual effects for weather and seasons
5. Implement more sophisticated building construction visualization
6. Add animations for resource gathering and other activities

## How to Use

The visualization runs automatically when the game starts. Use keyboard controls to navigate:
- WASD: Move camera
- +/-: Zoom in/out

The sidebar still shows important game statistics while the canvas provides the visual representation of the simulation.