// Import jest-dom matchers
import '@testing-library/jest-dom';

// Create mocks for canvas and other browser APIs
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  translate: jest.fn(),
  fillText: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  bezierCurveTo: jest.fn(),
  quadraticCurveTo: jest.fn(),
  arc: jest.fn(),
  arcTo: jest.fn(),
  ellipse: jest.fn(),
  rect: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  clip: jest.fn(),
  isPointInPath: jest.fn(),
  isPointInStroke: jest.fn(),
  drawFocusIfNeeded: jest.fn(),
  scrollPathIntoView: jest.fn(),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  createRadialGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  createPattern: jest.fn(),
  createImageData: jest.fn(),
  getLineDash: jest.fn(),
  setLineDash: jest.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(callback => setTimeout(callback, 0));
global.cancelAnimationFrame = jest.fn();

// Mock localStorage and sessionStorage
const storageMock = () => {
  let storage = {};
  return {
    getItem: jest.fn(key => storage[key] || null),
    setItem: jest.fn((key, value) => {
      storage[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      storage = {};
    }),
    key: jest.fn(i => Object.keys(storage)[i] || null),
    get length() {
      return Object.keys(storage).length;
    },
  };
};

Object.defineProperty(window, 'localStorage', { value: storageMock() });
Object.defineProperty(window, 'sessionStorage', { value: storageMock() });

// Create initial global objects that our game depends on
global.RESOURCE_TYPES = {
  FOOD: 'food',
  WATER: 'water',
  WOOD: 'wood',
  STONE: 'stone',
  PLANT_FIBER: 'plantFiber',
  METAL_ORE: 'metalOre',
  CLAY: 'clay',
  ANIMAL_HIDE: 'animalHide',
};

global.SEASONS = {
  SPRING: 'spring',
  SUMMER: 'summer',
  AUTUMN: 'autumn',
  WINTER: 'winter',
};

global.WEATHER_CONDITIONS = {
  CLEAR: 'clear',
  CLOUDY: 'cloudy',
  RAINY: 'rainy',
  STORMY: 'stormy',
  SNOWY: 'snowy',
  DRY: 'dry',
};

// Mock for EventLogger
global.EventLogger = {
  addEvent: jest.fn(),
  logDebug: jest.fn(),
  logError: jest.fn(),
  updateEventLogUI: jest.fn(),
  clearEvents: jest.fn(),
  eventLog: [],
  maxEvents: 100,
  debugMode: true,
};