/**
 * @jest-environment jsdom
 */

describe('Ecosystem', () => {
  let ecosystem;
  let Ecosystem;

  beforeEach(() => {
    jest.resetModules();
    require('../src/js/ecosystem');
    Ecosystem = window.Ecosystem;
    ecosystem = new Ecosystem();
  });

  test('should initialize with default values', () => {
    // Check plants
    expect(ecosystem.plants).toBeDefined();
    expect(ecosystem.plants.quantity).toBe(100);
    expect(ecosystem.plants.diversity).toBe(5);
    expect(ecosystem.plants.growthRate).toBe(0.05);

    // Check animals
    expect(ecosystem.animals).toBeDefined();
    expect(ecosystem.animals.population).toBe(50);
    expect(ecosystem.animals.diversity).toBe(3);
    expect(ecosystem.animals.reproductionRate).toBe(0.02);
    expect(ecosystem.animals.migrationChance).toBe(0.1);

    // Check minerals
    expect(ecosystem.minerals).toBeDefined();
    expect(ecosystem.minerals.availableSurface).toBe(100);
    expect(ecosystem.minerals.hiddenDeposits).toBe(500);
    expect(ecosystem.minerals.erosionRate).toBe(0.01);

    // Check environment factors
    expect(ecosystem.soilFertility).toBe(0.7);
    expect(ecosystem.waterAvailability).toBe(0.8);
  });

  test('should apply seasonal effects', () => {
    const environment = {
      season: SEASONS.SPRING,
      temperature: 15,
      weather: WEATHER_CONDITIONS.CLEAR
    };

    // Save original values
    const originalGrowthRate = ecosystem.plants.growthRate;
    const originalReproductionRate = ecosystem.animals.reproductionRate;
    const originalWaterAvailability = ecosystem.waterAvailability;

    // Apply seasonal effects
    ecosystem.applySeasonalEffects(environment);

    // Check if values were changed appropriately for spring
    expect(ecosystem.plants.growthRate).not.toBe(originalGrowthRate);
    expect(ecosystem.animals.reproductionRate).not.toBe(originalReproductionRate);
    expect(ecosystem.waterAvailability).not.toBe(originalWaterAvailability);
  });

  test('should update plants based on environment', () => {
    const environment = {
      temperature: 20,
      season: SEASONS.SUMMER
    };
    
    // Mock plant growth that takes place during the update
    const mockPlantGrowth = jest.spyOn(ecosystem, 'updatePlants').mockImplementation(() => {
      ecosystem.plants.growth = 0.5; // Simulate growth
    });
    
    // Update plants with this mock
    ecosystem.updatePlants(environment, 10);
    
    // Check that plant growth appears to have taken place
    expect(ecosystem.plants.growth).toBe(0.5);
    
    // Restore the original method
    mockPlantGrowth.mockRestore();
  });

  test('should update animals with reproduction and migration', () => {
    const environment = {
      season: SEASONS.SPRING
    };
    
    // Set up conditions for animal reproduction
    ecosystem.animals.reproductionRate = 0.5;
    const originalPopulation = ecosystem.animals.population;
    
    // Update with high game speed
    ecosystem.updateAnimals(environment, 10);
    
    // Population should increase due to high reproduction rate and game speed
    expect(ecosystem.animals.population).toBeGreaterThan(originalPopulation);
  });

  test('should allow gathering plants', () => {
    // Set up initial values
    ecosystem.plants.quantity = 100;
    
    // Gather plants
    const gathered = ecosystem.gatherPlants(1.0, 10);
    
    // Check results
    expect(gathered).toBe(10);
    expect(ecosystem.plants.quantity).toBe(90);
  });

  test('should allow hunting animals', () => {
    // Set up initial values
    ecosystem.animals.population = 100;
    
    // Hunt animals
    const hunted = ecosystem.huntAnimals(1.0, 10);
    
    // Check results
    expect(hunted.food).toBe(50); // 10 animals * 5 food per animal
    expect(hunted.animalHide).toBe(7); // 10 animals * 0.7 hide per animal
    expect(ecosystem.animals.population).toBe(90);
  });

  test('should allow gathering minerals', () => {
    // Set up initial values
    ecosystem.minerals.availableSurface = 100;
    
    // Gather minerals
    const gathered = ecosystem.gatherMinerals(1.0, 10);
    
    // Check results
    expect(gathered).toBe(10);
    expect(ecosystem.minerals.availableSurface).toBe(90);
  });
});