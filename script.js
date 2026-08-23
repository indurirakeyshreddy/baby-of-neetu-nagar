const nameDisplay = document.getElementById('nameDisplay');
const storySection = document.getElementById('storySection');
const finalReveal = document.getElementById('finalReveal');
const fullNameReveal = document.getElementById('fullNameReveal');
const cursorGlow = document.getElementById('cursorGlow');
const heroPanel = document.querySelector('.hero-panel');
const sparkles = document.getElementById('sparkles');
const choicePrompt = document.getElementById('choicePrompt');
const revealButton = document.getElementById('revealButton');
const audioToggleBtn = document.getElementById('audioToggleBtn');
const revealAudio = document.getElementById('revealAudio');
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
let revealAudioStarted = false;

const revealStateKey = 'klintaraRevealState';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

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

function getDistinctRhymeWords() {
  const rhymeItems = Array.from(document.querySelectorAll('.rhyme-item'));
  if (!rhymeItems.length) return 0;

  const allText = rhymeItems.map((item) => item.textContent).join(' ');
  const words = allText.match(/\p{L}+/gu) || [];
  const normalized = words.map((word) => word.toLowerCase());
  return new Set(normalized).size;
}

function showDistinctRhymeWordCount() {
  const pageName = getCurrentPageName();
  const labels = {
    'rhymes': 'Telugu Rhymes',
    'hindi-rhymes': 'Hindi Rhymes',
    'sanskrit-rhymes': 'Sanskrit Rhymes'
  };

  const label = labels[pageName];
  if (!label) return;

  document.querySelectorAll('.rhyme-word-count').forEach((counter) => counter.remove());

  const count = getDistinctRhymeWords();
  const counter = document.createElement('div');
  counter.className = 'rhyme-word-count';
  counter.textContent = `Vocabulary Count: ${count}`;
  counter.setAttribute('aria-label', `Vocabulary Count: ${count}`);

  const toc = document.querySelector('.table-of-contents');
  if (toc?.parentNode) {
    toc.parentNode.insertBefore(counter, toc);
  } else {
    const pageWrapper = document.querySelector('.feature-card') || document.querySelector('main');
    if (pageWrapper) {
      pageWrapper.prepend(counter);
    }
  }
}

window.refreshRhymeWordCount = showDistinctRhymeWordCount;

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

function createBurst(x, y) {
  const burst = document.createElement('span');
  burst.className = 'button-burst';
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;

  const particleCount = 6;
  for (let i = 0; i < particleCount; i += 1) {
    const particle = document.createElement('span');
    particle.className = 'button-burst-particle';
    const angle = (Math.PI * 2 * i) / particleCount;
    const distance = 10 + Math.random() * 12;
    particle.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
    particle.style.setProperty('--delay', `${Math.random() * 0.08}s`);
    burst.appendChild(particle);
  }

  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 420);
}

function triggerButtonBurst(event) {
  if (!event || !event.clientX || !event.clientY) return;
  createBurst(event.clientX, event.clientY);
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
  if (!nameDisplay) return;

  const letterSpans = Array.from(nameDisplay.querySelectorAll('span') || []);

  // If the reveal is complete, make the whole container revealed (fast, low-cost)
  // so the name stays visible after refresh. Otherwise, keep per-letter state
  // in case partial progress is used elsewhere.
  if (isComplete || stepIndex >= nameLetters.length) {
    nameDisplay.classList.add('revealed');
    // ensure no leftover per-letter classes
    letterSpans.forEach((span) => span.classList.remove('revealed'));
  } else {
    nameDisplay.classList.remove('revealed');
    letterSpans.forEach((span, index) => {
      span.classList.toggle('revealed', index < stepIndex);
    });
  }
}

function updateAudioToggleState() {
  if (!audioToggleBtn) return;

  const shouldShowMuted = revealAudio ? (revealAudio.muted || revealAudio.paused || !revealAudioStarted) : true;
  audioToggleBtn.classList.toggle('muted', shouldShowMuted);
  audioToggleBtn.setAttribute('aria-pressed', String(shouldShowMuted));
  audioToggleBtn.setAttribute('aria-label', shouldShowMuted ? 'Unmute audio' : 'Mute audio');
  audioToggleBtn.textContent = shouldShowMuted ? '🔈' : '🔊';
}

function startRevealAudio() {
  if (!revealAudio) return;

  if (!revealAudioStarted) {
    revealAudio.currentTime = 0;
    revealAudioStarted = true;
  }

  revealAudio.loop = true;
  revealAudio.volume = 1;

  if (revealAudio.muted) {
    updateAudioToggleState();
    return;
  }

  const playPromise = revealAudio.play();
  if (playPromise && typeof playPromise.then === 'function') {
    playPromise.catch(() => {
      revealAudioStarted = false;
      updateAudioToggleState();
    });
  }
}

function completeReveal() {
  if (isComplete) return;

  // Smooth staggered reveal: clear previous classes, force layout, then add
  // the 'revealed' class to each letter with a short stagger for a clean
  // cascading animation that feels smooth across devices.
  isComplete = true;

  const letterSpans = Array.from(nameDisplay?.querySelectorAll('span') || []);
  // Clear any previous per-letter classes and perform a single container reveal.
  letterSpans.forEach((s) => s.classList.remove('revealed'));

  // Force layout, then reveal the container — CSS handles a single smooth transition.
  void nameDisplay?.offsetWidth;
  nameDisplay?.classList.add('revealed');

  // Update internal state and show content
  stepIndex = nameLetters.length;
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
  startRevealAudio();

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

function revealFullName() {
  if (!finalReveal || !fullNameReveal || fullNameRevealed) return;

  fullNameRevealed = true;
  finalReveal.classList.remove('hidden');
  finalReveal.classList.add('visible');

  const letters = Array.from(fullNameReveal.querySelectorAll('.full-name-letter'));
  const letterDelay = 110;

  if (prefersReducedMotion) {
    letters.forEach((letter) => letter.classList.add('revealed'));
    return;
  }

  letters.forEach((letter, index) => {
    setTimeout(() => {
      letter.classList.add('revealed');
    }, index * letterDelay);
  });

}

function handleScroll() {
  if (!isComplete || fullNameRevealed) return;

  const distanceFromBottom = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY);
  if (distanceFromBottom <= 220) {
    revealFullName();
  }
}

function updateCursorGlow(event) {
  if (!cursorGlow || isTouchDevice || prefersReducedMotion) return;
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

function addTouchFeedback() {
  const interactiveElements = Array.from(document.querySelectorAll('button, a, [role="button"]'));

  interactiveElements.forEach((element) => {
    const removeTouchState = () => {
      element.classList.remove('is-touching');
    };

    element.addEventListener('touchstart', () => {
      element.classList.add('is-touching');
    }, { passive: true });

    element.addEventListener('touchend', removeTouchState, { passive: true });
    element.addEventListener('touchcancel', removeTouchState, { passive: true });
    element.addEventListener('blur', removeTouchState);
  });
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
updateAudioToggleState();
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

revealButton?.addEventListener('click', (event) => {
  if (isComplete) return;
  triggerButtonBurst(event);
  completeReveal();
});

audioToggleBtn?.addEventListener('click', (event) => {
  event.preventDefault();
  if (!revealAudio) return;

  const shouldResumeAudio = revealAudio.muted || revealAudio.paused || !revealAudioStarted;

  if (shouldResumeAudio) {
    revealAudio.muted = false;
    updateAudioToggleState();

    if (isComplete) {
      startRevealAudio();
    }
  } else {
    revealAudio.muted = true;
    revealAudio.pause();
    updateAudioToggleState();
  }
});

revealAudio?.addEventListener('play', updateAudioToggleState);
revealAudio?.addEventListener('pause', updateAudioToggleState);
revealAudio?.addEventListener('volumechange', updateAudioToggleState);

document.querySelectorAll('button, a, [role="button"]').forEach((interactiveElement) => {
  interactiveElement.addEventListener('click', (event) => {
    if (event.detail > 0 && !interactiveElement.matches(':disabled')) {
      triggerButtonBurst(event);
    }
  });
});

window.addEventListener('load', resetPagePosition);
if (!isTouchDevice && !prefersReducedMotion) {
  document.addEventListener('pointermove', updateCursorGlow, { passive: true });
  document.addEventListener('pointerleave', () => {
    if (heroPanel) {
      heroPanel.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    }
  });
}
addTouchFeedback();
updateActiveNav();
updateWithUsButtonState();
bindNavigation();
if (document.querySelector('[data-rhyme-language]')) {
  document.addEventListener('rhymesloaded', showDistinctRhymeWordCount, { once: true });
} else {
  showDistinctRhymeWordCount();
}

rhymeScrollButton?.addEventListener('click', scrollToRhymeContents);
homeScrollButton?.addEventListener('click', scrollToPageTop);
window.addEventListener('scroll', toggleScrollTopButtons, { passive: true });
toggleScrollTopButtons();

calculateBirthdayBtn?.addEventListener('click', calculateDaysSinceBirth);
birthDateInput?.addEventListener('change', calculateDaysSinceBirth);
calculateDaysSinceBirth();

document.addEventListener('scroll', handleScroll, { passive: true });

function registerOfflineApp() {
  if (!('serviceWorker' in navigator)) return;

  const scriptElement = document.querySelector('script[src*="script.js"]');
  if (!scriptElement) return;

  const serviceWorkerUrl = new URL('sw.js', scriptElement.src);
  navigator.serviceWorker.register(serviceWorkerUrl, { scope: serviceWorkerUrl.pathname.replace(/sw\.js$/, '') })
    .catch(() => {
      // Offline support is progressive enhancement; the site remains usable without it.
    });
}

window.addEventListener('load', registerOfflineApp, { once: true });
