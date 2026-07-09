/**
 * KLINTARA Celebration Module
 * ===========================
 * Creates a premium iMessage-style balloon celebration
 * when the name KLINTARA is fully revealed.
 */

const KlintaraCelebration = (() => {
  // Configuration constants
  const CONFIG = {
    balloonCount: 50,
    containerClass: 'klintara-celebration',
    minDuration: 7200,
    maxDuration: 9000,
    balloonSizes: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
    balloonShapes: ['circle', 'oval'],
    balloonColors: [
      'red', 'blue', 'lavender', 'pink', 'gold',
      'emerald', 'peach', 'purple', 'orange', 'white'
    ],
    riseAnimations: [
      'rise', 'rise-left', 'rise-right', 'rise-left-wide', 'rise-right-wide'
    ],
    easing: 'linear',
  };

  let isPlaying = false;
  let celebrationContainer = null;
  let maxAnimationTime = 0; // Track longest animation to prevent early cleanup

  /**
   * Check if user prefers reduced motion
   */
  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /**
   * Get a random element from an array
   */
  const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  /**
   * Get a random number between min and max
   */
  const getRandomNumber = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  /**
   * Create a distinct color palette for each balloon
   */
  const getUniqueBalloonColor = (index) => {
    const hue = (index * 17 + 24) % 360;
    const saturation = 78 + (index % 4) * 5;
    const lightness = 56 + (index % 3) * 4;
    const darkLightness = 40 + (index % 4) * 3;

    return {
      primary: `hsl(${hue} ${saturation}% ${lightness}%)`,
      dark: `hsl(${(hue + 20) % 360} ${Math.min(95, saturation + 8)}% ${darkLightness}%)`
    };
  };

  /**
   * Create a single balloon element
   */
  const createBalloon = (index) => {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';

    // Random size
    const size = getRandomElement(CONFIG.balloonSizes);
    balloon.classList.add(`balloon-size-${size}`);

    // Random shape
    const shape = getRandomElement(CONFIG.balloonShapes);
    balloon.classList.add(`balloon-shape-${shape}`);

    // Random horizontal position
    const positionPercent = getRandomNumber(5, 95);
    balloon.style.left = `${positionPercent}%`;

    // Create balloon sphere
    const sphere = document.createElement('div');
    sphere.className = 'balloon-sphere';
    const color = getUniqueBalloonColor(index);
    sphere.style.setProperty('--balloon-color', color.primary);
    sphere.style.setProperty('--balloon-color-dark', color.dark);

    // Create a single simple curly thread
    const thread = document.createElement('div');
    thread.className = 'balloon-thread';

    balloon.appendChild(sphere);
    balloon.appendChild(thread);

    return balloon;
  };

  /**
   * Apply animation to a balloon
   */
  const animateBalloon = (balloon, index, totalBalloons) => {
    const animation = getRandomElement(CONFIG.riseAnimations);
    const reducedMotion = prefersReducedMotion();
    const duration = getRandomNumber(
      reducedMotion ? 6000 : CONFIG.minDuration,
      reducedMotion ? 8000 : CONFIG.maxDuration
    );
    const launchWindow = reducedMotion ? 900 : 3600;
    const delay = (index / Math.max(totalBalloons - 1, 1)) * launchWindow + getRandomNumber(0, 180);
    const totalTime = duration + delay;

    // Track the maximum animation time across all balloons
    if (totalTime > maxAnimationTime) {
      maxAnimationTime = totalTime;
    }

    const drift = getRandomNumber(-120, 120);
    balloon.style.setProperty('--drift', `${drift}px`);
    balloon.style.setProperty('--float-amplitude', `${getRandomNumber(12, 26)}px`);

    // Apply animation using inline style for dynamic values
    balloon.style.animation = `${animation} ${duration}ms ${CONFIG.easing} ${delay}ms forwards`;
  };

  /**
   * Create and animate all balloons
   */
  const createCelebration = () => {
    // Check for reduced motion preference
    const reducedMotion = prefersReducedMotion();
    const balloonCount = reducedMotion ? 8 : CONFIG.balloonCount;

    maxAnimationTime = 0; // Reset timer

    for (let i = 0; i < balloonCount; i++) {
      const balloon = createBalloon(i);
      celebrationContainer.appendChild(balloon);
      animateBalloon(balloon, i, balloonCount);
    }
  };

  /**
   * Clean up celebration container and remove from DOM
   */
  const cleanupCelebration = () => {
    if (celebrationContainer) {
      // Calculate total time: use maxAnimationTime or minimum time
      const totalTime = Math.max(maxAnimationTime, CONFIG.minDuration + 300);

      // Schedule cleanup after ALL animations complete
      setTimeout(() => {
        if (celebrationContainer && celebrationContainer.parentNode) {
          celebrationContainer.parentNode.removeChild(celebrationContainer);
          celebrationContainer = null;
          isPlaying = false;
        }
      }, totalTime + 100); // Add small buffer
    }
  };

  /**
   * Start the KLINTARA celebration
   * Main entry point - call this when name is fully revealed
   */
  const startKlintaraCelebration = () => {
    // Prevent multiple celebrations from running simultaneously
    if (isPlaying) {
      return;
    }

    isPlaying = true;

    // Create and insert celebration container
    celebrationContainer = document.createElement('div');
    celebrationContainer.className = CONFIG.containerClass;
    document.body.appendChild(celebrationContainer);

    // Create balloons with staggered animation
    createCelebration();

    // Schedule cleanup
    cleanupCelebration();
  };

  /**
   * Public API
   */
  return {
    start: startKlintaraCelebration,
    createBalloon: createBalloon,
    animateBalloon: animateBalloon,
    cleanup: cleanupCelebration,
    isPlaying: () => isPlaying
  };
})();

/**
 * Global function for integration with main script
 */
const startKlintaraCelebration = () => {
  KlintaraCelebration.start();
};
