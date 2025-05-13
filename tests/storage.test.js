/**
 * @jest-environment jsdom
 */

describe('GameStorage', () => {
  let GameStorage;
  let mockGameData;
  let mockSessionStorage;

  beforeEach(() => {
    // Reset modules and load storage
    jest.resetModules();
    require('../src/js/storage');
    GameStorage = window.GameStorage;

    // Mock game data
    mockGameData = {
      environment: { season: 'spring', temperature: 15 },
      ecosystem: {
        plants: { quantity: 100 },
        animals: { population: 50 },
        minerals: { availableSurface: 100 }
      },
      settlement: {
        population: { total: 10, groups: { gatherers: 5, hunters: 3, builders: 2 } },
        resources: { food: 100, water: 100 }
      }
    };

    // Mock sessionStorage
    mockSessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    // Override the existing sessionStorage mock with our test-specific one
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true
    });
  });

  test('should save game data to session storage', () => {
    // Call the saveGame method
    const result = GameStorage.saveGame(mockGameData);
    
    // Check that sessionStorage.setItem was called with the correct key
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      GameStorage.STORAGE_KEY,
      expect.any(String)
    );
    
    // Check that the result is true (successful save)
    expect(result).toBe(true);
  });

  test('should load game data from session storage', () => {
    // Set up the mock to return a JSON string
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(mockGameData));
    
    // Call the loadGame method
    const result = GameStorage.loadGame();
    
    // Check that sessionStorage.getItem was called with the correct key
    expect(mockSessionStorage.getItem).toHaveBeenCalledWith(GameStorage.STORAGE_KEY);
    
    // Check that the loaded data matches our mock data
    expect(result).toEqual(mockGameData);
  });

  test('should return null when no saved game exists', () => {
    // Set up the mock to return null (no saved game)
    mockSessionStorage.getItem.mockReturnValue(null);
    
    // Call the loadGame method
    const result = GameStorage.loadGame();
    
    // Check that sessionStorage.getItem was called with the correct key
    expect(mockSessionStorage.getItem).toHaveBeenCalledWith(GameStorage.STORAGE_KEY);
    
    // Check that the result is null
    expect(result).toBeNull();
  });

  test('should clear saved game', () => {
    // Call the clearSavedGame method
    const result = GameStorage.clearSavedGame();
    
    // Check that sessionStorage.removeItem was called with the correct key
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(GameStorage.STORAGE_KEY);
    
    // Check that the result is true (successful clear)
    expect(result).toBe(true);
  });

  test('should check if a save exists', () => {
    // Set up the mock to return a value
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(mockGameData));
    
    // Call the hasExistingSave method
    const result = GameStorage.hasExistingSave();
    
    // Check that sessionStorage.getItem was called with the correct key
    expect(mockSessionStorage.getItem).toHaveBeenCalledWith(GameStorage.STORAGE_KEY);
    
    // Check that the result is true
    expect(result).toBe(true);
  });

  test('should sanitize game data for storage', () => {
    // Create a mock game instance
    const mockGame = {
      environment: { season: 'spring', temperature: 15 },
      ecosystem: {
        plants: { quantity: 100 },
        animals: { population: 50 },
        minerals: { availableSurface: 100 },
        soilFertility: 0.7,
        waterAvailability: 0.8
      },
      settlement: {
        population: {
          total: 10,
          growth: 0.1,
          deathRate: 0.05,
          foodConsumptionPerDay: 2,
          waterConsumptionPerDay: 3,
          groups: { gatherers: 5, hunters: 3, builders: 2 }
        },
        resources: { food: 100, water: 100 },
        stats: { happiness: 50, health: 75 },
        activityPreferences: {},
        buildingProgress: {},
        successRates: {},
        discoveredTechnologies: new Set(['stoneTools']),
        inProgressTechnologies: new Set(['woodenTools'])
      },
      gameSpeed: 1,
      tickInterval: 1000
    };
    
    // Call the sanitizeDataForStorage method
    const result = GameStorage.sanitizeDataForStorage(mockGame);
    
    // Check that the sanitized data includes expected properties
    expect(result).toHaveProperty('environment');
    expect(result).toHaveProperty('ecosystem');
    expect(result).toHaveProperty('settlement');
    expect(result).toHaveProperty('gameSpeed');
    
    // Check that Sets were converted to arrays
    expect(Array.isArray(result.technologies.discovered)).toBe(true);
    expect(result.technologies.discovered).toContain('stoneTools');
    expect(Array.isArray(result.technologies.inProgress)).toBe(true);
    expect(result.technologies.inProgress).toContain('woodenTools');
  });
});