// Keyboard and mouse controls for the game
class Controls {
    constructor(game) {
        this.game = game;
        this.keysPressed = {};
        
        // Camera movement speed (tiles per frame)
        this.cameraSpeed = 0.2;
        
        this.setupKeyboardControls();
        this.setupMouseControls();
    }
    
    setupKeyboardControls() {
        // Add event listeners for keyboard
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    setupMouseControls() {
        // Get canvas reference
        const canvas = document.getElementById('game-canvas');
        
        // Make sure canvas exists before adding event listeners
        if (!canvas) {
            console.error('Canvas element not found when setting up mouse controls!');
            return;
        }
        
        // Add mouse event listeners
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Mouse state
        this.mouse = {
            isDown: false,
            lastX: 0,
            lastY: 0,
            isDragging: false
        };
    }
    
    handleKeyDown(e) {
        this.keysPressed[e.key.toLowerCase()] = true;
    }
    
    handleKeyUp(e) {
        this.keysPressed[e.key.toLowerCase()] = false;
    }
    
    handleMouseDown(e) {
        this.mouse.isDown = true;
        this.mouse.lastX = e.clientX;
        this.mouse.lastY = e.clientY;
        this.mouse.isDragging = false;
    }
    
    handleMouseMove(e) {
        if (this.mouse.isDown) {
            const dx = e.clientX - this.mouse.lastX;
            const dy = e.clientY - this.mouse.lastY;
            
            // If mouse moved more than 5 pixels, consider it dragging
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                this.mouse.isDragging = true;
                
                // Move camera when dragging
                this.game.renderer.moveCamera(-dx / this.game.renderer.tileSize, -dy / this.game.renderer.tileSize);
                
                // Update last position
                this.mouse.lastX = e.clientX;
                this.mouse.lastY = e.clientY;
            }
        }
    }
    
    handleMouseUp(e) {
        if (!this.mouse.isDragging) {
            // Handle click (no drag)
            this.handleClick(e);
        }
        
        this.mouse.isDown = false;
        this.mouse.isDragging = false;
    }
    
    handleWheel(e) {
        // Zoom in or out based on wheel direction
        if (e.deltaY < 0) {
            this.game.renderer.zoomIn();
        } else {
            this.game.renderer.zoomOut();
        }
        
        // Prevent default scrolling
        e.preventDefault();
    }
    
    handleClick(e) {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            console.error('Canvas element not found when handling click!');
            return;
        }
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        // Calculate click position in canvas coordinates
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // Convert to tile coordinates
        const tileX = Math.floor(x / this.game.renderer.tileSize + this.game.renderer.camera.x);
        const tileY = Math.floor(y / this.game.renderer.tileSize + this.game.renderer.camera.y);
        
        // Handle tile interaction
        this.handleTileInteraction(tileX, tileY);
    }
    
    handleTileInteraction(tileX, tileY) {
        // Check if there's a settler at this position
        const settler = this.findSettlerAtPosition(tileX, tileY);
        if (settler) {
            EventLogger.addEvent(`Selected ${settler.type}`);
            // Future: Implement settler selection and display info
            return;
        }
        
        // Check if there's a building at this position
        const building = this.findBuildingAtPosition(tileX, tileY);
        if (building) {
            EventLogger.addEvent(`Selected ${building.type} (${building.progress.toFixed(0)}% complete)`);
            // Future: Implement building selection and display info
            return;
        }
        
        // Check if there's a resource at this position
        const resource = this.findResourceAtPosition(tileX, tileY);
        if (resource) {
            EventLogger.addEvent(`Selected ${formatResourceName(resource.type)} (${resource.amount} available)`);
            // Future: Implement resource selection and display info
            return;
        }
    }
    
    findSettlerAtPosition(tileX, tileY) {
        for (const settler of this.game.renderer.entities.settlers) {
            const settlerTileX = Math.floor(settler.x);
            const settlerTileY = Math.floor(settler.y);
            
            if (settlerTileX === tileX && settlerTileY === tileY) {
                return settler;
            }
        }
        return null;
    }
    
    findBuildingAtPosition(tileX, tileY) {
        for (const building of this.game.renderer.entities.buildings) {
            if (tileX >= building.x && tileX < building.x + building.size &&
                tileY >= building.y && tileY < building.y + building.size) {
                return building;
            }
        }
        return null;
    }
    
    findResourceAtPosition(tileX, tileY) {
        for (const resource of this.game.renderer.entities.resources) {
            const resourceTileX = Math.floor(resource.x);
            const resourceTileY = Math.floor(resource.y);
            
            if (resourceTileX === tileX && resourceTileY === tileY) {
                return resource;
            }
        }
        return null;
    }
    
    update() {
        // Handle camera movement based on keys
        if (this.keysPressed['w'] || this.keysPressed['arrowup']) {
            this.game.renderer.moveCamera(0, -this.cameraSpeed);
        }
        if (this.keysPressed['s'] || this.keysPressed['arrowdown']) {
            this.game.renderer.moveCamera(0, this.cameraSpeed);
        }
        if (this.keysPressed['a'] || this.keysPressed['arrowleft']) {
            this.game.renderer.moveCamera(-this.cameraSpeed, 0);
        }
        if (this.keysPressed['d'] || this.keysPressed['arrowright']) {
            this.game.renderer.moveCamera(this.cameraSpeed, 0);
        }
        
        // Handle zoom
        if (this.keysPressed['+'] || this.keysPressed['=']) {
            this.game.renderer.zoomIn();
            // Clear key to prevent continuous zooming
            this.keysPressed['+'] = false;
            this.keysPressed['='] = false;
        }
        if (this.keysPressed['-']) {
            this.game.renderer.zoomOut();
            // Clear key to prevent continuous zooming
            this.keysPressed['-'] = false;
        }
    }
}

// Helper function to format resource names
function formatResourceName(resourceKey) {
    return resourceKey
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}