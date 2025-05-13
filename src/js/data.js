// Game data structures and initial values

// Resource types
const RESOURCE_TYPES = {
    FOOD: 'food',
    WATER: 'water',
    WOOD: 'wood',
    STONE: 'stone',
    PLANT_FIBER: 'plantFiber',
    METAL_ORE: 'metalOre',
    CLAY: 'clay',
    ANIMAL_HIDE: 'animalHide'
};

// Technology phases
const TECH_PHASES = {
    PRIMITIVE: 'primitive',
    ADVANCED: 'advanced'
};

// Ecosystem types
const ECOSYSTEM_TYPES = {
    PLANTS: 'plants',
    ANIMALS: 'animals',
    MINERALS: 'minerals'
};

// Weather conditions
const WEATHER_CONDITIONS = {
    CLEAR: 'clear',
    CLOUDY: 'cloudy',
    RAINY: 'rainy',
    STORMY: 'stormy',
    SNOWY: 'snowy',
    DRY: 'dry'
};

// Seasons
const SEASONS = {
    SPRING: 'spring',
    SUMMER: 'summer',
    AUTUMN: 'autumn',
    WINTER: 'winter'
};

// Initial resources
const initialResources = {
    [RESOURCE_TYPES.FOOD]: 100,
    [RESOURCE_TYPES.WATER]: 100,
    [RESOURCE_TYPES.WOOD]: 50,
    [RESOURCE_TYPES.STONE]: 20,
    [RESOURCE_TYPES.PLANT_FIBER]: 10,
    [RESOURCE_TYPES.METAL_ORE]: 0,
    [RESOURCE_TYPES.CLAY]: 0,
    [RESOURCE_TYPES.ANIMAL_HIDE]: 0
};

// Technology tree
const technologyTree = {
    // Primitive tools
    stoneTools: {
        name: 'Stone Tools',
        description: 'Basic stone tools for gathering and hunting',
        phase: TECH_PHASES.PRIMITIVE,
        requirements: {},
        resourceCost: {
            [RESOURCE_TYPES.STONE]: 10
        },
        discoveryChance: 1.0, // 100% discovery chance (starter tech)
        discovered: false,
        inProgress: false,
        progressPercent: 0,
        timeToDiscover: 10, // In game days
        effects: {
            gatheringEfficiency: 1.2
        }
    },
    woodenTools: {
        name: 'Wooden Tools',
        description: 'Basic wooden tools and sticks',
        phase: TECH_PHASES.PRIMITIVE,
        requirements: {},
        resourceCost: {
            [RESOURCE_TYPES.WOOD]: 10
        },
        discoveryChance: 1.0, // 100% discovery chance (starter tech)
        discovered: false,
        inProgress: false,
        progressPercent: 0,
        timeToDiscover: 10, // In game days
        effects: {
            woodGatheringRate: 1.2
        }
    },
    combinedTools: {
        name: 'Combined Tools',
        description: 'Tools combining wood and stone',
        phase: TECH_PHASES.PRIMITIVE,
        requirements: {
            stoneTools: true,
            woodenTools: true
        },
        resourceCost: {
            [RESOURCE_TYPES.STONE]: 15,
            [RESOURCE_TYPES.WOOD]: 15
        },
        discoveryChance: 0.7,
        discovered: false,
        inProgress: false,
        progressPercent: 0,
        timeToDiscover: 20,
        effects: {
            gatheringEfficiency: 1.5,
            huntingSuccess: 1.3
        },
        eureka: {
            name: 'Flint Techniques',
            description: 'Discovered how to work with flint to create sharper tools',
            effects: {
                huntingSuccess: 1.5,
                toolDurability: 1.3
            }
        }
    },
    
    // Fire usage
    fireUsage: {
        name: 'Fire Usage',
        description: 'Using natural fire sources',
        phase: TECH_PHASES.PRIMITIVE,
        requirements: {},
        resourceCost: {
            [RESOURCE_TYPES.WOOD]: 20
        },
        discoveryChance: 0.5,
        discovered: false,
        inProgress: false,
        progressPercent: 0,
        timeToDiscover: 15,
        effects: {
            foodPreservation: 1.2,
            nightActivity: true
        }
    },
    fireMaintenance: {
        name: 'Fire Maintenance',
        description: 'Keeping fire alive for longer periods',
        phase: TECH_PHASES.PRIMITIVE,
        requirements: {
            fireUsage: true
        },
        resourceCost: {
            [RESOURCE_TYPES.WOOD]: 30
        },
        discoveryChance: 0.6,
        discovered: false,
        inProgress: false,
        progressPercent: 0,
        timeToDiscover: 20,
        effects: {
            foodPreservation: 1.4,
            fireEfficiency: 1.3
        }
    },
    fireplace: {
        name: 'Fire Place',
        description: 'Creating permanent fire locations',
        phase: TECH_PHASES.PRIMITIVE,
        requirements: {
            fireMaintenance: true,
            stoneTools: true
        },
        resourceCost: {
            [RESOURCE_TYPES.STONE]: 20,
            [RESOURCE_TYPES.WOOD]: 30
        },
        discoveryChance: 0.5,
        discovered: false,
        inProgress: false,
        progressPercent: 0,
        timeToDiscover: 25,
        effects: {
            foodPreservation: 1.6,
            fireEfficiency: 1.5,
            settlementFocus: true
        },
        eureka: {
            name: 'Fire Making',
            description: 'Discovered how to create fire without natural sources',
            effects: {
                independentFireCreation: true,
                technologicalAdvancement: 1.2
            }
        }
    },
    
    // Early agriculture
    plantGathering: {
        name: 'Plant Gathering',
        description: 'Systematic collection of edible plants',
        phase: TECH_PHASES.PRIMITIVE,
        requirements: {},
        resourceCost: {},
        discoveryChance: 1.0, // 100% discovery chance (starter tech)
        discovered: false,
        inProgress: false,
        progressPercent: 0,
        timeToDiscover: 5,
        effects: {
            foodGatheringRate: 1.2
        }
    },
    seedCollection: {
        name: 'Seed Collection',
        description: 'Collecting and storing seeds',
        phase: TECH_PHASES.PRIMITIVE,
        requirements: {
            plantGathering: true
        },
        resourceCost: {
            [RESOURCE_TYPES.FOOD]: 30
        },
        discoveryChance: 0.4,
        discovered: false,
        inProgress: false,
        progressPercent: 0,
        timeToDiscover: 30,
        effects: {
            foodVariety: 1.3,
            plantKnowledge: 1.5
        }
    },
    earlyGardening: {
        name: 'Early Gardening',
        description: 'First attempts at growing plants',
        phase: TECH_PHASES.PRIMITIVE,
        requirements: {
            seedCollection: true,
            woodenTools: true
        },
        resourceCost: {
            [RESOURCE_TYPES.FOOD]: 40,
            [RESOURCE_TYPES.WATER]: 50,
            [RESOURCE_TYPES.WOOD]: 20
        },
        discoveryChance: 0.3,
        discovered: false,
        inProgress: false,
        progressPercent: 0,
        timeToDiscover: 50,
        effects: {
            foodProduction: 1.5,
            settlementStability: 1.4
        },
        eureka: {
            name: 'Seed Understanding',
            description: 'Understanding the life cycle of plants and seeds',
            effects: {
                agriculturalEfficiency: 1.5,
                foodSecurity: 1.3
            }
        }
    }
};

// Population initial state
const initialPopulation = {
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

// Environment initial state
const initialEnvironment = {
    season: SEASONS.SPRING,
    temperature: 15,
    weather: WEATHER_CONDITIONS.CLEAR,
    dayLength: 12, // hours of daylight
    rainfall: 0,
    daysPassed: 0
};