const startDate = new Date('2026-06-16T10:34:00');
const yearsValue = document.getElementById('yearsValue');
const monthsValue = document.getElementById('monthsValue');
const daysValue = document.getElementById('daysValue');
const withUsMessage = document.getElementById('withUsMessage');

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

function updateWithUsClock() {
  const parts = getTimeParts();

  if (yearsValue) {
    yearsValue.textContent = String(parts.years).padStart(2, '0');
  }
  if (monthsValue) {
    monthsValue.textContent = String(parts.months).padStart(2, '0');
  }
  if (daysValue) {
    daysValue.textContent = String(parts.days).padStart(2, '0');
  }

  if (withUsMessage) {
    withUsMessage.textContent = `Living in love, light, and laughter for ${parts.years} years, ${parts.months} months, and ${parts.days} days.`;
  }
}

updateWithUsClock();
setInterval(updateWithUsClock, 1000);
