/**
 * @jest-environment jsdom
 */

// TDD approach - write tests first for pathfinding system
describe('Pathfinding', () => {
  // Import modules and setup tests
  beforeEach(() => {
    // Reset modules
    jest.resetModules();
    
    // Load GameUtils which is needed for distance calculations
    require('../src/js/utils');
    
    // Load Pathfinding module
    require('../src/js/pathfinding');
  });

  describe('Grid', () => {
    test('should create a grid of specified size', () => {
      const grid = new Pathfinding.Grid(10, 8);
      expect(grid.width).toBe(10);
      expect(grid.height).toBe(8);
      expect(grid.nodes.length).toBe(8); // 8 rows
      expect(grid.nodes[0].length).toBe(10); // 10 columns
    });

    test('should initialize all nodes as walkable by default', () => {
      const grid = new Pathfinding.Grid(5, 5);
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          expect(grid.nodes[y][x].walkable).toBe(true);
        }
      }
    });

    test('should set node as unwalkable', () => {
      const grid = new Pathfinding.Grid(5, 5);
      grid.setWalkableAt(2, 3, false);
      expect(grid.isWalkableAt(2, 3)).toBe(false);
    });

    test('should check if position is inside grid', () => {
      const grid = new Pathfinding.Grid(5, 5);
      expect(grid.isInside(0, 0)).toBe(true);
      expect(grid.isInside(4, 4)).toBe(true);
      expect(grid.isInside(5, 5)).toBe(false);
      expect(grid.isInside(-1, 3)).toBe(false);
    });

    test('should get neighbors for a node', () => {
      const grid = new Pathfinding.Grid(5, 5);
      
      // Make some nodes unwalkable
      grid.setWalkableAt(1, 1, false);
      
      // Get neighbors for node at (2,2) - should have 8 surrounding positions, but one is unwalkable
      const neighbors = grid.getNeighbors(grid.nodes[2][2], true); // Allow diagonal movement
      
      // Should have 7 walkable neighbors (8 surrounding positions minus 1 unwalkable)
      expect(neighbors.length).toBe(7);
      
      // Without diagonal movement, should only have 4 neighbors
      const orthogonalNeighbors = grid.getNeighbors(grid.nodes[2][2], false);
      expect(orthogonalNeighbors.length).toBe(4);
    });
  });

  describe('AStar', () => {
    test('should find path in empty grid', () => {
      const grid = new Pathfinding.Grid(10, 10);
      const path = Pathfinding.AStar.search(grid, 0, 0, 9, 9, true);
      
      // Path should exist
      expect(path.length).toBeGreaterThan(0);
      
      // First point should be near start
      expect(path[0].x).toBe(1);
      expect(path[0].y).toBe(1);
      
      // Last point should be the goal
      expect(path[path.length - 1].x).toBe(9);
      expect(path[path.length - 1].y).toBe(9);
    });

    test('should find no path when goal is unreachable', () => {
      const grid = new Pathfinding.Grid(5, 5);
      
      // Create a wall separating start and goal
      for (let y = 0; y < 5; y++) {
        grid.setWalkableAt(2, y, false);
      }
      
      const path = Pathfinding.AStar.search(grid, 0, 0, 4, 4, false);
      expect(path.length).toBe(0);
    });

    test('should find longer path around obstacles', () => {
      const grid = new Pathfinding.Grid(10, 10);
      
      // Create a partial wall that forces a detour
      for (let y = 1; y < 8; y++) {
        grid.setWalkableAt(5, y, false);
      }
      
      // Path from left to right, requires going around wall
      const directPath = Pathfinding.AStar.search(grid, 2, 5, 8, 5, false);
      const pathAroundTop = Pathfinding.AStar.search(grid, 2, 5, 8, 5, true);
      
      // Direct path (without diagonal movement) should be longer since it has to go all the way around
      expect(directPath.length).toBeGreaterThan(pathAroundTop.length);
    });
  });

  describe('Integration with game', () => {
    test('should convert terrain to pathfinding grid', () => {
      // Mock terrain data (2D array of tiles with passable property)
      const terrain = [
        [{ passable: true }, { passable: true }, { passable: false }],
        [{ passable: true }, { passable: false }, { passable: true }],
        [{ passable: false }, { passable: true }, { passable: true }]
      ];
      
      const grid = Pathfinding.createGridFromTerrain(terrain);
      
      // Grid should match terrain dimensions
      expect(grid.width).toBe(3);
      expect(grid.height).toBe(3);
      
      // Walkable status should match passable property from terrain
      expect(grid.isWalkableAt(0, 0)).toBe(true);
      expect(grid.isWalkableAt(2, 0)).toBe(false);
      expect(grid.isWalkableAt(1, 1)).toBe(false);
      expect(grid.isWalkableAt(0, 2)).toBe(false);
    });
    
    test('should find path for settler', () => {
      // Mock terrain with obstacles
      const terrain = [];
      for (let y = 0; y < 10; y++) {
        const row = [];
        for (let x = 0; x < 10; x++) {
          // Create an obstacle wall in the middle
          const passable = !(x === 5 && y > 0 && y < 8);
          row.push({ passable, x, y });
        }
        terrain.push(row);
      }
      
      // Find path around obstacle
      const path = Pathfinding.findPath(terrain, 2, 5, 8, 5);
      
      // Should find a path
      expect(path.length).toBeGreaterThan(0);
      
      // Path should go around obstacle (either above or below)
      const goesAroundTop = path.some(point => point.y <= 0);
      const goesAroundBottom = path.some(point => point.y >= 8);
      expect(goesAroundTop || goesAroundBottom).toBe(true);
    });
  });
});