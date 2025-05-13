/**
 * @jest-environment jsdom
 */

describe('Renderer', () => {
  let renderer;
  let Renderer;
  let mockGame;
  let originalDocument;

  beforeEach(() => {
    // Save original document functions
    originalDocument = { ...document };

    // Setup DOM elements needed for renderer
    document.body.innerHTML = `
      <div id="game-area">
        <canvas id="game-canvas"></canvas>
      </div>
    `;

    // Mock game instance
    mockGame = {
      ecosystem: {
        plants: { quantity: 100, growth: 0, diversity: 5, growthRate: 0.05 },
        animals: { population: 50, diversity: 3, reproductionRate: 0.02, migrationChance: 0.1 },
        minerals: { availableSurface: 100, hiddenDeposits: 500, erosionRate: 0.01 },
        soilFertility: 0.7,
        waterAvailability: 0.8
      },
      settlement: {
        population: {
          total: 10,
          groups: {
            gatherers: 5,
            hunters: 3,
            builders: 2,
            researchers: 0
          }
        },
        buildingProgress: {
          shelter: 50,
          storageArea: 30,
          craftingArea: 20,
          researchArea: 10
        }
      },
      environment: {
        season: SEASONS.SPRING,
        temperature: 15,
        weather: WEATHER_CONDITIONS.CLEAR,
        dayLength: 12,
        rainfall: 0,
        daysPassed: 0
      }
    };
    
    // Reset modules and create renderer instance
    jest.resetModules();
    require('../src/js/utils');
    require('../src/js/pathfinding');
    require('../src/js/renderer');
    Renderer = window.Renderer;
    renderer = new Renderer(mockGame);
  });

  afterEach(() => {
    // Restore original document
    document = originalDocument;
    jest.restoreAllMocks();
  });

  test('should initialize with game reference', () => {
    expect(renderer.game).toBe(mockGame);
  });

  test('should initialize canvas', () => {
    expect(renderer.canvas).toBeTruthy();
    expect(renderer.ctx).toBeTruthy();
  });

  test('should set default tile size', () => {
    expect(renderer.tileSize).toBe(32);
  });

  test('should generate terrain on initialization', () => {
    expect(renderer.terrain).toBeTruthy();
    expect(renderer.terrain.length).toBeGreaterThan(0);
  });

  test('should initialize entities arrays', () => {
    expect(renderer.entities.settlers).toEqual(expect.any(Array));
    expect(renderer.entities.buildings).toEqual(expect.any(Array));
    expect(renderer.entities.resources).toEqual(expect.any(Array));
  });

  test('should return placeholder color when sprite not loaded', () => {
    const color = renderer.getPlaceholderColor('grass');
    expect(color).toBeTruthy();
    expect(typeof color).toBe('string');
  });

  test('should handle fallback when canvas parent is missing', () => {
    // Mock that the canvas parent element is null
    Object.defineProperty(renderer.canvas, 'parentElement', {
      get: jest.fn(() => null)
    });
    
    // This should not throw error even with no parent
    expect(() => renderer.resizeCanvas()).not.toThrow();
  });
});