/**
 * Utility functions for the Evolution Simulation game
 */
const GameUtils = {
  /**
   * Calculate the distance between two points
   * @param {number} x1 - X coordinate of first point
   * @param {number} y1 - Y coordinate of first point
   * @param {number} x2 - X coordinate of second point
   * @param {number} y2 - Y coordinate of second point
   * @returns {number} - The distance between the points
   */
  calculateDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Calculate a percentage value
   * @param {number} value - The current value
   * @param {number} total - The total value
   * @returns {number} - The percentage (0-100)
   */
  calculatePercentage(value, total) {
    if (total <= 0) return 0;
    const percentage = (value / total) * 100;
    return this.clamp(percentage, 0, 100);
  },

  /**
   * Clamp a value between a minimum and maximum
   * @param {number} value - The value to clamp
   * @param {number} min - The minimum allowed value
   * @param {number} max - The maximum allowed value
   * @returns {number} - The clamped value
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * Get a random number within a range
   * @param {number} min - The minimum value (inclusive)
   * @param {number} max - The maximum value (exclusive)
   * @returns {number} - A random number within the range
   */
  randomInRange(min, max) {
    if (min === max) return min;
    return min + Math.random() * (max - min);
  },

  /**
   * Select a random item from an array based on weights
   * @param {Array} options - The array of options to choose from
   * @param {Array<number>} weights - The weights for each option
   * @returns {*} - The selected option or null if arrays are empty
   */
  weightedRandom(options, weights) {
    if (options.length === 0 || weights.length === 0) return null;
    
    // Handle mismatch in array lengths
    const effectiveWeights = weights.length < options.length
      ? [...weights, ...Array(options.length - weights.length).fill(1)]
      : weights;
    
    // Calculate the sum of weights
    const totalWeight = effectiveWeights.reduce((sum, weight) => sum + weight, 0);
    
    // If all weights are zero, return the first option
    if (totalWeight === 0) return options[0];
    
    // Get a random value within the weight range
    const random = Math.random() * totalWeight;
    
    // Find the option that corresponds to the random value
    let cumulativeWeight = 0;
    for (let i = 0; i < options.length; i++) {
      cumulativeWeight += effectiveWeights[i];
      if (random < cumulativeWeight) {
        return options[i];
      }
    }
    
    // Fallback to the last option (should rarely happen)
    return options[options.length - 1];
  },

  /**
   * Format a number with commas and decimal places
   * @param {number} number - The number to format
   * @param {number} [decimals=2] - The number of decimal places
   * @returns {string} - The formatted number
   */
  formatNumber(number, decimals = 2) {
    return number.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }
};

// Make GameUtils available globally
window.GameUtils = GameUtils;