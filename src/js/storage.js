// Game data storage handling with sessionStorage
class GameStorage {
    static STORAGE_KEY = 'evolution_simulation_data';
    
    static saveGame(gameData) {
        try {
            const gameState = JSON.stringify(gameData);
            sessionStorage.setItem(this.STORAGE_KEY, gameState);
            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }
    
    static loadGame() {
        try {
            const gameState = sessionStorage.getItem(this.STORAGE_KEY);
            if (!gameState) {
                console.log('No saved game found');
                return null;
            }
            
            const gameData = JSON.parse(gameState);
            console.log('Game loaded successfully');
            return gameData;
        } catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    }
    
    static clearSavedGame() {
        try {
            sessionStorage.removeItem(this.STORAGE_KEY);
            console.log('Saved game cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear saved game:', error);
            return false;
        }
    }
    
    static hasExistingSave() {
        return sessionStorage.getItem(this.STORAGE_KEY) !== null;
    }
    
    // Helper function to sanitize data for storage
    static sanitizeDataForStorage(gameInstance) {
        // Create a deep copy of the game state that can be safely serialized
        const gameData = {
            environment: { ...gameInstance.environment },
            
            ecosystem: {
                plants: { ...gameInstance.ecosystem.plants },
                animals: { ...gameInstance.ecosystem.animals },
                minerals: { ...gameInstance.ecosystem.minerals },
                soilFertility: gameInstance.ecosystem.soilFertility,
                waterAvailability: gameInstance.ecosystem.waterAvailability
            },
            
            settlement: {
                population: {
                    total: gameInstance.settlement.population.total,
                    growth: gameInstance.settlement.population.growth,
                    deathRate: gameInstance.settlement.population.deathRate,
                    foodConsumptionPerDay: gameInstance.settlement.population.foodConsumptionPerDay,
                    waterConsumptionPerDay: gameInstance.settlement.population.waterConsumptionPerDay,
                    groups: { ...gameInstance.settlement.population.groups }
                },
                resources: { ...gameInstance.settlement.resources },
                stats: { ...gameInstance.settlement.stats },
                activityPreferences: { ...gameInstance.settlement.activityPreferences },
                buildingProgress: { ...gameInstance.settlement.buildingProgress },
                successRates: { ...gameInstance.settlement.successRates }
            },
            
            technologies: {
                discovered: Array.from(gameInstance.settlement.discoveredTechnologies),
                inProgress: Array.from(gameInstance.settlement.inProgressTechnologies),
                techTree: JSON.parse(JSON.stringify(technologyTree)) // Deep copy tech tree with current progress
            },
            
            gameSpeed: gameInstance.gameSpeed,
            tickInterval: gameInstance.tickInterval,
            eventLog: EventLogger.eventLog.slice(0, 20) // Save the most recent 20 events only
        };
        
        return gameData;
    }
    
    // Restore game instance from saved data
    static restoreGameInstance(gameInstance, savedData) {
        // Restore environment
        Object.assign(gameInstance.environment, savedData.environment);
        
        // Restore ecosystem
        Object.assign(gameInstance.ecosystem.plants, savedData.ecosystem.plants);
        Object.assign(gameInstance.ecosystem.animals, savedData.ecosystem.animals);
        Object.assign(gameInstance.ecosystem.minerals, savedData.ecosystem.minerals);
        gameInstance.ecosystem.soilFertility = savedData.ecosystem.soilFertility;
        gameInstance.ecosystem.waterAvailability = savedData.ecosystem.waterAvailability;
        
        // Restore settlement
        gameInstance.settlement.population.total = savedData.settlement.population.total;
        gameInstance.settlement.population.growth = savedData.settlement.population.growth;
        gameInstance.settlement.population.deathRate = savedData.settlement.population.deathRate;
        gameInstance.settlement.population.foodConsumptionPerDay = savedData.settlement.population.foodConsumptionPerDay;
        gameInstance.settlement.population.waterConsumptionPerDay = savedData.settlement.population.waterConsumptionPerDay;
        Object.assign(gameInstance.settlement.population.groups, savedData.settlement.population.groups);
        
        Object.assign(gameInstance.settlement.resources, savedData.settlement.resources);
        Object.assign(gameInstance.settlement.stats, savedData.settlement.stats);
        Object.assign(gameInstance.settlement.activityPreferences, savedData.settlement.activityPreferences);
        Object.assign(gameInstance.settlement.buildingProgress, savedData.settlement.buildingProgress);
        Object.assign(gameInstance.settlement.successRates, savedData.settlement.successRates);
        
        // Restore technologies
        gameInstance.settlement.discoveredTechnologies = new Set(savedData.technologies.discovered);
        gameInstance.settlement.inProgressTechnologies = new Set(savedData.technologies.inProgress);
        
        // Restore tech tree state
        for (const techId in technologyTree) {
            const savedTech = savedData.technologies.techTree[techId];
            if (savedTech) {
                technologyTree[techId].discovered = savedTech.discovered;
                technologyTree[techId].inProgress = savedTech.inProgress;
                technologyTree[techId].progressPercent = savedTech.progressPercent;
            }
        }
        
        // Restore game settings
        gameInstance.gameSpeed = savedData.gameSpeed;
        gameInstance.updateTickInterval();
        
        // Restore event log
        EventLogger.eventLog = savedData.eventLog || [];
        EventLogger.updateEventLogUI();
        
        // Sync renderer with restored game state
        if (gameInstance.renderer) {
            gameInstance.renderer.initializeEntities();
            gameInstance.renderer.syncWithGameState();
        }
        
        EventLogger.addEvent('Game loaded from saved state.');
    }
}

// Make GameStorage available globally
window.GameStorage = GameStorage;