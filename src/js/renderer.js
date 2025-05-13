// Canvas-based renderer for game visualization
class Renderer {
    constructor(game) {
        this.game = game;
        
        // Canvas setup
        this.canvas = document.getElementById('game-canvas');
        
        // Make sure canvas exists before proceeding
        if (!this.canvas) {
            console.error('Canvas element not found! Make sure game-canvas element exists in the DOM.');
            
            // Create canvas as fallback
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'game-canvas';
            const gameArea = document.getElementById('game-area');
            if (gameArea) {
                console.log('Appending fallback canvas to game-area');
                gameArea.appendChild(this.canvas);
            } else {
                console.error('Game area not found! Appending canvas to body as last resort.');
                document.body.appendChild(this.canvas);
            }
        } else {
            console.log('Canvas found successfully');
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        
        // Add window resize listener with debounce to improve performance
        let resizeTimeout;
        window.addEventListener('resize', () => {
            // Clear previous timeout to debounce the resize event
            if (resizeTimeout) clearTimeout(resizeTimeout);
            
            // Set a new timeout
            resizeTimeout = setTimeout(() => {
                this.resizeCanvas();
                console.log('Window resized, canvas updated');
            }, 100);
        });
        
        // Tile settings
        this.tileSize = 32; // Size of each tile in pixels
        this.visibleTiles = {
            width: 20,
            height: 15
        };
        
        // Map settings
        this.mapSize = {
            width: 40,
            height: 30
        };
        
        // Camera position (in tile coordinates)
        this.camera = {
            x: 0,
            y: 0
        };
        
        // Load sprites
        this.sprites = {};
        this.loadSprites();
        
        // Generate terrain
        this.terrain = [];
        this.generateTerrain();
        
        // Entities on the map (settlers, buildings, resources)
        this.entities = {
            settlers: [],
            buildings: [],
            resources: []
        };
        
        // Initialize entities based on settlement data
        this.initializeEntities();
    }
    
    resizeCanvas() {
        try {
            // Ensure canvas exists
            if (!this.canvas) {
                console.error('Canvas does not exist when trying to resize');
                return;
            }
            
            // Get container if it exists
            const container = this.canvas.parentElement;
            
            // Set default fallback dimensions
            let width = 800;
            let height = 600;
            
            // Try to get container dimensions if available
            if (container) {
                try {
                    const rect = container.getBoundingClientRect();
                    if (rect.width > 0) {
                        width = rect.width;
                    }
                    if (rect.height > 0) {
                        height = rect.height;
                    }
                } catch (e) {
                    console.warn('Error getting container dimensions:', e);
                }
            } else {
                console.warn('Canvas parent element not found, using default dimensions');
            }
            
            // Apply dimensions with fallbacks
            this.canvas.width = width;
            this.canvas.height = height;
            
            // Adjust visible tiles based on canvas size
            this.visibleTiles.width = Math.ceil(this.canvas.width / this.tileSize);
            this.visibleTiles.height = Math.ceil(this.canvas.height / this.tileSize);
            
            // Log canvas dimensions for debugging
            console.log(`Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
        } catch (error) {
            console.error('Error resizing canvas:', error);
        }
    }
    
    loadSprites() {
        try {
            console.log('Loading sprites...');
            
            // Initialize with placeholder colors for all sprite types
            // This ensures we have fallbacks even if loading fails
            
            // Terrain sprites
            this.sprites['grass'] = { loaded: false, color: this.getPlaceholderColor('grass') };
            this.sprites['water'] = { loaded: false, color: this.getPlaceholderColor('water') };
            this.sprites['forest'] = { loaded: false, color: this.getPlaceholderColor('forest') };
            this.sprites['mountain'] = { loaded: false, color: this.getPlaceholderColor('mountain') };
            this.sprites['clay'] = { loaded: false, color: this.getPlaceholderColor('clay') };
            
            // Settler sprites
            this.sprites['gatherer'] = { loaded: false, color: this.getPlaceholderColor('gatherer') };
            this.sprites['hunter'] = { loaded: false, color: this.getPlaceholderColor('hunter') };
            this.sprites['builder'] = { loaded: false, color: this.getPlaceholderColor('builder') };
            this.sprites['researcher'] = { loaded: false, color: this.getPlaceholderColor('researcher') };
            
            // Building sprites
            this.sprites['shelter'] = { loaded: false, color: this.getPlaceholderColor('shelter') };
            this.sprites['storage'] = { loaded: false, color: this.getPlaceholderColor('storage') };
            this.sprites['crafting'] = { loaded: false, color: this.getPlaceholderColor('crafting') };
            this.sprites['research'] = { loaded: false, color: this.getPlaceholderColor('research') };
            
            // Resource sprites
            this.sprites['food'] = { loaded: false, color: this.getPlaceholderColor('food') };
            this.sprites['water'] = { loaded: false, color: this.getPlaceholderColor('water_resource') };
            this.sprites['wood'] = { loaded: false, color: this.getPlaceholderColor('wood') };
            this.sprites['stone'] = { loaded: false, color: this.getPlaceholderColor('stone') };
            this.sprites['plant_fiber'] = { loaded: false, color: this.getPlaceholderColor('plant_fiber') };
            this.sprites['metal_ore'] = { loaded: false, color: this.getPlaceholderColor('metal_ore') };
            this.sprites['animal_hide'] = { loaded: false, color: this.getPlaceholderColor('animal_hide') };
            
            // Now attempt to load actual sprite images
            // These will override the placeholders if loading succeeds
            
            // Terrain sprites
            this.loadSprite('grass', 'terrain/grass.png');
            this.loadSprite('water', 'terrain/water.png');
            this.loadSprite('forest', 'terrain/forest.png');
            this.loadSprite('mountain', 'terrain/mountain.png');
            this.loadSprite('clay', 'terrain/clay.png');
            
            // Settler sprites
            this.loadSprite('gatherer', 'settlers/gatherer.png');
            this.loadSprite('hunter', 'settlers/hunter.png');
            this.loadSprite('builder', 'settlers/builder.png');
            this.loadSprite('researcher', 'settlers/researcher.png');
            
            // Building sprites
            this.loadSprite('shelter', 'buildings/shelter.png');
            this.loadSprite('storage', 'buildings/storage.png');
            this.loadSprite('crafting', 'buildings/crafting.png');
            this.loadSprite('research', 'buildings/research.png');
            
            // Resource sprites
            this.loadSprite('food', 'resources/food.png');
            this.loadSprite('water', 'resources/water.png');
            this.loadSprite('wood', 'resources/wood.png');
            this.loadSprite('stone', 'resources/stone.png');
            this.loadSprite('plant_fiber', 'resources/plant_fiber.png');
            this.loadSprite('metal_ore', 'resources/metal_ore.png');
            this.loadSprite('animal_hide', 'resources/animal_hide.png');
            
            console.log('Sprite initialization complete, using placeholders until images load');
        } catch (error) {
            console.error('Error initializing sprites:', error);
        }
    }
    
    loadSprite(name, path) {
        try {
            // Skip if we don't have a name
            if (!name) {
                console.warn('Attempted to load sprite with no name');
                return;
            }
            
            // Create a new image object
            const img = new Image();
            
            // Set up event handlers before setting src
            img.onload = () => {
                if (this.sprites[name]) {
                    this.sprites[name].img = img;
                    this.sprites[name].loaded = true;
                    console.log(`Loaded sprite: ${name}`);
                }
            };
            
            img.onerror = () => {
                console.warn(`Failed to load sprite: ${path} - using placeholder color`);
                // Ensure we have the placeholder color (should already be set)
                if (this.sprites[name] && !this.sprites[name].color) {
                    this.sprites[name].color = this.getPlaceholderColor(name);
                }
            };
            
            // Set the source to trigger loading
            img.src = `assets/sprites/${path}`;
            
            // If sprite doesn't exist yet (should not happen with our initialization), create it
            if (!this.sprites[name]) {
                this.sprites[name] = {
                    img: img,
                    loaded: false,
                    color: this.getPlaceholderColor(name)
                };
            }
        } catch (error) {
            console.error(`Error loading sprite ${name}:`, error);
            // Ensure we have a fallback
            if (!this.sprites[name]) {
                this.sprites[name] = {
                    loaded: false,
                    color: this.getPlaceholderColor(name)
                };
            }
        }
    }
    
    getPlaceholderColor(name) {
        // Return different colors based on sprite type for development
        const colors = {
            // Terrain
            'grass': '#7EC850',
            'water': '#4B9CD9',
            'forest': '#2E8C3D',
            'mountain': '#847E87',
            'clay': '#CB8D5A',
            
            // Settlers
            'gatherer': '#68BB59',
            'hunter': '#D17F41',
            'builder': '#7AA3CC',
            'researcher': '#A96ED1',
            
            // Buildings
            'shelter': '#8E7C6C',
            'storage': '#B89F65',
            'crafting': '#C76953',
            'research': '#7595BA',
            
            // Resources
            'food': '#E8C967',
            'water_resource': '#5FB2F0',
            'wood': '#956A44',
            'stone': '#9E9E9E',
            'plant_fiber': '#8AAD57',
            'metal_ore': '#C2C2C2',
            'animal_hide': '#B87652'
        };
        
        return colors[name] || '#FF00FF'; // Magenta for unknown sprites
    }
    
    generateTerrain() {
        // Simple noise-based terrain generation
        this.terrain = [];
        
        for (let y = 0; y < this.mapSize.height; y++) {
            const row = [];
            for (let x = 0; x < this.mapSize.width; x++) {
                // Simple noise function
                const noise = this.simpleNoise(x, y);
                
                let type;
                if (noise < 0.3) {
                    type = 'water';
                } else if (noise < 0.6) {
                    type = 'grass';
                } else if (noise < 0.8) {
                    type = 'forest';
                } else {
                    type = 'mountain';
                }
                
                // Add clay deposits
                if (type === 'grass' && Math.random() < 0.05) {
                    type = 'clay';
                }
                
                row.push({
                    type: type,
                    x: x,
                    y: y,
                    passable: type !== 'water' && type !== 'mountain'
                });
            }
            this.terrain.push(row);
        }
    }
    
    simpleNoise(x, y) {
        // Very simple deterministic noise function
        const value = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5 + 0.5;
        return Math.min(0.99, Math.max(0.01, value + Math.random() * 0.1));
    }
    
    initializeEntities() {
        // Clear existing entities
        this.entities.settlers = [];
        this.entities.buildings = [];
        this.entities.resources = [];
        
        // Create settlers based on population groups
        this.createSettlers();
        
        // Create buildings based on building progress
        this.createBuildings();
        
        // Place resource nodes on the map
        this.placeResourceNodes();
    }
    
    createSettlers() {
        const population = this.game.settlement.population;
        
        // Create gatherers
        for (let i = 0; i < population.groups.gatherers; i++) {
            this.entities.settlers.push({
                type: 'gatherer',
                x: 5 + Math.random() * 5,
                y: 5 + Math.random() * 5,
                targetX: null,
                targetY: null,
                speed: 0.05,
                task: 'idle'
            });
        }
        
        // Create hunters
        for (let i = 0; i < population.groups.hunters; i++) {
            this.entities.settlers.push({
                type: 'hunter',
                x: 10 + Math.random() * 5,
                y: 5 + Math.random() * 5,
                targetX: null,
                targetY: null,
                speed: 0.07,
                task: 'idle'
            });
        }
        
        // Create builders
        for (let i = 0; i < population.groups.builders; i++) {
            this.entities.settlers.push({
                type: 'builder',
                x: 5 + Math.random() * 5,
                y: 10 + Math.random() * 5,
                targetX: null,
                targetY: null,
                speed: 0.04,
                task: 'idle'
            });
        }
        
        // Create researchers
        for (let i = 0; i < population.groups.researchers; i++) {
            this.entities.settlers.push({
                type: 'researcher',
                x: 10 + Math.random() * 5,
                y: 10 + Math.random() * 5,
                targetX: null,
                targetY: null,
                speed: 0.03,
                task: 'research'
            });
        }
    }
    
    createBuildings() {
        const buildings = this.game.settlement.buildingProgress;
        
        // Only create buildings that have at least 25% progress
        if (buildings.shelter >= 25) {
            this.entities.buildings.push({
                type: 'shelter',
                x: 7,
                y: 7,
                progress: buildings.shelter,
                size: 2 // Size in tiles
            });
        }
        
        if (buildings.storageArea >= 25) {
            this.entities.buildings.push({
                type: 'storage',
                x: 11,
                y: 7,
                progress: buildings.storageArea,
                size: 2
            });
        }
        
        if (buildings.craftingArea >= 25) {
            this.entities.buildings.push({
                type: 'crafting',
                x: 7,
                y: 11,
                progress: buildings.craftingArea,
                size: 2
            });
        }
        
        if (buildings.researchArea >= 25) {
            this.entities.buildings.push({
                type: 'research',
                x: 11,
                y: 11,
                progress: buildings.researchArea,
                size: 2
            });
        }
    }
    
    placeResourceNodes() {
        // Place food resources (plants, berries)
        for (let i = 0; i < 20; i++) {
            // Place on grass or forest tiles
            const position = this.findTilePosition(['grass', 'forest']);
            
            if (position) {
                this.entities.resources.push({
                    type: 'food',
                    x: position.x,
                    y: position.y,
                    amount: 10 + Math.floor(Math.random() * 20),
                    respawnTime: 100
                });
            }
        }
        
        // Place water sources
        for (let i = 0; i < 10; i++) {
            // Place near water tiles
            const position = this.findTilePositionNear('water');
            
            if (position) {
                this.entities.resources.push({
                    type: 'water',
                    x: position.x,
                    y: position.y,
                    amount: 20 + Math.floor(Math.random() * 30),
                    respawnTime: 50
                });
            }
        }
        
        // Place wood (trees)
        for (let i = 0; i < 15; i++) {
            // Place on forest tiles
            const position = this.findTilePosition(['forest']);
            
            if (position) {
                this.entities.resources.push({
                    type: 'wood',
                    x: position.x,
                    y: position.y,
                    amount: 15 + Math.floor(Math.random() * 15),
                    respawnTime: 200
                });
            }
        }
        
        // Place stone
        for (let i = 0; i < 8; i++) {
            // Place on mountain or grass tiles
            const position = this.findTilePosition(['mountain', 'grass']);
            
            if (position) {
                this.entities.resources.push({
                    type: 'stone',
                    x: position.x,
                    y: position.y,
                    amount: 10 + Math.floor(Math.random() * 10),
                    respawnTime: 300
                });
            }
        }
        
        // Place metal ore
        for (let i = 0; i < 5; i++) {
            // Place on mountain tiles
            const position = this.findTilePosition(['mountain']);
            
            if (position) {
                this.entities.resources.push({
                    type: 'metal_ore',
                    x: position.x,
                    y: position.y,
                    amount: 5 + Math.floor(Math.random() * 10),
                    respawnTime: 500
                });
            }
        }
        
        // Place clay
        for (let i = 0; i < 3; i++) {
            // Place on clay tiles
            const position = this.findTilePosition(['clay']);
            
            if (position) {
                this.entities.resources.push({
                    type: 'clay',
                    x: position.x,
                    y: position.y,
                    amount: 8 + Math.floor(Math.random() * 12),
                    respawnTime: 400
                });
            }
        }
    }
    
    findTilePosition(allowedTypes) {
        // Try 20 random positions
        for (let attempt = 0; attempt < 20; attempt++) {
            const x = Math.floor(Math.random() * this.mapSize.width);
            const y = Math.floor(Math.random() * this.mapSize.height);
            
            if (y < this.terrain.length && x < this.terrain[y].length) {
                const tile = this.terrain[y][x];
                if (allowedTypes.includes(tile.type)) {
                    // Check if the position is not already occupied
                    if (!this.isPositionOccupied(x, y)) {
                        return { x, y };
                    }
                }
            }
        }
        
        return null;
    }
    
    findTilePositionNear(tileType) {
        // Find a position adjacent to the specified tile type
        for (let attempt = 0; attempt < 20; attempt++) {
            const x = Math.floor(Math.random() * (this.mapSize.width - 1));
            const y = Math.floor(Math.random() * (this.mapSize.height - 1));
            
            if (y < this.terrain.length && x < this.terrain[y].length) {
                // Check adjacent tiles
                const adjacentPositions = [
                    { x: x+1, y: y },
                    { x: x-1, y: y },
                    { x: x, y: y+1 },
                    { x: x, y: y-1 }
                ];
                
                for (const pos of adjacentPositions) {
                    if (pos.y >= 0 && pos.y < this.terrain.length && 
                        pos.x >= 0 && pos.x < this.terrain[pos.y].length) {
                        if (this.terrain[pos.y][pos.x].type === tileType) {
                            // Found an adjacent tile of the required type
                            if (!this.isPositionOccupied(x, y) && this.terrain[y][x].passable) {
                                return { x, y };
                            }
                        }
                    }
                }
            }
        }
        
        return null;
    }
    
    isPositionOccupied(x, y) {
        // Check if there's a resource at this position
        for (const resource of this.entities.resources) {
            if (Math.floor(resource.x) === x && Math.floor(resource.y) === y) {
                return true;
            }
        }
        
        // Check if there's a building at this position
        for (const building of this.entities.buildings) {
            // Buildings can occupy multiple tiles based on size
            if (x >= building.x && x < building.x + building.size &&
                y >= building.y && y < building.y + building.size) {
                return true;
            }
        }
        
        return false;
    }
    
    update(gameSpeed) {
        // Update settlers
        this.updateSettlers(gameSpeed);
        
        // Update resources
        this.updateResources(gameSpeed);
    }
    
    updateSettlers(gameSpeed) {
        for (const settler of this.entities.settlers) {
            // If settler has no target, assign a new one
            if (settler.targetX === null || settler.targetY === null) {
                this.assignNewTarget(settler);
            }
            
            // Move toward target using path if available
            if (settler.targetX !== null && settler.targetY !== null) {
                // If settler has a path, follow it
                if (settler.path && settler.path.length > 0) {
                    this.moveSettlerAlongPath(settler, gameSpeed);
                } else {
                    // Fallback to direct movement if no path available
                    this.moveSettlerDirectly(settler, gameSpeed);
                }
            }
        }
    }
    
    /**
     * Move settler along calculated path
     * @param {Object} settler - Settler object to move
     * @param {number} gameSpeed - Current game speed
     */
    moveSettlerAlongPath(settler, gameSpeed) {
        // Get next point in path
        const nextPoint = settler.path[0];
        
        // Move toward next point
        const dx = nextPoint.x + 0.5 - settler.x; // Center of tile
        const dy = nextPoint.y + 0.5 - settler.y; // Center of tile
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0.1) {
            // Move toward next point
            settler.x += (dx / distance) * settler.speed * gameSpeed;
            settler.y += (dy / distance) * settler.speed * gameSpeed;
        } else {
            // Reached next point, remove it from path
            settler.path.shift();
            
            // If path is empty, we've reached the target
            if (settler.path.length === 0) {
                // Final position adjustment
                settler.x = settler.targetX;
                settler.y = settler.targetY;
                
                // Perform task at target
                this.performSettlerTask(settler);
                
                // Clear target
                settler.targetX = null;
                settler.targetY = null;
            }
        }
    }
    
    /**
     * Move settler directly to target (fallback when no path available)
     * @param {Object} settler - Settler object to move
     * @param {number} gameSpeed - Current game speed
     */
    moveSettlerDirectly(settler, gameSpeed) {
        const dx = settler.targetX - settler.x;
        const dy = settler.targetY - settler.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0.1) {
            // Move toward target
            settler.x += (dx / distance) * settler.speed * gameSpeed;
            settler.y += (dy / distance) * settler.speed * gameSpeed;
        } else {
            // Reached target
            settler.x = settler.targetX;
            settler.y = settler.targetY;
            
            // Perform task at target
            this.performSettlerTask(settler);
            
            // Clear target
            settler.targetX = null;
            settler.targetY = null;
        }
    }
    
    assignNewTarget(settler) {
        switch (settler.type) {
            case 'gatherer':
                // Target food or water resources
                this.assignResourceTarget(settler, ['food', 'water', 'plant_fiber']);
                break;
                
            case 'hunter':
                // Target food resources or explore the map
                if (Math.random() < 0.7) {
                    this.assignResourceTarget(settler, ['food']);
                } else {
                    this.assignExplorationTarget(settler);
                }
                break;
                
            case 'builder':
                // Target buildings under construction or resources needed for buildings
                if (Math.random() < 0.6) {
                    this.assignBuildingTarget(settler);
                } else {
                    this.assignResourceTarget(settler, ['wood', 'stone', 'clay']);
                }
                break;
                
            case 'researcher':
                // Stay near research buildings
                this.assignResearchTarget(settler);
                break;
                
            default:
                // Random exploration
                this.assignExplorationTarget(settler);
        }
        
        // If a target was assigned, calculate path to it
        if (settler.targetX !== null && settler.targetY !== null) {
            // Calculate path to target using pathfinding
            settler.path = this.findPathForSettler(settler, settler.targetX, settler.targetY);
            
            // If no path found, try a different target
            if (!settler.path || settler.path.length === 0) {
                settler.targetX = null;
                settler.targetY = null;
                this.assignExplorationTarget(settler);
            }
        }
    }
    
    /**
     * Find path for a settler to a target position
     * @param {Object} settler - The settler object
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @returns {Array} - Path as array of points
     */
    findPathForSettler(settler, targetX, targetY) {
        // Get current position
        const startX = Math.floor(settler.x);
        const startY = Math.floor(settler.y);
        const endX = Math.floor(targetX);
        const endY = Math.floor(targetY);
        
        // Use the pathfinding system to find a path
        return Pathfinding.findPath(this.terrain, startX, startY, endX, endY, true);
    }
    
    assignResourceTarget(settler, resourceTypes) {
        // Find resources of the specified types
        const validResources = this.entities.resources.filter(r => 
            resourceTypes.includes(r.type) && r.amount > 0);
        
        if (validResources.length > 0) {
            // Pick a random resource
            const resource = validResources[Math.floor(Math.random() * validResources.length)];
            settler.targetX = resource.x;
            settler.targetY = resource.y;
            settler.task = 'gather';
            settler.targetResource = resource;
        } else {
            // No valid resources, explore instead
            this.assignExplorationTarget(settler);
        }
    }
    
    assignBuildingTarget(settler) {
        // Find buildings under construction
        const incompleteBuildings = this.entities.buildings.filter(b => b.progress < 100);
        
        if (incompleteBuildings.length > 0) {
            // Pick a random incomplete building
            const building = incompleteBuildings[Math.floor(Math.random() * incompleteBuildings.length)];
            settler.targetX = building.x + Math.random() * building.size;
            settler.targetY = building.y + Math.random() * building.size;
            settler.task = 'build';
            settler.targetBuilding = building;
        } else {
            // No buildings under construction, gather building materials instead
            this.assignResourceTarget(settler, ['wood', 'stone']);
        }
    }
    
    assignResearchTarget(settler) {
        // Find research buildings
        const researchBuildings = this.entities.buildings.filter(b => b.type === 'research');
        
        if (researchBuildings.length > 0) {
            // Go to a research building
            const building = researchBuildings[Math.floor(Math.random() * researchBuildings.length)];
            settler.targetX = building.x + Math.random() * building.size;
            settler.targetY = building.y + Math.random() * building.size;
            settler.task = 'research';
        } else {
            // No research buildings, explore instead
            this.assignExplorationTarget(settler);
        }
    }
    
    assignExplorationTarget(settler) {
        // Pick a random passable location on the map
        let attempts = 0;
        let found = false;
        
        while (!found && attempts < 10) {
            attempts++;
            const tx = Math.floor(Math.random() * this.mapSize.width);
            const ty = Math.floor(Math.random() * this.mapSize.height);
            
            if (ty < this.terrain.length && tx < this.terrain[ty].length) {
                const tile = this.terrain[ty][tx];
                if (tile.passable) {
                    settler.targetX = tx + Math.random();
                    settler.targetY = ty + Math.random();
                    settler.task = 'explore';
                    found = true;
                }
            }
        }
        
        // If no valid target found, just use current position
        if (!found) {
            settler.targetX = settler.x;
            settler.targetY = settler.y;
            settler.task = 'idle';
        }
    }
    
    performSettlerTask(settler) {
        switch (settler.task) {
            case 'gather':
                if (settler.targetResource && settler.targetResource.amount > 0) {
                    // Reduce resource amount
                    settler.targetResource.amount--;
                }
                break;
                
            case 'build':
                if (settler.targetBuilding && settler.targetBuilding.progress < 100) {
                    // Increase building progress
                    settler.targetBuilding.progress += 0.5;
                    settler.targetBuilding.progress = Math.min(100, settler.targetBuilding.progress);
                }
                break;
                
            case 'research':
                // Research task handled by the game's research system
                break;
                
            case 'explore':
            case 'idle':
                // No specific action
                break;
        }
    }
    
    updateResources(gameSpeed) {
        // Replenish resources that have been depleted
        for (const resource of this.entities.resources) {
            if (resource.amount <= 0) {
                // Start respawn timer if not already set
                if (!resource.respawnTimer) {
                    resource.respawnTimer = resource.respawnTime;
                }
                
                // Count down respawn timer
                if (resource.respawnTimer > 0) {
                    resource.respawnTimer -= gameSpeed;
                } else {
                    // Respawn resource
                    resource.amount = Math.floor(5 + Math.random() * 15);
                    resource.respawnTimer = null;
                }
            }
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render terrain
        this.renderTerrain();
        
        // Render resources
        this.renderResources();
        
        // Render buildings
        this.renderBuildings();
        
        // Render paths (for debugging)
        this.renderPaths();
        
        // Render settlers
        this.renderSettlers();
    }
    
    /**
     * Render settler paths for debugging
     */
    renderPaths() {
        for (const settler of this.entities.settlers) {
            if (settler.path && settler.path.length > 0) {
                // Draw path
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                
                // Start from settler's current position
                const startX = (settler.x - this.camera.x) * this.tileSize + this.tileSize / 2;
                const startY = (settler.y - this.camera.y) * this.tileSize + this.tileSize / 2;
                this.ctx.moveTo(startX, startY);
                
                // Draw line through each path point
                for (const point of settler.path) {
                    const screenX = (point.x - this.camera.x) * this.tileSize + this.tileSize / 2;
                    const screenY = (point.y - this.camera.y) * this.tileSize + this.tileSize / 2;
                    this.ctx.lineTo(screenX, screenY);
                }
                
                // Connect to target
                if (settler.targetX !== null && settler.targetY !== null) {
                    const targetX = (settler.targetX - this.camera.x) * this.tileSize + this.tileSize / 2;
                    const targetY = (settler.targetY - this.camera.y) * this.tileSize + this.tileSize / 2;
                    this.ctx.lineTo(targetX, targetY);
                }
                
                this.ctx.stroke();
            }
        }
    }
    
    renderTerrain() {
        // Calculate the range of tiles to render based on camera position
        const startX = Math.max(0, Math.floor(this.camera.x));
        const startY = Math.max(0, Math.floor(this.camera.y));
        const endX = Math.min(this.mapSize.width, Math.ceil(this.camera.x + this.visibleTiles.width));
        const endY = Math.min(this.mapSize.height, Math.ceil(this.camera.y + this.visibleTiles.height));
        
        // Render visible tiles
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (y < this.terrain.length && x < this.terrain[y].length) {
                    const tile = this.terrain[y][x];
                    const screenX = (x - this.camera.x) * this.tileSize;
                    const screenY = (y - this.camera.y) * this.tileSize;
                    
                    // Draw the tile
                    this.drawTile(tile.type, screenX, screenY);
                }
            }
        }
    }
    
    renderResources() {
        for (const resource of this.entities.resources) {
            // Skip depleted resources
            if (resource.amount <= 0) continue;
            
            const screenX = (resource.x - this.camera.x) * this.tileSize;
            const screenY = (resource.y - this.camera.y) * this.tileSize;
            
            // Check if resource is on screen
            if (screenX >= -this.tileSize && screenX <= this.canvas.width &&
                screenY >= -this.tileSize && screenY <= this.canvas.height) {
                this.drawResource(resource.type, screenX, screenY);
            }
        }
    }
    
    renderBuildings() {
        for (const building of this.entities.buildings) {
            const screenX = (building.x - this.camera.x) * this.tileSize;
            const screenY = (building.y - this.camera.y) * this.tileSize;
            const width = building.size * this.tileSize;
            const height = building.size * this.tileSize;
            
            // Check if building is on screen
            if (screenX >= -width && screenX <= this.canvas.width &&
                screenY >= -height && screenY <= this.canvas.height) {
                this.drawBuilding(building.type, screenX, screenY, width, height, building.progress);
            }
        }
    }
    
    renderSettlers() {
        for (const settler of this.entities.settlers) {
            const screenX = (settler.x - this.camera.x) * this.tileSize;
            const screenY = (settler.y - this.camera.y) * this.tileSize;
            
            // Check if settler is on screen
            if (screenX >= -this.tileSize && screenX <= this.canvas.width &&
                screenY >= -this.tileSize && screenY <= this.canvas.height) {
                this.drawSettler(settler.type, screenX, screenY);
            }
        }
    }
    
    drawTile(type, x, y) {
        const sprite = this.sprites[type];
        
        if (sprite && sprite.loaded) {
            // Draw the sprite
            this.ctx.drawImage(sprite.img, x, y, this.tileSize, this.tileSize);
        } else {
            // Draw a colored rectangle as fallback
            this.ctx.fillStyle = sprite?.color || this.getPlaceholderColor(type);
            this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
        }
    }
    
    drawResource(type, x, y) {
        // Convert resource type to sprite name if needed
        const spriteName = type.replace('_', '_');
        const sprite = this.sprites[spriteName] || this.sprites[type];
        
        if (sprite && sprite.loaded) {
            // Draw the sprite
            this.ctx.drawImage(sprite.img, x, y, this.tileSize, this.tileSize);
        } else {
            // Draw a colored circle as fallback
            this.ctx.fillStyle = sprite?.color || this.getPlaceholderColor(type);
            this.ctx.beginPath();
            this.ctx.arc(x + this.tileSize/2, y + this.tileSize/2, this.tileSize/4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawBuilding(type, x, y, width, height, progress) {
        const sprite = this.sprites[type];
        
        if (sprite && sprite.loaded) {
            // Draw the sprite
            this.ctx.drawImage(sprite.img, x, y, width, height);
        } else {
            // Draw a colored rectangle as fallback
            this.ctx.fillStyle = sprite?.color || this.getPlaceholderColor(type);
            this.ctx.fillRect(x, y, width, height);
        }
        
        // Draw progress bar if building is under construction
        if (progress < 100) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(x, y - 10, width, 5);
            
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.fillRect(x, y - 10, width * (progress / 100), 5);
        }
    }
    
    drawSettler(type, x, y) {
        const sprite = this.sprites[type];
        
        if (sprite && sprite.loaded) {
            // Draw the sprite
            this.ctx.drawImage(sprite.img, x, y, this.tileSize, this.tileSize);
        } else {
            // Draw a colored circle as fallback
            this.ctx.fillStyle = sprite?.color || this.getPlaceholderColor(type);
            this.ctx.beginPath();
            this.ctx.arc(x + this.tileSize/2, y + this.tileSize/2, this.tileSize/3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    // Map navigation methods
    moveCamera(dx, dy) {
        this.camera.x += dx;
        this.camera.y += dy;
        
        // Clamp camera position
        this.camera.x = Math.max(0, Math.min(this.mapSize.width - this.visibleTiles.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.mapSize.height - this.visibleTiles.height, this.camera.y));
    }
    
    zoomIn() {
        this.tileSize = Math.min(64, this.tileSize + 4);
        this.updateVisibleTiles();
    }
    
    zoomOut() {
        this.tileSize = Math.max(16, this.tileSize - 4);
        this.updateVisibleTiles();
    }
    
    updateVisibleTiles() {
        this.visibleTiles.width = Math.ceil(this.canvas.width / this.tileSize);
        this.visibleTiles.height = Math.ceil(this.canvas.height / this.tileSize);
    }
    
    // Public methods to be called from game.js
    syncWithGameState() {
        // Update entities based on current game state
        this.syncSettlers();
        this.syncBuildings();
    }
    
    syncSettlers() {
        const population = this.game.settlement.population;
        const totalSettlers = population.groups.gatherers + 
                             population.groups.hunters + 
                             population.groups.builders + 
                             population.groups.researchers;
        
        // Check if we need to create or remove settlers
        if (this.entities.settlers.length !== totalSettlers) {
            // Reset settlers
            this.entities.settlers = [];
            this.createSettlers();
        }
    }
    
    syncBuildings() {
        // Update building progress or create new buildings
        const buildings = this.game.settlement.buildingProgress;
        
        // Update existing buildings
        for (const building of this.entities.buildings) {
            switch (building.type) {
                case 'shelter':
                    building.progress = buildings.shelter;
                    break;
                case 'storage':
                    building.progress = buildings.storageArea;
                    break;
                case 'crafting':
                    building.progress = buildings.craftingArea;
                    break;
                case 'research':
                    building.progress = buildings.researchArea;
                    break;
            }
        }
        
        // Check for new buildings to create
        const buildingTypes = [
            { type: 'shelter', progress: buildings.shelter },
            { type: 'storage', progress: buildings.storageArea },
            { type: 'crafting', progress: buildings.craftingArea },
            { type: 'research', progress: buildings.researchArea }
        ];
        
        for (const buildingData of buildingTypes) {
            if (buildingData.progress >= 25) {
                // Check if this building already exists
                const exists = this.entities.buildings.some(b => b.type === buildingData.type);
                
                if (!exists) {
                    // Create the building
                    let position;
                    
                    switch (buildingData.type) {
                        case 'shelter':
                            position = { x: 7, y: 7 };
                            break;
                        case 'storage':
                            position = { x: 11, y: 7 };
                            break;
                        case 'crafting':
                            position = { x: 7, y: 11 };
                            break;
                        case 'research':
                            position = { x: 11, y: 11 };
                            break;
                    }
                    
                    this.entities.buildings.push({
                        type: buildingData.type,
                        x: position.x,
                        y: position.y,
                        progress: buildingData.progress,
                        size: 2
                    });
                }
            }
        }
    }
}

// Make Renderer available globally
window.Renderer = Renderer;