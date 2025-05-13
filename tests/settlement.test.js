/**
 * @jest-environment jsdom
 */

describe('Settlement', () => {
  let settlement;
  let mockEcosystem;
  let mockEnvironment;

  beforeEach(() => {
    // Define mock objects needed for tests
    global.initialPopulation = {
      total: 10,
      growth: 0,
      deathRate: 0,
      foodConsumptionPerDay: 2,
      waterConsumptionPerDay: 3,
      groups: {
        gatherers: 5,
        hunters: 3,
        builders: 2,
        researchers: 0
      }
    };

    global.initialResources = {
      food: 100,
      water: 100,
      wood: 50,
      stone: 20,
      plantFiber: 10,
      metalOre: 0,
      clay: 0,
      animalHide: 0
    };

    global.technologyTree = {
      stoneTools: {
        name: 'Stone Tools',
        phase: 'primitive',
        requirements: {},
        resourceCost: { stone: 10 },
        discoveryChance: 1.0,
        discovered: false,
        inProgress: false,
        progressPercent: 0,
        timeToDiscover: 10,
        effects: { gatheringEfficiency: 1.2 }
      },
      woodenTools: {
        name: 'Wooden Tools',
        phase: 'primitive',
        requirements: {},
        resourceCost: { wood: 10 },
        discoveryChance: 1.0,
        discovered: false,
        inProgress: false,
        progressPercent: 0,
        timeToDiscover: 10,
        effects: { woodGatheringRate: 1.2 }
      }
    };

    // Create mock ecosystem
    mockEcosystem = {
      gatherPlants: jest.fn((efficiency, amount) => Math.floor(amount * efficiency * 0.8)),
      huntAnimals: jest.fn((efficiency, amount) => ({
        food: Math.floor(amount * efficiency * 5),
        animalHide: Math.floor(amount * efficiency * 0.7)
      })),
      gatherMinerals: jest.fn((efficiency, amount) => Math.floor(amount * efficiency * 0.8)),
      waterAvailability: 0.8,
      plants: { quantity: 100 },
      animals: { population: 50 }
    };

    // Create mock environment
    mockEnvironment = {
      season: SEASONS.SPRING,
      temperature: 15,
      weather: WEATHER_CONDITIONS.CLEAR,
      daysPassed: 0
    };

    // Load the Settlement class
    require('../src/js/settlement');
    
    // Create settlement instance
    settlement = new Settlement();
  });

  test('should initialize with default values', () => {
    // Check population
    expect(settlement.population).toBeDefined();
    expect(settlement.population.total).toBe(initialPopulation.total);
    expect(settlement.population.groups).toEqual(initialPopulation.groups);

    // Check resources
    expect(settlement.resources).toBeDefined();
    Object.keys(initialResources).forEach(resource => {
      expect(settlement.resources[resource]).toBe(initialResources[resource]);
    });

    // Check stats
    expect(settlement.stats).toBeDefined();
    expect(settlement.stats.happiness).toBe(50);
    expect(settlement.stats.health).toBe(75);

    // Check technology sets
    expect(settlement.discoveredTechnologies).toBeInstanceOf(Set);
    expect(settlement.discoveredTechnologies.size).toBe(0);
    expect(settlement.inProgressTechnologies).toBeInstanceOf(Set);
    expect(settlement.inProgressTechnologies.size).toBe(0);
  });

  test('should consume resources based on population', () => {
    // Initial resources
    settlement.resources.food = 100;
    settlement.resources.water = 100;
    
    // Set population
    settlement.population.total = 10;
    settlement.population.foodConsumptionPerDay = 2;
    settlement.population.waterConsumptionPerDay = 3;
    
    // Consume resources (game speed of 1 day)
    settlement.consumeResources(1);
    
    // Expected consumed food: 10 population * 2 food/day * 1 day = 20
    // Expected consumed water: 10 population * 3 water/day * 1 day = 30
    expect(settlement.resources.food).toBe(80);
    expect(settlement.resources.water).toBe(70);
  });

  test('should assign population to activities based on needs', () => {
    // Set up conditions where food is scarce
    settlement.resources.food = 10; // Low food
    settlement.resources.water = 100; // Plenty of water
    
    // Assign population
    settlement.assignPopulation();
    
    // Check that more people were assigned to gathering/hunting due to food scarcity
    const foodRelatedWorkers = settlement.population.groups.gatherers + settlement.population.groups.hunters;
    expect(foodRelatedWorkers).toBeGreaterThan(5); // More than half the population
  });

  test('should gather resources from ecosystem', () => {
    // Setup
    settlement.population.groups.gatherers = 5;
    
    // Perform gathering
    settlement.performGathering(mockEcosystem, 1);
    
    // Check that ecosystem methods were called
    expect(mockEcosystem.gatherPlants).toHaveBeenCalled();
    
    // Check that resources increased
    expect(settlement.resources.food).toBeGreaterThan(initialResources.food);
  });

  test('should handle building construction', () => {
    // Setup
    settlement.population.groups.builders = 5;
    settlement.resources.wood = 100; // Plenty of wood for building
    
    // Initial building progress
    const initialShelterProgress = settlement.buildingProgress.shelter;
    
    // Perform building
    settlement.performBuilding(1);
    
    // Check that building progress increased
    expect(settlement.buildingProgress.shelter).toBeGreaterThan(initialShelterProgress);
    
    // Check that resources were consumed
    expect(settlement.resources.wood).toBeLessThan(100);
  });

  test('should update population based on resources and environment', () => {
    // Setup good conditions
    settlement.resources.food = 1000; // Plenty of food
    settlement.resources.water = 1000; // Plenty of water
    settlement.stats.health = 100; // Perfect health
    
    // Initial population
    const initialPopulation = settlement.population.total;
    
    // Update population with favorable conditions
    settlement.updatePopulation(mockEnvironment, 10); // 10 days to see clear growth
    
    // Population should grow under these conditions
    expect(settlement.population.total).toBeGreaterThan(initialPopulation);
  });

  test('should select technologies to research based on requirements', () => {
    // Make stone tools a prerequisite for wooden tools
    technologyTree.woodenTools.requirements = { stoneTools: true };
    
    // Attempt to select technologies to research
    settlement.selectTechnologiesToResearch();
    
    // Check which technologies are in progress
    const inProgressTechs = Array.from(settlement.inProgressTechnologies);
    
    // Some technology should be in progress (likely stoneTools)
    expect(inProgressTechs.length).toBeGreaterThan(0);
    
    // If stoneTools is in progress, wooden tools shouldn't be (due to requirements)
    if (inProgressTechs.includes('stoneTools')) {
      expect(inProgressTechs.includes('woodenTools')).toBe(false);
    }
  });
});