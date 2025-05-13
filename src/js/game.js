// Main Game class
class Game {
    static instance = null;
    
    constructor() {
        // Ensure singleton pattern
        if (Game.instance) {
            return Game.instance;
        }
        Game.instance = this;
        
        // Game components
        this.ecosystem = new Ecosystem();
        this.settlement = new Settlement();
        this.environment = { ...JSON.parse(JSON.stringify(initialEnvironment)) };
        
        // Game settings
        this.gameSpeed = 1; // 0 = paused, 1 = normal, 2 = fast
        this.tickInterval = 1000; // ms between updates at normal speed
        this.lastTick = Date.now();
        this.tickTimer = null;
        
        // Technology manager
        this.technologyManager = new TechnologyManager(this.settlement);
        
        // UI manager
        this.ui = new UIManager(this);
        
        // Initialize components in the correct order to avoid race conditions
        this.initGame();
    }
    
    async initGame() {
        // First initialize the renderer (which creates the canvas if needed)
        this.renderer = new Renderer(this);
        
        // Ensure the canvas is fully initialized before setting up controls
        setTimeout(() => {
            // Controls for keyboard and mouse interactions
            this.controls = new Controls(this);
            
            // Autosave timer
            this.autoSaveInterval = 60000; // 1 minute
            this.lastAutoSave = Date.now();
            
            // Animation frame ID for rendering loop
            this.animationFrameId = null;
            
            // Check for saved game
            this.loadGame();
            
            // Start the game loop
            this.startGameLoop();
            
            // Start the rendering loop
            this.startRenderLoop();
            
            // Log game start
            EventLogger.addEvent('Settlement simulation has begun.');
        }, 100); // Short delay to ensure DOM and canvas are ready
    }
    
    // Controls are now handled by the Controls class
    
    startGameLoop() {
        this.lastTick = Date.now();
        this.tickTimer = setInterval(() => this.tick(), this.tickInterval);
    }
    
    startRenderLoop() {
        // Using requestAnimationFrame for smooth rendering
        const renderFrame = () => {
            // Update visual entities
            this.renderer.update(this.gameSpeed);
            
            // Render the scene
            this.renderer.render();
            
            // Continue the loop
            this.animationFrameId = requestAnimationFrame(renderFrame);
        };
        
        // Start the rendering loop
        this.animationFrameId = requestAnimationFrame(renderFrame);
    }
    
    tick() {
        if (this.gameSpeed === 0) return; // Game paused
        
        const now = Date.now();
        const elapsed = now - this.lastTick;
        this.lastTick = now;
        
        // Calculate actual game time delta (in days)
        const dayFraction = (elapsed / this.tickInterval) * this.gameSpeed;
        
        // Update environment
        this.updateEnvironment(dayFraction);
        
        // Update ecosystem
        this.ecosystem.update(this.environment, dayFraction);
        
        // Update settlement
        this.settlement.update(this.ecosystem, this.environment, dayFraction);
        
        // Update controls
        this.controls.update();
        
        // Update UI
        this.ui.updateUI();
        
        // Sync renderer with game state
        this.renderer.syncWithGameState();
        
        // Check for autosave
        if (now - this.lastAutoSave >= this.autoSaveInterval) {
            this.saveGame();
            this.lastAutoSave = now;
        }
    }
    
    setSpeed(speed) {
        this.gameSpeed = speed;
        this.updateTickInterval();
        this.ui.updateSpeedControls(speed);
        
        if (speed === 0) {
            EventLogger.addEvent('Simulation paused.');
        } else if (speed === 1) {
            EventLogger.addEvent('Simulation running at normal speed.');
        } else if (speed === 2) {
            EventLogger.addEvent('Simulation running at fast speed.');
        }
    }
    
    updateTickInterval() {
        clearInterval(this.tickTimer);
        
        if (this.gameSpeed === 0) {
            this.tickInterval = 1000; // Still update UI when paused, but no game changes
        } else if (this.gameSpeed === 1) {
            this.tickInterval = 1000; // Normal speed: 1 second per tick
        } else if (this.gameSpeed === 2) {
            this.tickInterval = 500; // Fast speed: 0.5 seconds per tick
        }
        
        this.tickTimer = setInterval(() => this.tick(), this.tickInterval);
    }
    
    updateEnvironment(dayFraction) {
        // Update day counter
        this.environment.daysPassed += dayFraction;
        
        // Update season (each season lasts 90 days)
        const yearDay = this.environment.daysPassed % 360;
        if (yearDay < 90) {
            this.environment.season = SEASONS.SPRING;
        } else if (yearDay < 180) {
            this.environment.season = SEASONS.SUMMER;
        } else if (yearDay < 270) {
            this.environment.season = SEASONS.AUTUMN;
        } else {
            this.environment.season = SEASONS.WINTER;
        }
        
        // Update temperature based on season
        this.updateTemperature();
        
        // Update weather (changes every few days)
        if (Math.random() < 0.05 * dayFraction) {
            this.updateWeather();
        }
        
        // Update day length based on season
        this.updateDayLength();
    }
    
    updateTemperature() {
        const baseTemp = {
            [SEASONS.SPRING]: 15,
            [SEASONS.SUMMER]: 25,
            [SEASONS.AUTUMN]: 15,
            [SEASONS.WINTER]: 5
        }[this.environment.season];
        
        // Add random variation (+/- 5 degrees)
        const variation = (Math.random() * 10) - 5;
        
        // Weather effects
        const weatherEffect = {
            [WEATHER_CONDITIONS.CLEAR]: 2,
            [WEATHER_CONDITIONS.CLOUDY]: 0,
            [WEATHER_CONDITIONS.RAINY]: -3,
            [WEATHER_CONDITIONS.STORMY]: -5,
            [WEATHER_CONDITIONS.SNOWY]: -8,
            [WEATHER_CONDITIONS.DRY]: 4
        }[this.environment.weather];
        
        this.environment.temperature = baseTemp + variation + weatherEffect;
        
        // Temperature affects rainfall
        if (this.environment.weather === WEATHER_CONDITIONS.RAINY || 
            this.environment.weather === WEATHER_CONDITIONS.STORMY) {
            this.environment.rainfall = Math.max(5, 15 - (this.environment.temperature / 5));
        } else if (this.environment.weather === WEATHER_CONDITIONS.SNOWY) {
            this.environment.rainfall = 0; // Snow, not rain
        } else {
            this.environment.rainfall = 0;
        }
    }
    
    updateWeather() {
        const season = this.environment.season;
        const currentWeather = this.environment.weather;
        
        // Different weather probabilities by season
        const weatherProbabilities = {
            [SEASONS.SPRING]: {
                [WEATHER_CONDITIONS.CLEAR]: 0.3,
                [WEATHER_CONDITIONS.CLOUDY]: 0.3,
                [WEATHER_CONDITIONS.RAINY]: 0.3,
                [WEATHER_CONDITIONS.STORMY]: 0.1,
                [WEATHER_CONDITIONS.SNOWY]: 0,
                [WEATHER_CONDITIONS.DRY]: 0
            },
            [SEASONS.SUMMER]: {
                [WEATHER_CONDITIONS.CLEAR]: 0.4,
                [WEATHER_CONDITIONS.CLOUDY]: 0.2,
                [WEATHER_CONDITIONS.RAINY]: 0.1,
                [WEATHER_CONDITIONS.STORMY]: 0.1,
                [WEATHER_CONDITIONS.SNOWY]: 0,
                [WEATHER_CONDITIONS.DRY]: 0.2
            },
            [SEASONS.AUTUMN]: {
                [WEATHER_CONDITIONS.CLEAR]: 0.2,
                [WEATHER_CONDITIONS.CLOUDY]: 0.3,
                [WEATHER_CONDITIONS.RAINY]: 0.3,
                [WEATHER_CONDITIONS.STORMY]: 0.2,
                [WEATHER_CONDITIONS.SNOWY]: 0,
                [WEATHER_CONDITIONS.DRY]: 0
            },
            [SEASONS.WINTER]: {
                [WEATHER_CONDITIONS.CLEAR]: 0.3,
                [WEATHER_CONDITIONS.CLOUDY]: 0.2,
                [WEATHER_CONDITIONS.RAINY]: 0.1,
                [WEATHER_CONDITIONS.STORMY]: 0.1,
                [WEATHER_CONDITIONS.SNOWY]: 0.3,
                [WEATHER_CONDITIONS.DRY]: 0
            }
        };
        
        // Weighted random selection
        const rand = Math.random();
        let cumulativeProbability = 0;
        let newWeather = currentWeather;
        
        for (const [weather, probability] of Object.entries(weatherProbabilities[season])) {
            cumulativeProbability += probability;
            if (rand < cumulativeProbability) {
                newWeather = weather;
                break;
            }
        }
        
        // Only update and log if weather actually changes
        if (newWeather !== currentWeather) {
            this.environment.weather = newWeather;
            EventLogger.addEvent(`Weather changed to ${newWeather}.`);
        }
    }
    
    updateDayLength() {
        // Day length varies by season
        const baseDayLength = {
            [SEASONS.SPRING]: 12,
            [SEASONS.SUMMER]: 14,
            [SEASONS.AUTUMN]: 10,
            [SEASONS.WINTER]: 8
        }[this.environment.season];
        
        // Small random variation (+/- 0.5 hours)
        const variation = (Math.random() - 0.5);
        
        this.environment.dayLength = baseDayLength + variation;
    }
    
    saveGame() {
        const gameData = GameStorage.sanitizeDataForStorage(this);
        const saved = GameStorage.saveGame(gameData);
        
        if (saved) {
            EventLogger.addEvent('Game saved.');
        } else {
            EventLogger.addEvent('Failed to save game.', 'error');
        }
    }
    
    loadGame() {
        if (GameStorage.hasExistingSave()) {
            const savedData = GameStorage.loadGame();
            
            if (savedData) {
                GameStorage.restoreGameInstance(this, savedData);
                return true;
            }
        }
        
        // No save found or load failed, initialize new game
        EventLogger.addEvent('Starting a new settlement simulation.');
        return false;
    }
    
    resetGame() {
        // Clear saved game
        GameStorage.clearSavedGame();
        
        // Reload the page to start fresh
        window.location.reload();
    }
}

// Initialize the game when everything is fully loaded
window.addEventListener('load', () => {
    console.log('Window loaded, initializing game...');
    
    // Check for canvas support
    const canvasSupport = () => {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext && canvas.getContext('2d'));
    };
    
    // Verify DOM elements and create if missing
    const verifyPrerequisites = () => {
        let gameContainer = document.getElementById('game-container');
        if (!gameContainer) {
            console.warn('Game container not found in the DOM, creating one');
            gameContainer = document.createElement('div');
            gameContainer.id = 'game-container';
            document.body.appendChild(gameContainer);
        }
        
        let gameArea = document.getElementById('game-area');
        if (!gameArea) {
            console.warn('Game area not found in the DOM, creating one');
            gameArea = document.createElement('div');
            gameArea.id = 'game-area';
            gameContainer.appendChild(gameArea);
        }
        
        // Create canvas ahead of time
        let canvas = document.getElementById('game-canvas');
        if (!canvas) {
            console.warn('Canvas not found in the DOM, creating one');
            canvas = document.createElement('canvas');
            canvas.id = 'game-canvas';
            canvas.width = 800;  // Default size
            canvas.height = 600; // Default size
            gameArea.appendChild(canvas);
        }
        
        if (!canvasSupport()) {
            throw new Error('Canvas is not supported in this browser');
        }
        
        // Force layout update
        document.body.offsetHeight;
        
        return true;
    };
    
    // Make sure DOM elements are ready - use a longer delay
    setTimeout(() => {
        try {
            // First create/verify DOM structure
            verifyPrerequisites();
            
            // Add some pre-initialization debug info
            console.log('DOM elements verified, starting initialization');
            console.log('Canvas ready:', !!document.getElementById('game-canvas'));
            
            // Initialize event logger
            EventLogger.addEvent('Welcome to Evolution Simulation!');
            
            // Start the game
            const game = new Game();
            console.log('Game initialized successfully');
            
        } catch (error) {
            console.error('Error initializing game:', error);
            
            try {
                EventLogger.logError(error, 'Game Initialization');
            } catch (e) {
                console.warn('EventLogger not available for error logging', e);
            }
            
            // Add error to page for visibility
            const errorElement = document.createElement('div');
            errorElement.style.color = 'red';
            errorElement.style.background = '#ffeeee';
            errorElement.style.padding = '20px';
            errorElement.style.margin = '20px';
            errorElement.style.border = '1px solid #ff0000';
            errorElement.style.borderRadius = '5px';
            errorElement.innerHTML = `
                <h3>Game Initialization Error</h3>
                <p>${error.message}</p>
                <p>Please try refreshing the page. If the problem persists, check your browser console for more details.</p>
            `;
            document.body.prepend(errorElement);
        }
    }, 500); // Longer delay to ensure DOM is fully ready
});