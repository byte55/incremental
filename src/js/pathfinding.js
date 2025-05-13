/**
 * Pathfinding system for Evolution Simulation game
 * A simple implementation of A* pathfinding algorithm
 */

// Namespace for pathfinding functionality
const Pathfinding = {};

/**
 * A grid of nodes used for pathfinding
 */
Pathfinding.Grid = class Grid {
  /**
   * Create a new grid
   * @param {number} width - Width of the grid
   * @param {number} height - Height of the grid
   */
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.nodes = [];
    
    // Initialize grid with nodes
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push({
          x: x,
          y: y,
          walkable: true,
          f: 0, // Total cost (g + h)
          g: 0, // Cost from start to this node
          h: 0, // Heuristic cost from this node to goal
          parent: null // Used to reconstruct path
        });
      }
      this.nodes.push(row);
    }
  }
  
  /**
   * Check if position is inside the grid
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} - True if position is inside grid
   */
  isInside(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }
  
  /**
   * Check if position is walkable
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} - True if position is walkable
   */
  isWalkableAt(x, y) {
    return this.isInside(x, y) && this.nodes[y][x].walkable;
  }
  
  /**
   * Set walkable status at position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {boolean} walkable - Whether position is walkable
   */
  setWalkableAt(x, y, walkable) {
    if (this.isInside(x, y)) {
      this.nodes[y][x].walkable = walkable;
    }
  }
  
  /**
   * Get neighbors of a node
   * @param {Object} node - Node to get neighbors for
   * @param {boolean} allowDiagonal - Whether to include diagonal neighbors
   * @returns {Array} - Array of neighboring nodes
   */
  getNeighbors(node, allowDiagonal) {
    const { x, y } = node;
    const neighbors = [];
    
    // Orthogonal neighbors (up, right, down, left)
    const directions = [
      [0, -1], [1, 0], [0, 1], [-1, 0]
    ];
    
    // Add diagonal neighbors if allowed
    if (allowDiagonal) {
      directions.push(
        [1, -1], [1, 1], [-1, 1], [-1, -1]
      );
    }
    
    // Check each direction
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      
      if (this.isWalkableAt(nx, ny)) {
        neighbors.push(this.nodes[ny][nx]);
      }
    }
    
    return neighbors;
  }
};

/**
 * A* pathfinding algorithm
 */
Pathfinding.AStar = {
  /**
   * Heuristic function (Manhattan distance)
   * @param {number} dx - Distance in X direction
   * @param {number} dy - Distance in Y direction
   * @returns {number} - Heuristic cost estimate
   */
  heuristic(dx, dy) {
    // Manhattan distance
    return Math.abs(dx) + Math.abs(dy);
  },
  
  /**
   * Find path using A* algorithm
   * @param {Pathfinding.Grid} grid - Grid to search in
   * @param {number} startX - Start X coordinate
   * @param {number} startY - Start Y coordinate
   * @param {number} endX - Goal X coordinate
   * @param {number} endY - Goal Y coordinate
   * @param {boolean} allowDiagonal - Whether to allow diagonal movement
   * @returns {Array} - Array of points forming the path
   */
  search(grid, startX, startY, endX, endY, allowDiagonal) {
    // Implementation of A* search algorithm
    const openSet = []; // Nodes to be evaluated
    const closedSet = new Set(); // Nodes already evaluated
    
    // Get start and end nodes
    const startNode = grid.nodes[startY][startX];
    const endNode = grid.nodes[endY][endX];
    
    // Initialize start node
    startNode.g = 0;
    startNode.h = this.heuristic(endX - startX, endY - startY);
    startNode.f = startNode.g + startNode.h;
    
    // Add start node to open set
    openSet.push(startNode);
    
    // Helper to find node with lowest f score in open set
    const findLowestFScore = () => {
      let lowestIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestIndex].f) {
          lowestIndex = i;
        }
      }
      return lowestIndex;
    };
    
    // Main search loop
    while (openSet.length > 0) {
      // Get node with lowest f score
      const currentIndex = findLowestFScore();
      const currentNode = openSet[currentIndex];
      
      // Found the goal
      if (currentNode === endNode) {
        // Reconstruct and return the path
        return this.reconstructPath(currentNode);
      }
      
      // Remove current node from open set and add to closed set
      openSet.splice(currentIndex, 1);
      closedSet.add(`${currentNode.x},${currentNode.y}`);
      
      // Check neighbors
      const neighbors = grid.getNeighbors(currentNode, allowDiagonal);
      for (const neighbor of neighbors) {
        // Skip if already evaluated
        if (closedSet.has(`${neighbor.x},${neighbor.y}`)) {
          continue;
        }
        
        // Calculate tentative g score
        const tentativeG = currentNode.g + 1; // Movement cost is 1
        
        // Check if neighbor is not in open set or has a better g score
        const inOpenSet = openSet.includes(neighbor);
        if (!inOpenSet || tentativeG < neighbor.g) {
          // Update neighbor
          neighbor.parent = currentNode;
          neighbor.g = tentativeG;
          neighbor.h = this.heuristic(endX - neighbor.x, endY - neighbor.y);
          neighbor.f = neighbor.g + neighbor.h;
          
          // Add to open set if not already there
          if (!inOpenSet) {
            openSet.push(neighbor);
          }
        }
      }
    }
    
    // No path found
    return [];
  },
  
  /**
   * Reconstruct path from end node
   * @param {Object} endNode - The final node in the path
   * @returns {Array} - Array of points forming the path
   */
  reconstructPath(endNode) {
    const path = [];
    let currentNode = endNode;
    
    // Start from the end node and follow parents back to start
    while (currentNode.parent) {
      path.unshift({ x: currentNode.x, y: currentNode.y }); // Add to front of array
      currentNode = currentNode.parent;
    }
    
    return path;
  }
};

/**
 * Create a pathfinding grid from terrain data
 * @param {Array} terrain - 2D array of terrain tiles with passable property
 * @returns {Pathfinding.Grid} - Pathfinding grid
 */
Pathfinding.createGridFromTerrain = function(terrain) {
  const height = terrain.length;
  const width = terrain[0].length;
  
  // Create grid
  const grid = new this.Grid(width, height);
  
  // Set walkable status based on terrain
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      grid.setWalkableAt(x, y, terrain[y][x].passable);
    }
  }
  
  return grid;
};

/**
 * Find path between two points in terrain
 * @param {Array} terrain - 2D array of terrain tiles with passable property
 * @param {number} startX - Start X coordinate
 * @param {number} startY - Start Y coordinate
 * @param {number} endX - End X coordinate
 * @param {number} endY - End Y coordinate
 * @param {boolean} allowDiagonal - Whether to allow diagonal movement (defaults to true)
 * @returns {Array} - Array of points forming the path
 */
Pathfinding.findPath = function(terrain, startX, startY, endX, endY, allowDiagonal = true) {
  // Create grid from terrain
  const grid = this.createGridFromTerrain(terrain);
  
  // Find path
  return this.AStar.search(grid, startX, startY, endX, endY, allowDiagonal);
};

// Make Pathfinding available globally
window.Pathfinding = Pathfinding;