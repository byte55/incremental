# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser-based incremental/idle game called "Evolution Simulation" that simulates the development of a primitive settlement and ecosystem. The game features:

- A zero-player simulation with automatic settlement development
- An ecosystem with plants, animals, and resources
- Technology research and development
- Building construction
- Population management
- Dynamic environment with seasons and weather

## Development Environment

### Running the Game

To run the game locally, open the index.html file in a web browser:
```bash
# Using a simple HTTP server (if you have Python installed)
python -m http.server
# Or with npm http-server
npx http-server
```

## Project Structure

- `index.html`: Main HTML file that structures the game UI
- `src/css/styles.css`: CSS styling for the game interface
- `src/js/`: JavaScript source files
  - `data.js`: Constants and initial game state data
  - `ecosystem.js`: Ecosystem simulation logic
  - `settlement.js`: Settlement and AI decision-making
  - `technology.js`: Technology tree and research system
  - `ui.js`: User interface management
  - `storage.js`: Session storage for game data
  - `game.js`: Main game loop and coordination

## Game Data Management

Game data is saved in the browser's session storage. The key game data structures include:

- Resources (food, water, wood, stone, etc.)
- Population (total, growth, groups)
- Technology tree (discovered and in-progress technologies)
- Ecosystem (plants, animals, minerals)
- Environment (season, temperature, weather)

## Key Features

### Simulation Systems

- **Ecosystem**: Simulates plants, animals, and minerals with growth rates and interactions
- **Settlement**: Manages population, resources, and AI decision-making
- **Technology**: Research system with progressive discoveries and "eureka" moments
- **Environment**: Seasonal changes and weather that affect the ecosystem and settlement

### User Interface

- Time controls to pause, play at normal speed, or fast-forward the simulation
- Resource display showing current quantities
- Population statistics and group assignments
- Technology tree visualization
- Event log for important occurrences
- Environmental information