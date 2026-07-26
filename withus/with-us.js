const startDate = new Date('2026-06-16T10:34:00');
const yearsValue = document.getElementById('yearsValue');
const monthsValue = document.getElementById('monthsValue');
const daysValue = document.getElementById('daysValue');
const withUsMessage = document.getElementById('withUsMessage');
const counterCards = Array.from(document.querySelectorAll('.withus-counter-card'));

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
}

counterCards.forEach((card) => {
  card.classList.add('is-animating');
});

updateWithUsClock();
setInterval(updateWithUsClock, 1000);
