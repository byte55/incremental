// Ecosystem simulation
class Ecosystem {
    constructor() {
        this.plants = {
            growth: 0,
            quantity: 100,
            diversity: 5,
            growthRate: 0.05
        };
        
        this.animals = {
            population: 50,
            diversity: 3,
            reproductionRate: 0.02,
            migrationChance: 0.1
        };
        
        this.minerals = {
            availableSurface: 100,
            hiddenDeposits: 500,
            erosionRate: 0.01
        };
        
        this.soilFertility = 0.7; // 0-1 scale
        this.waterAvailability = 0.8; // 0-1 scale
    }
    
    update(environment, gameSpeed) {
        // Apply seasonal effects
        this.applySeasonalEffects(environment);
        
        // Update plants
        this.updatePlants(environment, gameSpeed);
        
        // Update animals
        this.updateAnimals(environment, gameSpeed);
        
        // Update minerals
        this.updateMinerals(environment, gameSpeed);
        
        // Handle environmental events
        this.handleEnvironmentalEvents(environment);
    }
    
    applySeasonalEffects(environment) {
        switch(environment.season) {
            case SEASONS.SPRING:
                this.plants.growthRate = 0.08;
                this.animals.reproductionRate = 0.04;
                this.waterAvailability = 0.9;
                break;
            case SEASONS.SUMMER:
                this.plants.growthRate = 0.05;
                this.animals.reproductionRate = 0.02;
                this.waterAvailability = 0.6;
                break;
            case SEASONS.AUTUMN:
                this.plants.growthRate = 0.03;
                this.animals.reproductionRate = 0.01;
                this.waterAvailability = 0.7;
                break;
            case SEASONS.WINTER:
                this.plants.growthRate = 0.01;
                this.animals.reproductionRate = 0.005;
                this.waterAvailability = 0.8;
                this.animals.migrationChance = 0.2;
                break;
        }
        
        // Weather effects
        if (environment.weather === WEATHER_CONDITIONS.RAINY) {
            this.waterAvailability = Math.min(1, this.waterAvailability + 0.2);
            this.plants.growthRate += 0.02;
        } else if (environment.weather === WEATHER_CONDITIONS.DRY) {
            this.waterAvailability = Math.max(0.2, this.waterAvailability - 0.1);
            this.plants.growthRate -= 0.02;
        } else if (environment.weather === WEATHER_CONDITIONS.STORMY) {
            this.animals.migrationChance += 0.1;
        }
    }
    
    updatePlants(environment, gameSpeed) {
        // Calculate growth based on conditions
        const growthModifier = this.soilFertility * this.waterAvailability * (environment.temperature / 20);
        const dailyGrowth = this.plants.growthRate * growthModifier * gameSpeed;
        
        this.plants.growth += dailyGrowth;
        
        // Convert growth into new plants when threshold reached
        if (this.plants.growth >= 1) {
            const newPlants = Math.floor(this.plants.growth);
            this.plants.quantity += newPlants;
            this.plants.growth -= newPlants;
            
            // Add random variation to plant diversity over time
            if (Math.random() < 0.01 * gameSpeed) {
                this.plants.diversity += Math.random() < 0.5 ? 1 : -1;
                this.plants.diversity = Math.max(1, Math.min(10, this.plants.diversity));
            }
        }
    }
    
    updateAnimals(environment, gameSpeed) {
        // Animal reproduction
        const reproductionAmount = this.animals.population * this.animals.reproductionRate * gameSpeed;
        this.animals.population += Math.floor(reproductionAmount);
        
        // Animal migration
        if (Math.random() < this.animals.migrationChance * gameSpeed) {
            // Random migration effect on population
            const migrationEffect = Math.floor((Math.random() - 0.5) * 10 * gameSpeed);
            this.animals.population = Math.max(5, this.animals.population + migrationEffect);
            
            if (migrationEffect > 0) {
                EventLogger.addEvent(`A group of ${migrationEffect} animals migrated into the area.`);
            } else if (migrationEffect < 0) {
                EventLogger.addEvent(`A group of ${Math.abs(migrationEffect)} animals migrated away from the area.`);
            }
        }
        
        // Natural predation and balance
        if (this.animals.population > 100) {
            const reduction = Math.floor((this.animals.population - 100) * 0.1 * gameSpeed);
            this.animals.population -= reduction;
        }
    }
    
    updateMinerals(environment, gameSpeed) {
        // Erosion exposes new surface minerals
        const erosionAmount = this.minerals.hiddenDeposits * this.minerals.erosionRate * gameSpeed;
        if (erosionAmount > 0.1) {
            const exposedMinerals = Math.floor(erosionAmount);
            this.minerals.availableSurface += exposedMinerals;
            this.minerals.hiddenDeposits -= exposedMinerals;
            
            if (exposedMinerals > 5) {
                EventLogger.addEvent(`Erosion has exposed new mineral deposits.`);
            }
        }
    }
    
    handleEnvironmentalEvents(environment) {
        // Random environmental events
        if (Math.random() < 0.01) {
            if (environment.weather === WEATHER_CONDITIONS.DRY && environment.temperature > 25) {
                // Fire event
                this.plants.quantity = Math.floor(this.plants.quantity * 0.8);
                EventLogger.addEvent('A wildfire has reduced the plant population!');
            } else if (environment.weather === WEATHER_CONDITIONS.RAINY && environment.rainfall > 20) {
                // Flood event
                this.animals.population = Math.floor(this.animals.population * 0.9);
                EventLogger.addEvent('A flood has affected the animal population!');
            }
        }
    }
    
    // Methods to gather resources from the ecosystem
    gatherPlants(efficiency, amount) {
        const maxGatherable = Math.min(this.plants.quantity * 0.2, amount);
        const gathered = Math.floor(maxGatherable * efficiency);
        
        if (gathered > 0) {
            this.plants.quantity -= gathered;
        }
        
        return gathered;
    }
    
    huntAnimals(huntingSuccess, amount) {
        const maxHuntable = Math.min(this.animals.population * 0.1, amount);
        const hunted = Math.floor(maxHuntable * huntingSuccess);
        
        if (hunted > 0) {
            this.animals.population -= hunted;
        }
        
        return {
            food: hunted * 5,
            animalHide: Math.floor(hunted * 0.7)
        };
    }
    
    gatherMinerals(efficiency, amount) {
        const maxGatherable = Math.min(this.minerals.availableSurface, amount);
        const gathered = Math.floor(maxGatherable * efficiency);
        
        if (gathered > 0) {
            this.minerals.availableSurface -= gathered;
        }
        
        return gathered;
    }
}