// Settlement simulation and AI decision making
class Settlement {
    constructor() {
        this.population = { 
            ...JSON.parse(JSON.stringify(initialPopulation))
        };
        
        this.resources = { 
            ...JSON.parse(JSON.stringify(initialResources))
        };
        
        this.stats = {
            happiness: 50,
            health: 75,
            knowledgeLevel: 10,
            efficiency: 1.0
        };
        
        this.activityPreferences = {
            gathering: 0.5,
            hunting: 0.3,
            building: 0.1,
            researching: 0.1
        };
        
        this.buildingProgress = {
            shelter: 0,
            storageArea: 0,
            craftingArea: 0,
            researchArea: 0
        };
        
        this.discoveredTechnologies = new Set();
        this.inProgressTechnologies = new Set();
        
        // Learning system
        this.successRates = {
            gathering: 0.6,
            hunting: 0.4,
            research: 0.3,
            building: 0.5
        };
    }
    
    update(ecosystem, environment, gameSpeed) {
        // Consume resources
        this.consumeResources(gameSpeed);
        
        // Assign population to activities based on current needs and preferences
        this.assignPopulation();
        
        // Perform activities
        this.performGathering(ecosystem, gameSpeed);
        this.performHunting(ecosystem, gameSpeed);
        this.performBuilding(gameSpeed);
        this.performResearch(gameSpeed);
        
        // Update population
        this.updatePopulation(environment, gameSpeed);
        
        // Update AI learning
        this.updateLearning();
        
        // Check for critical resource shortages
        this.checkResourceShortages();
    }
    
    consumeResources(gameSpeed) {
        // Daily consumption of food and water
        const foodConsumed = this.population.total * this.population.foodConsumptionPerDay * gameSpeed;
        const waterConsumed = this.population.total * this.population.waterConsumptionPerDay * gameSpeed;
        
        // Update resources
        this.resources[RESOURCE_TYPES.FOOD] = Math.max(0, this.resources[RESOURCE_TYPES.FOOD] - foodConsumed);
        this.resources[RESOURCE_TYPES.WATER] = Math.max(0, this.resources[RESOURCE_TYPES.WATER] - waterConsumed);
        
        // Calculate shortages
        const foodShortage = Math.max(0, foodConsumed - this.resources[RESOURCE_TYPES.FOOD]);
        const waterShortage = Math.max(0, waterConsumed - this.resources[RESOURCE_TYPES.WATER]);
        
        // Apply health effects of shortages
        if (foodShortage > 0 || waterShortage > 0) {
            this.stats.health -= (foodShortage * 0.2 + waterShortage * 0.3) * gameSpeed;
            this.stats.happiness -= (foodShortage * 0.3 + waterShortage * 0.4) * gameSpeed;
            
            // Clamp values
            this.stats.health = Math.max(0, Math.min(100, this.stats.health));
            this.stats.happiness = Math.max(0, Math.min(100, this.stats.happiness));
        }
    }
    
    assignPopulation() {
        // Calculate need factors based on current resources and stats
        const foodNeed = Math.max(0, 1 - (this.resources[RESOURCE_TYPES.FOOD] / (this.population.total * 10)));
        const waterNeed = Math.max(0, 1 - (this.resources[RESOURCE_TYPES.WATER] / (this.population.total * 15)));
        const buildingNeed = Math.max(0, 0.5 - (this.getAverageBuildingProgress() / 2));
        const researchNeed = this.calculateResearchNeed();
        
        // Combine needs with preferences, adjusted by past success rates
        const gatheringWeight = (foodNeed * 0.7 + this.activityPreferences.gathering * 0.3) * this.successRates.gathering;
        const huntingWeight = (foodNeed * 0.6 + this.activityPreferences.hunting * 0.4) * this.successRates.hunting;
        const buildingWeight = (buildingNeed * 0.6 + this.activityPreferences.building * 0.4) * this.successRates.building;
        const researchWeight = (researchNeed * 0.5 + this.activityPreferences.researching * 0.5) * this.successRates.research;
        
        // Calculate total weight
        const totalWeight = gatheringWeight + huntingWeight + buildingWeight + researchWeight;
        
        // Calculate ideal distribution
        const totalPopulation = this.population.total;
        const idealGatherers = Math.floor((gatheringWeight / totalWeight) * totalPopulation);
        const idealHunters = Math.floor((huntingWeight / totalWeight) * totalPopulation);
        const idealBuilders = Math.floor((buildingWeight / totalWeight) * totalPopulation);
        const idealResearchers = totalPopulation - idealGatherers - idealHunters - idealBuilders;
        
        // Update population groups
        this.population.groups.gatherers = idealGatherers;
        this.population.groups.hunters = idealHunters;
        this.population.groups.builders = idealBuilders;
        this.population.groups.researchers = idealResearchers;
    }
    
    performGathering(ecosystem, gameSpeed) {
        const gatheringEfficiency = this.calculateGatheringEfficiency();
        const gatheringPower = this.population.groups.gatherers * gatheringEfficiency * gameSpeed;
        
        // Gather plants for food
        const plantFoodGathered = ecosystem.gatherPlants(gatheringEfficiency, gatheringPower * 0.6);
        this.resources[RESOURCE_TYPES.FOOD] += plantFoodGathered;
        
        // Gather plant fibers
        const plantFibersGathered = Math.floor(plantFoodGathered * 0.2);
        this.resources[RESOURCE_TYPES.PLANT_FIBER] += plantFibersGathered;
        
        // Gather water
        const waterGathered = Math.floor(gatheringPower * 0.4 * ecosystem.waterAvailability);
        this.resources[RESOURCE_TYPES.WATER] += waterGathered;
        
        // Gather wood
        const woodGathered = Math.floor(gatheringPower * 0.3);
        this.resources[RESOURCE_TYPES.WOOD] += woodGathered;
        
        // Gather clay if discovered
        if (Math.random() < 0.05 * gameSpeed && (gatheringPower > 10)) {
            const clayGathered = Math.floor(Math.random() * 5) * gameSpeed;
            this.resources[RESOURCE_TYPES.CLAY] += clayGathered;
            if (clayGathered > 0 && this.resources[RESOURCE_TYPES.CLAY] <= clayGathered) {
                EventLogger.addEvent('Gatherers discovered clay deposits.');
            }
        }
        
        // Update success rate based on results
        this.successRates.gathering = this.updateSuccessRate(
            this.successRates.gathering,
            (plantFoodGathered + waterGathered) / (gatheringPower + 0.1),
            0.01 * gameSpeed
        );
    }
    
    performHunting(ecosystem, gameSpeed) {
        const huntingEfficiency = this.calculateHuntingEfficiency();
        const huntingPower = this.population.groups.hunters * huntingEfficiency * gameSpeed;
        
        // Hunt animals
        const huntResults = ecosystem.huntAnimals(huntingEfficiency, huntingPower);
        
        // Add resources from hunting
        this.resources[RESOURCE_TYPES.FOOD] += huntResults.food;
        this.resources[RESOURCE_TYPES.ANIMAL_HIDE] += huntResults.animalHide;
        
        // Gather stones during hunting
        const stoneGathered = Math.floor(huntingPower * 0.1);
        this.resources[RESOURCE_TYPES.STONE] += stoneGathered;
        
        // Occasional metal ore discovery while hunting
        if (Math.random() < 0.03 * gameSpeed && huntingPower > 5) {
            const oreGathered = Math.floor(Math.random() * 3) * gameSpeed;
            this.resources[RESOURCE_TYPES.METAL_ORE] += oreGathered;
            if (oreGathered > 0 && this.resources[RESOURCE_TYPES.METAL_ORE] <= oreGathered) {
                EventLogger.addEvent('Hunters discovered strange heavy stones (metal ore).');
            }
        }
        
        // Update success rate based on results
        this.successRates.hunting = this.updateSuccessRate(
            this.successRates.hunting,
            huntResults.food / (huntingPower * 10 + 0.1),
            0.01 * gameSpeed
        );
    }
    
    performBuilding(gameSpeed) {
        const buildingEfficiency = this.calculateBuildingEfficiency();
        const buildingPower = this.population.groups.builders * buildingEfficiency * gameSpeed;
        
        // Distribute building power among different buildings
        const shelterPriority = 1 - (this.buildingProgress.shelter / 100);
        const storagePriority = 1 - (this.buildingProgress.storageArea / 100);
        const craftingPriority = 1 - (this.buildingProgress.craftingArea / 100);
        const researchPriority = 1 - (this.buildingProgress.researchArea / 100);
        
        const totalPriority = shelterPriority + storagePriority + craftingPriority + researchPriority;
        
        // Calculate building progress increments
        let shelterIncrement = (shelterPriority / totalPriority) * buildingPower;
        let storageIncrement = (storagePriority / totalPriority) * buildingPower;
        let craftingIncrement = (craftingPriority / totalPriority) * buildingPower;
        let researchIncrement = (researchPriority / totalPriority) * buildingPower;
        
        // Use resources for building
        const resourceUsage = Math.min(
            this.resources[RESOURCE_TYPES.WOOD],
            Math.floor(buildingPower * 0.5)
        );
        
        this.resources[RESOURCE_TYPES.WOOD] -= resourceUsage;
        
        // If not enough resources, reduce efficiency
        if (resourceUsage < buildingPower * 0.5) {
            const reduction = resourceUsage / (buildingPower * 0.5);
            shelterIncrement *= reduction;
            storageIncrement *= reduction;
            craftingIncrement *= reduction;
            researchIncrement *= reduction;
        }
        
        // Update building progress
        this.buildingProgress.shelter = Math.min(100, this.buildingProgress.shelter + shelterIncrement);
        this.buildingProgress.storageArea = Math.min(100, this.buildingProgress.storageArea + storageIncrement);
        this.buildingProgress.craftingArea = Math.min(100, this.buildingProgress.craftingArea + craftingIncrement);
        this.buildingProgress.researchArea = Math.min(100, this.buildingProgress.researchArea + researchIncrement);
        
        // Complete building milestones
        this.checkBuildingMilestones();
        
        // Update success rate
        this.successRates.building = this.updateSuccessRate(
            this.successRates.building,
            resourceUsage / (buildingPower + 0.1),
            0.01 * gameSpeed
        );
    }
    
    performResearch(gameSpeed) {
        const researchEfficiency = this.calculateResearchEfficiency();
        const researchPower = this.population.groups.researchers * researchEfficiency * gameSpeed;
        
        // If no research is being done, return
        if (researchPower <= 0) return;
        
        // Select technologies to research
        this.selectTechnologiesToResearch();
        
        // Distribute research power among in-progress technologies
        const inProgressTechs = Array.from(this.inProgressTechnologies);
        if (inProgressTechs.length === 0) return;
        
        const researchPerTech = researchPower / inProgressTechs.length;
        
        // Apply research progress
        for (const techId of inProgressTechs) {
            const tech = technologyTree[techId];
            
            // Check if we have the resources for research
            let canResearch = true;
            const resourceCost = {};
            
            for (const [resource, amount] of Object.entries(tech.resourceCost)) {
                const resourceNeeded = Math.floor((amount / tech.timeToDiscover) * gameSpeed);
                
                if (this.resources[resource] < resourceNeeded) {
                    canResearch = false;
                    break;
                }
                
                resourceCost[resource] = resourceNeeded;
            }
            
            if (canResearch) {
                // Consume resources
                for (const [resource, amount] of Object.entries(resourceCost)) {
                    this.resources[resource] -= amount;
                }
                
                // Progress research
                tech.progressPercent += (researchPerTech / tech.timeToDiscover) * 100;
                
                // Check for completion
                if (tech.progressPercent >= 100) {
                    tech.discovered = true;
                    tech.inProgress = false;
                    this.discoveredTechnologies.add(techId);
                    this.inProgressTechnologies.delete(techId);
                    
                    EventLogger.addEvent(`Technology discovered: ${tech.name}`);
                    
                    // Check for eureka moments
                    if (tech.eureka && Math.random() < tech.discoveryChance) {
                        EventLogger.addEvent(`EUREKA! ${tech.eureka.name}: ${tech.eureka.description}`, 'eureka');
                        
                        // Apply eureka effects
                        // This would modify various aspects of the settlement
                    }
                }
            }
        }
        
        // Update success rate
        this.successRates.research = this.updateSuccessRate(
            this.successRates.research,
            this.inProgressTechnologies.size > 0 ? 0.5 : 0,
            0.005 * gameSpeed
        );
    }
    
    updatePopulation(environment, gameSpeed) {
        // Base growth rate
        let growthRate = 0.001 * gameSpeed;
        
        // Modify based on food, water, and health
        const foodFactor = Math.min(1, this.resources[RESOURCE_TYPES.FOOD] / (this.population.total * 5));
        const waterFactor = Math.min(1, this.resources[RESOURCE_TYPES.WATER] / (this.population.total * 7));
        const healthFactor = this.stats.health / 100;
        
        growthRate *= foodFactor * waterFactor * healthFactor;
        
        // Seasonal adjustments
        if (environment.season === SEASONS.SPRING) {
            growthRate *= 1.2;
        } else if (environment.season === SEASONS.WINTER) {
            growthRate *= 0.8;
        }
        
        // Calculate growth
        const populationGrowth = this.population.total * growthRate;
        
        // Calculate death rate based on health and resources
        let deathRate = 0.0005 * gameSpeed;
        
        if (this.stats.health < 50) {
            deathRate += (50 - this.stats.health) * 0.0001 * gameSpeed;
        }
        
        if (foodFactor < 0.5 || waterFactor < 0.5) {
            deathRate += 0.001 * gameSpeed;
        }
        
        // Calculate deaths
        const populationDeaths = this.population.total * deathRate;
        
        // Update population
        const netChange = Math.floor(populationGrowth - populationDeaths);
        this.population.total = Math.max(1, this.population.total + netChange);
        
        // Update growth stats
        this.population.growth = netChange;
        this.population.deathRate = deathRate;
    }
    
    updateLearning() {
        // Update activity preferences based on success rates
        this.activityPreferences.gathering = this.activityPreferences.gathering * 0.95 + this.successRates.gathering * 0.05;
        this.activityPreferences.hunting = this.activityPreferences.hunting * 0.95 + this.successRates.hunting * 0.05;
        this.activityPreferences.building = this.activityPreferences.building * 0.95 + this.successRates.building * 0.05;
        this.activityPreferences.researching = this.activityPreferences.researching * 0.95 + this.successRates.research * 0.05;
        
        // Normalize preferences
        const totalPreference = this.activityPreferences.gathering + 
                               this.activityPreferences.hunting + 
                               this.activityPreferences.building + 
                               this.activityPreferences.researching;
                               
        this.activityPreferences.gathering /= totalPreference;
        this.activityPreferences.hunting /= totalPreference;
        this.activityPreferences.building /= totalPreference;
        this.activityPreferences.researching /= totalPreference;
        
        // Adjust efficiency based on knowledge level
        this.stats.efficiency = 1.0 + (this.stats.knowledgeLevel / 100);
        
        // Increase knowledge over time based on research
        this.stats.knowledgeLevel += this.population.groups.researchers * 0.01;
        this.stats.knowledgeLevel = Math.min(100, this.stats.knowledgeLevel);
    }
    
    checkResourceShortages() {
        const foodPerPerson = this.resources[RESOURCE_TYPES.FOOD] / this.population.total;
        const waterPerPerson = this.resources[RESOURCE_TYPES.WATER] / this.population.total;
        
        // Check for critical shortages
        if (foodPerPerson < 5) {
            EventLogger.addEvent('Food supplies are running critically low!');
            
            // Shift priorities to food gathering
            this.activityPreferences.gathering += 0.1;
            this.activityPreferences.hunting += 0.1;
            this.normalizePreferences();
        }
        
        if (waterPerPerson < 7) {
            EventLogger.addEvent('Water supplies are running critically low!');
            
            // Shift priorities to water gathering
            this.activityPreferences.gathering += 0.15;
            this.normalizePreferences();
        }
    }
    
    normalizePreferences() {
        const total = this.activityPreferences.gathering + 
                      this.activityPreferences.hunting + 
                      this.activityPreferences.building + 
                      this.activityPreferences.researching;
                      
        this.activityPreferences.gathering /= total;
        this.activityPreferences.hunting /= total;
        this.activityPreferences.building /= total;
        this.activityPreferences.researching /= total;
    }
    
    // Helper methods for calculations
    calculateGatheringEfficiency() {
        let efficiency = this.stats.efficiency;
        
        // Apply technology bonuses
        if (this.discoveredTechnologies.has('stoneTools')) {
            efficiency *= technologyTree.stoneTools.effects.gatheringEfficiency;
        }
        
        if (this.discoveredTechnologies.has('woodenTools')) {
            efficiency *= technologyTree.woodenTools.effects.woodGatheringRate;
        }
        
        if (this.discoveredTechnologies.has('combinedTools')) {
            efficiency *= technologyTree.combinedTools.effects.gatheringEfficiency;
        }
        
        return efficiency;
    }
    
    calculateHuntingEfficiency() {
        let efficiency = this.stats.efficiency;
        
        // Apply technology bonuses
        if (this.discoveredTechnologies.has('stoneTools')) {
            efficiency *= 1.2;
        }
        
        if (this.discoveredTechnologies.has('combinedTools')) {
            efficiency *= technologyTree.combinedTools.effects.huntingSuccess;
        }
        
        return efficiency;
    }
    
    calculateBuildingEfficiency() {
        let efficiency = this.stats.efficiency;
        
        // Apply technology bonuses
        if (this.discoveredTechnologies.has('stoneTools')) {
            efficiency *= 1.1;
        }
        
        if (this.discoveredTechnologies.has('woodenTools')) {
            efficiency *= 1.2;
        }
        
        return efficiency;
    }
    
    calculateResearchEfficiency() {
        let efficiency = this.stats.efficiency;
        
        // Research is more efficient with a research area
        if (this.buildingProgress.researchArea > 50) {
            efficiency *= 1 + (this.buildingProgress.researchArea / 200);
        }
        
        return efficiency;
    }
    
    updateSuccessRate(currentRate, outcome, learningRate) {
        return currentRate * (1 - learningRate) + outcome * learningRate;
    }
    
    getAverageBuildingProgress() {
        return (
            this.buildingProgress.shelter + 
            this.buildingProgress.storageArea + 
            this.buildingProgress.craftingArea + 
            this.buildingProgress.researchArea
        ) / 400; // 4 buildings, 100% each = 400 total
    }
    
    calculateResearchNeed() {
        // Higher priority for research if no technologies are discovered yet
        if (this.discoveredTechnologies.size === 0) {
            return 0.7;
        }
        
        // Research need decreases as more technologies are discovered
        return Math.max(0.1, 0.5 - (this.discoveredTechnologies.size * 0.05));
    }
    
    checkBuildingMilestones() {
        // Check for shelter completion
        if (this.buildingProgress.shelter >= 50 && this.buildingProgress.shelter < 51) {
            EventLogger.addEvent('Basic shelters constructed.');
            this.stats.health += 5;
            this.stats.happiness += 10;
        }
        
        // Check for storage completion
        if (this.buildingProgress.storageArea >= 50 && this.buildingProgress.storageArea < 51) {
            EventLogger.addEvent('Basic storage area constructed.');
            // Apply effect - increase resource capacity
        }
        
        // Check for crafting area completion
        if (this.buildingProgress.craftingArea >= 50 && this.buildingProgress.craftingArea < 51) {
            EventLogger.addEvent('Basic crafting area constructed.');
            // Apply effect - improve tool making
        }
        
        // Check for research area completion
        if (this.buildingProgress.researchArea >= 50 && this.buildingProgress.researchArea < 51) {
            EventLogger.addEvent('Basic research area constructed.');
            this.stats.knowledgeLevel += 5;
        }
    }
    
    selectTechnologiesToResearch() {
        // Check technologies that can be researched
        for (const [techId, tech] of Object.entries(technologyTree)) {
            // Skip if already discovered or in progress
            if (tech.discovered || tech.inProgress) continue;
            
            // Check if requirements are met
            let requirementsMet = true;
            for (const [reqTech, needed] of Object.entries(tech.requirements)) {
                if (needed && !this.discoveredTechnologies.has(reqTech)) {
                    requirementsMet = false;
                    break;
                }
            }
            
            // If requirements met, consider for research
            if (requirementsMet) {
                // Check if technology should be spontaneously discovered
                if (Math.random() < tech.discoveryChance * 0.01 && this.inProgressTechnologies.size < 2) {
                    tech.inProgress = true;
                    this.inProgressTechnologies.add(techId);
                    EventLogger.addEvent(`Started researching ${tech.name}`);
                }
            }
        }
    }
}

// Make Settlement available globally
window.Settlement = Settlement;