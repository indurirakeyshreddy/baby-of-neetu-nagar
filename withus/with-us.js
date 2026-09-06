const startDate = new Date(2026, 5, 16, 10, 34, 0);
const yearsValue = document.getElementById('yearsValue');
const monthsValue = document.getElementById('monthsValue');
const daysValue = document.getElementById('daysValue');
const withUsMessage = document.getElementById('withUsMessage');
const counterCards = Array.from(document.querySelectorAll('.withus-counter-card'));
const withUsTimer = document.getElementById('withUsTimer');
const celebrationContainer = document.getElementById('klintaraCelebration');

let milestoneCelebrationShown = false;
let initialCounterAnimationComplete = false;
let initialAnimationTimer = null;
let lastCelebratedMonthMilestone = 0;
let lastCelebratedUnit = null;
let countersAreVisible = false;

function getAnniversaryDate(completedMonths) {
  const anniversary = new Date(startDate);
  anniversary.setMonth(startDate.getMonth() + completedMonths);
  return anniversary;
}

function getCompletedMonthCount(referenceDate = new Date()) {
  if (referenceDate.getTime() < startDate.getTime()) return 0;

  let completedMonths = (referenceDate.getFullYear() - startDate.getFullYear()) * 12
    + (referenceDate.getMonth() - startDate.getMonth());

  while (completedMonths > 0 && getAnniversaryDate(completedMonths) > referenceDate) {
    completedMonths -= 1;
  }

  while (getAnniversaryDate(completedMonths + 1) <= referenceDate) {
    completedMonths += 1;
  }

  return completedMonths;
}

function getTimeParts() {
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();

  if (diffMs < 0) {
    return { years: 0, months: 0, days: 0 };
  }

  const completedMonths = getCompletedMonthCount(now);
  const latestAnniversary = getAnniversaryDate(completedMonths);
  const years = Math.floor(completedMonths / 12);
  const months = completedMonths % 12;
  const days = Math.floor((now.getTime() - latestAnniversary.getTime()) / 86400000);

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
  return getCompletedMonthCount();
}

function getEnteredMonthCount(referenceDate = new Date()) {
  return Math.max(1, getCompletedMonthCount(referenceDate) + 1);
}

function getCelebrationMilestoneState(parts = {}) {
  const years = Number(parts.years ?? 0);

  if (years > 0) {
    return { unit: 'year', count: Math.max(1, years) };
  }

  const activeMonth = Number(parts.months ?? getCompletedMonthMilestone()) + 1;
  return {
    unit: 'month',
    count: Math.max(1, activeMonth)
  };
}

function getOrdinalSuffix(value) {
  const remainder100 = value % 100;
  if (remainder100 >= 11 && remainder100 <= 13) return 'th';

  switch (value % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function getCelebrationMilestoneLabel(parts = {}) {
  const state = getCelebrationMilestoneState(parts);

  if (state.unit === 'month') {
    const ordinalMonth = `${state.count}${getOrdinalSuffix(state.count)}`;
    return `Into The<br>${ordinalMonth} Month`;
  }

  const unitLabel = state.count === 1 ? 'Year' : 'Years';
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
    const launchGap = 320;
    const duration = 7600;
    const fadeDelay = Math.max(0, duration + launchGap * balloonCount - 900);
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
      balloon.style.animation = `${animationName} ${duration}ms linear ${delay}ms forwards`;

      const sphere = document.createElement('div');
      sphere.className = 'balloon-sphere';

      const thread = document.createElement('div');
      thread.className = 'balloon-thread';

      const card = document.createElement('div');
      card.className = 'milestone-card';
      card.innerHTML = milestoneLabel;

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

function animateCounter(element, targetValue, duration = 1800) {
  if (!element) return;

  const minDigits = element.id === 'yearsValue' ? 3 : 2;
  const targetText = String(targetValue).padStart(minDigits, '0');
  if (element.dataset.targetValue === targetText) return;

  window.clearInterval(element.rollInterval);
  window.clearTimeout(element.rollTimeout);
  window.cancelAnimationFrame(element.rollFrame);
  element.dataset.targetValue = targetText;
  element.classList.add('is-rolling');

  const startTime = performance.now();
  const frame = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(targetValue * eased);
    element.textContent = String(currentValue).padStart(minDigits, '0');

    if (progress < 1) {
      element.rollFrame = window.requestAnimationFrame(frame);
      return;
    }

    element.textContent = targetText;
    element.classList.remove('is-rolling');
  };

  element.rollFrame = window.requestAnimationFrame(frame);
}

function setCounterValue(element, targetValue) {
  if (!element) return;

  const minDigits = element.id === 'yearsValue' ? 3 : 2;
  const targetText = String(targetValue).padStart(minDigits, '0');
  window.clearInterval(element.rollInterval);
  window.clearTimeout(element.rollTimeout);
  window.cancelAnimationFrame(element.rollFrame);
  element.dataset.targetValue = targetText;
  element.textContent = targetText;
  element.classList.remove('is-rolling');
}

function updateWithUsClock() {
  const parts = getTimeParts();

  if (countersAreVisible && yearsValue) {
    animateCounter(yearsValue, parts.years);
  } else if (yearsValue) {
    setCounterValue(yearsValue, parts.years);
  }
  if (countersAreVisible && monthsValue) {
    animateCounter(monthsValue, parts.months);
  } else if (monthsValue) {
    setCounterValue(monthsValue, parts.months);
  }
  if (countersAreVisible && daysValue) {
    animateCounter(daysValue, parts.days);
  } else if (daysValue) {
    setCounterValue(daysValue, parts.days);
  }

  if (withUsMessage) {
    const yearText = parts.years > 0 ? `${parts.years} ${parts.years === 1 ? 'year' : 'years'}` : '';
    const monthText = parts.months > 0 ? `${parts.months} ${parts.months === 1 ? 'month' : 'months'}` : '';
    const dayText = parts.days > 0 ? `${parts.days} ${parts.days === 1 ? 'day' : 'days'}` : '';

    const segments = [yearText, monthText, dayText].filter(Boolean);
    const summary = segments.length > 0
      ? `Living in love, light, and laughter for ${segments.join(', ')}`
      : 'Living in love, light, and laughter with us now';

    withUsMessage.textContent = summary;
  }

  if (!initialCounterAnimationComplete) {
    initialCounterAnimationComplete = true;
    if (shouldShowMilestoneCelebration(parts)) {
      showMilestoneCelebration(parts);
    }
  } else if (shouldShowMilestoneCelebration(parts)) {
    showMilestoneCelebration(parts);
  }
}

function observeWithUsTimer() {
  if (!withUsTimer || !('IntersectionObserver' in window)) {
    countersAreVisible = true;
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;

    if (!entry.isIntersecting) {
      countersAreVisible = false;
      return;
    }

    if (countersAreVisible) return;

    countersAreVisible = true;
    [yearsValue, monthsValue, daysValue].forEach((element) => {
      if (element) element.dataset.targetValue = '';
    });
    updateWithUsClock();
  }, { threshold: 0.35 });

  observer.observe(withUsTimer);
}


window.showMilestoneCelebration = showMilestoneCelebration;
observeWithUsTimer();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    updateWithUsClock();
  });
} else {
  updateWithUsClock();
}

setInterval(updateWithUsClock, 1000);
