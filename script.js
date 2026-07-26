const nameDisplay = document.getElementById('nameDisplay');
const storySection = document.getElementById('storySection');
const finalReveal = document.getElementById('finalReveal');
const fullNameReveal = document.getElementById('fullNameReveal');
const cursorGlow = document.getElementById('cursorGlow');
const heroPanel = document.querySelector('.hero-panel');
const sparkles = document.getElementById('sparkles');
const choicePrompt = document.getElementById('choicePrompt');
const revealButton = document.getElementById('revealButton');
const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
const birthDateInput = document.getElementById('birthDateInput');
const calculateBirthdayBtn = document.getElementById('calculateBirthdayBtn');
const birthdayResult = document.getElementById('birthdayResult');
const rhymeScrollButton = document.getElementById('rhymeScrollTop');
const homeScrollButton = document.getElementById('homeScrollTop');

const nameLetters = ['K', 'L', 'I', 'N', 'T', 'A', 'R', 'A'];
const optionSets = [
  ['K', 'G'],
  ['L', 'R'],
  ['I', 'O'],
  ['N', 'M'],
  ['T', 'P'],
  ['A', 'E'],
  ['R', 'U'],
  ['A', 'Y']
];

let stepIndex = 0;
let isComplete = false;
let fullNameRevealed = false;

const revealStateKey = 'klintaraRevealState';

function readRevealState() {
  try {
    const savedState = sessionStorage.getItem(revealStateKey);
    if (!savedState) return null;
    return JSON.parse(savedState);
  } catch (error) {
    return null;
  }
}

function writeRevealState() {
  sessionStorage.setItem(revealStateKey, JSON.stringify({
    isComplete,
    stepIndex,
    fullNameRevealed
  }));
}

function restoreRevealState() {
  const savedState = readRevealState();
  if (!savedState) return;

  isComplete = Boolean(savedState.isComplete);
  stepIndex = Number(savedState.stepIndex) || 0;
  fullNameRevealed = Boolean(savedState.fullNameRevealed);
}

function getCurrentPageName() {
  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  if (pageName === '' || pageName === 'index.html') {
    return 'home';
  }

  const pageMap = {
    'index.html': 'home',
    'telugu-rhymes.html': 'rhymes',
    'hindi-rhymes.html': 'hindi-rhymes',
    'sanskrit-rhymes.html': 'sanskrit-rhymes',
    'nameplate.html': 'nameplate',
    'telugurhymes.html': 'telugu-rhymes',
    'hindirhymes.html': 'hindi-rhymes',
    'sanskrithymes.html': 'sanskrit-rhymes',
    'birthday.html': 'birthday',
    'with-us.html': 'with-us',
    'with-us': 'with-us'
  };

  return pageMap[pageName] || 'home';
}

function updateActiveNav() {
  const currentSection = getCurrentPageName();

  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.target === currentSection);
  });
}

function updateWithUsButtonState() {
  const withUsButton = document.getElementById('withUsNavBtn');
  if (!withUsButton) return;

  const isHomePage = window.location.pathname.split('/').pop() === 'index.html' || window.location.pathname === '/';
  const shouldLock = isHomePage && !isComplete;
  const currentPath = window.location.pathname;
  const isInSubfolder = currentPath.includes('/rhymes/') || currentPath.includes('/scripts/') || currentPath.includes('/withus/');
  const withUsHref = isInSubfolder ? '../withus/with-us.html' : 'withus/with-us.html';

  withUsButton.classList.toggle('locked', shouldLock);
  withUsButton.setAttribute('aria-disabled', shouldLock ? 'true' : 'false');
  withUsButton.setAttribute('href', shouldLock ? '#' : withUsHref);
}

function bindNavigation() {
  navButtons.forEach((button) => {
    const href = button.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    button.addEventListener('click', (event) => {
      const isHomeLockedWithUs = button.id === 'withUsNavBtn' && !isComplete && (window.location.pathname.split('/').pop() === 'index.html' || window.location.pathname === '/');
      if (isHomeLockedWithUs) {
        event.preventDefault();
        if (choicePrompt) {
          choicePrompt.textContent = 'The WithUs story opens once the name is revealed.';
        }
        return;
      }

      event.preventDefault();
      window.location.href = href;
    });
  });
}

function calculateDaysSinceBirth() {
  if (!birthDateInput || !birthdayResult) return;

  const selectedDate = birthDateInput.value;
  if (!selectedDate) {
    birthdayResult.textContent = 'Please choose a birth date to begin the countdown.';
    return;
  }

  const birth = new Date(`${selectedDate}T00:00:00`);
  const today = new Date();
  const normalizedBirth = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate());
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = normalizedToday - normalizedBirth;

  if (diffMs < 0) {
    birthdayResult.textContent = 'That date is still ahead — choose a day that has already arrived.';
    return;
  }

  const diffDays = Math.floor(diffMs / 86400000);
  const formattedDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  birthdayResult.textContent = `✨ ${diffDays} days of joy and love since ${formattedDate}.`;
}

function createSparkles() {
  if (!sparkles) return;

  const count = 24;
  const sizeVariations = [4, 5, 6, 7, 8, 9];
  
  for (let i = 0; i < count; i += 1) {
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle';
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.animationDelay = `${Math.random() * 2.6}s`;
    sparkle.style.animationDuration = `${2.2 + Math.random() * 2.2}s`;
    
    // Random size variation
    const size = sizeVariations[Math.floor(Math.random() * sizeVariations.length)];
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    
    // Random rotation for organic look
    const rotation = Math.random() * 360;
    sparkle.style.transform = `rotate(${rotation}deg)`;
    
    // Slight opacity variation
    const opacity = 0.6 + Math.random() * 0.4;
    sparkle.style.opacity = opacity;
    
    sparkles.appendChild(sparkle);
  }
}

function updateNameDisplay() {
  const letterSpans = Array.from(nameDisplay?.querySelectorAll('span') || []);
  letterSpans.forEach((span, index) => {
    span.classList.toggle('revealed', index < stepIndex);
  });
}

function completeReveal() {
  if (isComplete) return;

  isComplete = true;
  stepIndex = nameLetters.length;
  updateNameDisplay();

  if (choicePrompt) {
    choicePrompt.textContent = 'Lovely — That\'s incredibly unique!';
  }
  if (revealButton) {
    revealButton.style.display = 'none';
  }
  storySection?.classList.remove('hidden');
  storySection?.classList.add('visible');
  writeRevealState();
  updateWithUsButtonState();

  setTimeout(() => {
    startKlintaraCelebration();
  }, 300);
}

function buildFullNameReveal() {
  if (!fullNameReveal) return;

  const fullName = 'INDURI  KLINTARA  REDDY';
  fullNameReveal.innerHTML = '';

  fullName.split('').forEach((character) => {
    const span = document.createElement('span');
    span.className = character === ' ' ? 'space' : 'full-name-letter';
    span.textContent = character === ' ' ? '' : character;
    fullNameReveal.appendChild(span);
  });
}

function createPremiumRevealBloom(x = window.innerWidth * 0.5, y = window.innerHeight * 0.3) {
  const bloom = document.createElement('div');
  bloom.className = 'premium-reveal-bloom';
  bloom.style.left = `${x}px`;
  bloom.style.top = `${y}px`;

  const particleCount = 8;
  for (let i = 0; i < particleCount; i += 1) {
    const particle = document.createElement('span');
    particle.className = 'premium-particle';

    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.2;
    const distance = 34 + Math.random() * 64;
    const size = 2.4 + Math.random() * 3.4;

    particle.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
    particle.style.setProperty('--size', `${size}px`);
    particle.style.animationDelay = `${Math.random() * 0.12}s`;

    bloom.appendChild(particle);
  }

  const ring = document.createElement('span');
  ring.className = 'premium-ring';
  bloom.appendChild(ring);

  const core = document.createElement('span');
  core.className = 'premium-core';
  core.style.animationDelay = `${Math.random() * 0.04}s`;
  bloom.appendChild(core);

  const bloomLayer = document.querySelector('.final-card') || document.body;
  bloomLayer.appendChild(bloom);
  setTimeout(() => bloom.remove(), 2600);
}

function revealFullName() {
  if (!finalReveal || !fullNameReveal || fullNameRevealed) return;

  fullNameRevealed = true;
  finalReveal.classList.remove('hidden');
  finalReveal.classList.add('visible');

  const letters = Array.from(fullNameReveal.querySelectorAll('.full-name-letter'));
  const letterDelay = 120;
  const revealHold = 720;

  letters.forEach((letter, index) => {
    setTimeout(() => {
      letter.classList.add('revealed');
    }, index * letterDelay);
  });

  setTimeout(() => {
    fullNameReveal.classList.add('reveal-complete');
    const card = finalReveal?.querySelector('.final-card');
    card?.classList.add('reveal-glow');
  }, letters.length * letterDelay + revealHold);

  setTimeout(() => {
    const panel = finalReveal?.querySelector('.final-card') || finalReveal;
    const rect = panel?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const bloomCount = 4;

    for (let i = 0; i < bloomCount; i += 1) {
      const angle = (Math.PI * 2 * i) / bloomCount;
      const radiusX = (rect.width * 0.12) + Math.random() * (rect.width * 0.14);
      const radiusY = (rect.height * 0.09) + Math.random() * (rect.height * 0.12);
      const x = centerX + Math.cos(angle) * radiusX;
      const y = centerY + Math.sin(angle) * radiusY;
      setTimeout(() => createPremiumRevealBloom(x, y), i * 95);
    }
  }, 300);
}

function handleScroll() {
  if (!isComplete || fullNameRevealed) return;

  const distanceFromBottom = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY);
  if (distanceFromBottom <= 220) {
    revealFullName();
  }
}

function updateCursorGlow(event) {
  if (!cursorGlow) return;
  const x = event.clientX;
  const y = event.clientY;
  cursorGlow.style.left = `${x}px`;
  cursorGlow.style.top = `${y}px`;

  if (heroPanel) {
    const offsetX = (x / window.innerWidth - 0.5) * 10;
    const offsetY = (y / window.innerHeight - 0.5) * 10;
    heroPanel.style.transform = `perspective(900px) rotateX(${offsetY * -0.4}deg) rotateY(${offsetX * 0.5}deg)`;
  }
}

function toggleScrollTopButtons() {
  const shouldShow = window.scrollY > 280;

  if (rhymeScrollButton) {
    rhymeScrollButton.classList.toggle('visible', shouldShow);
  }

  if (homeScrollButton) {
    homeScrollButton.classList.toggle('visible', shouldShow);
  }
}

function scrollToPageTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToRhymeContents() {
  scrollToPageTop();

  const toc = document.querySelector('.table-of-contents');
  const firstLink = toc?.querySelector('a');
  if (firstLink) {
    setTimeout(() => {
      firstLink.focus({ preventScroll: true });
    }, 300);
  }
}

function resetPagePosition() {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

resetPagePosition();
createSparkles();
buildFullNameReveal();
restoreRevealState();
updateNameDisplay();

if (isComplete) {
  if (choicePrompt) {
    choicePrompt.textContent = 'Lovely — That\'s incredibly unique!';
  }
  if (revealButton) {
    revealButton.style.display = 'none';
  }
  storySection?.classList.remove('hidden');
  storySection?.classList.add('visible');
}

revealButton?.addEventListener('click', () => {
  if (isComplete) return;
  completeReveal();
});

window.addEventListener('load', resetPagePosition);
document.addEventListener('pointermove', updateCursorGlow, { passive: true });
document.addEventListener('pointerleave', () => {
  if (heroPanel) {
    heroPanel.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  }
});
updateActiveNav();
updateWithUsButtonState();
bindNavigation();

rhymeScrollButton?.addEventListener('click', scrollToRhymeContents);
homeScrollButton?.addEventListener('click', scrollToPageTop);
window.addEventListener('scroll', toggleScrollTopButtons, { passive: true });
toggleScrollTopButtons();

calculateBirthdayBtn?.addEventListener('click', calculateDaysSinceBirth);
birthDateInput?.addEventListener('change', calculateDaysSinceBirth);
calculateDaysSinceBirth();

document.addEventListener('scroll', handleScroll, { passive: true });
