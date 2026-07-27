const startDate = new Date('2026-06-16T10:34:00');
const yearsValue = document.getElementById('yearsValue');
const monthsValue = document.getElementById('monthsValue');
const daysValue = document.getElementById('daysValue');
const withUsMessage = document.getElementById('withUsMessage');
const counterCards = Array.from(document.querySelectorAll('.withus-counter-card'));
const celebrationContainer = document.getElementById('klintaraCelebration');

let milestoneCelebrationShown = false;
let initialCounterAnimationComplete = false;
let initialAnimationTimer = null;
let lastCelebratedMonthMilestone = 0;
let lastCelebratedUnit = null;

function getTimeParts() {
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();

  if (diffMs < 0) {
    return { years: 0, months: 0, days: 0 };
  }

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(totalDays / 365);
  const remainingAfterYears = totalDays % 365;
  const months = Math.floor(remainingAfterYears / 30);
  const days = remainingAfterYears % 30;

  return { years, months, days };
}

function getMilestoneColors() {
  const hue = Math.floor(Math.random() * 360);
  return {
    primary: `hsl(${hue} 85% 62%)`,
    dark: `hsl(${(hue + 24) % 360} 78% 44%)`
  };
}

function getCompletedMonthMilestone() {
  const now = new Date();
  const totalMonths = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
  return now.getDate() < startDate.getDate() ? totalMonths - 1 : totalMonths;
}

function getCelebrationMilestoneState(parts = {}) {
  const years = Number(parts.years ?? 0);

  if (years > 0) {
    return { unit: 'year', count: Math.max(1, years) };
  }

  return {
    unit: 'month',
    count: Math.max(1, Number(parts.months ?? getCompletedMonthMilestone()))
  };
}

function getCelebrationMilestoneLabel(parts = {}) {
  const state = getCelebrationMilestoneState(parts);
  const unitLabel = state.unit === 'year'
    ? (state.count === 1 ? 'Year' : 'Years')
    : (state.count === 1 ? 'Month' : 'Months');

  return `${state.count} ${unitLabel}`;
}

function shouldShowMilestoneCelebration(parts = {}) {
  const state = getCelebrationMilestoneState(parts);
  return lastCelebratedUnit !== state.unit || state.count > lastCelebratedMonthMilestone;
}

function showMilestoneCelebration(parts = {}) {
  if (!celebrationContainer) {
    return;
  }

  if (milestoneCelebrationShown && celebrationContainer.querySelector('.milestone-celebration')) {
    return;
  }

  if (celebrationContainer.querySelector('.milestone-celebration')) {
    milestoneCelebrationShown = true;
    return;
  }

  const milestoneState = getCelebrationMilestoneState(parts);
  lastCelebratedMonthMilestone = milestoneState.count;
  lastCelebratedUnit = milestoneState.unit;

  const milestoneLabel = getCelebrationMilestoneLabel(parts);
  const balloonPalette = [
    { color: 'red', size: 'small' },
    { color: 'blue', size: 'medium' },
    { color: 'gold', size: 'large' },
    { color: 'lavender', size: 'small' },
    { color: 'emerald', size: 'medium' }
  ];
  const riseAnimations = ['rise', 'rise-left', 'rise-right', 'rise-left-wide', 'rise-right-wide'];

  const celebration = document.createElement('div');
  celebration.className = 'milestone-celebration';
  celebration.setAttribute('aria-live', 'polite');
  celebration.style.position = 'fixed';
  celebration.style.inset = '0';
  celebration.style.pointerEvents = 'none';
  celebration.style.zIndex = '9999';
  celebration.style.overflow = 'hidden';

  const balloonGroup = document.createElement('div');
  balloonGroup.className = 'milestone-balloon-group';
  celebration.appendChild(balloonGroup);
  celebrationContainer.appendChild(celebration);

  const balloonCount = 16;
  const launchGap = 380;
  const duration = 11200;
  const fadeDelay = Math.max(0, duration + launchGap * balloonCount - 1200);

  const launchSequence = () => {
    for (let i = 0; i < balloonCount; i += 1) {
      const entry = balloonPalette[i % balloonPalette.length];
      const animationName = riseAnimations[i % riseAnimations.length];
      const delay = i * launchGap;
      const balloon = document.createElement('div');
      const shapeClass = i % 3 === 0 ? 'balloon-shape-circle' : 'balloon-shape-oval';
      balloon.className = `balloon ${shapeClass} balloon-size-${entry.size}`;
      balloon.classList.add(`balloon-${entry.color}`);
      balloon.style.left = `${8 + Math.random() * 84}%`;
      balloon.style.bottom = `${-140 - Math.random() * 24}px`;
      balloon.style.opacity = '0';
      balloon.style.setProperty('--float-amplitude', `${16 + (i % 4) * 6}px`);
      balloon.style.setProperty('--drift', `${[-90, -56, -24, 20, 56, 92][i % 6]}px`);
      balloon.style.setProperty('--path-x', `${(Math.random() - 0.5) * 96}px`);
      balloon.style.animation = `${animationName} ${duration}ms ease-in-out ${delay}ms forwards`;

      const sphere = document.createElement('div');
      sphere.className = 'balloon-sphere';

      const thread = document.createElement('div');
      thread.className = 'balloon-thread';

      const card = document.createElement('div');
      card.className = 'milestone-card';
      card.textContent = milestoneLabel;

      balloon.appendChild(sphere);
      balloon.appendChild(thread);
      balloon.appendChild(card);
      balloonGroup.appendChild(balloon);
    }
  };

  launchSequence();

  milestoneCelebrationShown = true;

  window.setTimeout(() => {
    celebration.classList.add('is-fading');
    window.setTimeout(() => {
      celebration.remove();
      milestoneCelebrationShown = false;
    }, 900);
  }, fadeDelay);
}

function animateCounter(element, targetValue, duration = 1400) {
  if (!element) return;

  const startValue = Number(element.textContent.replace(/\D/g, '')) || 0;
  const range = targetValue - startValue;
  const startTime = performance.now();

  function frame(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(startValue + range * eased);
    element.textContent = String(currentValue).padStart(2, '0');

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function updateWithUsClock() {
  const parts = getTimeParts();

  if (yearsValue) {
    animateCounter(yearsValue, parts.years);
  }
  if (monthsValue) {
    animateCounter(monthsValue, parts.months);
  }
  if (daysValue) {
    animateCounter(daysValue, parts.days);
  }

  if (withUsMessage) {
    withUsMessage.textContent = `Living in love, light, and laughter for ${parts.years} years, ${parts.months} months, and ${parts.days} days.`;
  }

  if (!initialCounterAnimationComplete) {
    if (!initialAnimationTimer) {
      initialAnimationTimer = window.setTimeout(() => {
        initialCounterAnimationComplete = true;
        initialAnimationTimer = null;
        if (shouldShowMilestoneCelebration(parts)) {
          showMilestoneCelebration(parts);
        }
      }, 1600);
    }
  } else if (shouldShowMilestoneCelebration(parts)) {
    showMilestoneCelebration(parts);
  }
}

window.setTimeout(() => {
  const milestoneCount = Math.max(1, getCompletedMonthMilestone());
  if (!milestoneCelebrationShown && shouldShowMilestoneCelebration({ years: 0, months: milestoneCount, days: 0 })) {
    showMilestoneCelebration({ years: 0, months: milestoneCount, days: 0 });
  }
}, 1400);

window.showMilestoneCelebration = showMilestoneCelebration;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    updateWithUsClock();
    window.setTimeout(() => {
      const milestoneCount = Math.max(1, getCompletedMonthMilestone());
      if (!milestoneCelebrationShown && shouldShowMilestoneCelebration({ years: 0, months: milestoneCount, days: 0 })) {
        showMilestoneCelebration({ years: 0, months: milestoneCount, days: 0 });
      }
    }, 1200);
  });
} else {
  updateWithUsClock();
  window.setTimeout(() => {
    const milestoneCount = Math.max(1, getCompletedMonthMilestone());
    if (!milestoneCelebrationShown && shouldShowMilestoneCelebration({ years: 0, months: milestoneCount, days: 0 })) {
      showMilestoneCelebration({ years: 0, months: milestoneCount, days: 0 });
    }
  }, 1200);
}

setInterval(updateWithUsClock, 1000);
