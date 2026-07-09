const nameDisplay = document.getElementById('nameDisplay');
const storySection = document.getElementById('storySection');
const finalReveal = document.getElementById('finalReveal');
const fullNameReveal = document.getElementById('fullNameReveal');
const cursorGlow = document.getElementById('cursorGlow');
const heroPanel = document.querySelector('.hero-panel');
const sparkles = document.getElementById('sparkles');
const choiceButtons = document.getElementById('choiceButtons');
const choicePrompt = document.getElementById('choicePrompt');
const choiceStatus = document.getElementById('choiceStatus');

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

function renderChoices() {
  if (!choiceButtons) return;

  const [correctLetter, otherLetter] = optionSets[stepIndex];
  const options = [correctLetter, otherLetter].sort(() => Math.random() - 0.5);

  choiceButtons.innerHTML = '';

  options.forEach((letter) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-btn';
    button.innerHTML = `<span class="option-letter">${letter}</span><span class="option-label">${letter === correctLetter ? 'Reveal this light' : 'Try another path'}</span>`;
    button.addEventListener('click', () => handleChoice(letter, letter === correctLetter, button));
    choiceButtons.appendChild(button);
  });


  if (choiceStatus) {
    choiceStatus.textContent = stepIndex === 0
      ? 'The first spark is waiting.'
      : `The name is glowing with ${stepIndex} letter${stepIndex === 1 ? '' : 's'}.`;
  }
}

function handleChoice(selectedLetter, isCorrect, button) {
  if (isComplete) return;

  if (!isCorrect) {
    button.classList.add('shake');
    setTimeout(() => button.classList.remove('shake'), 350);
    if (choiceStatus) {
      choiceStatus.textContent = 'That path is not the next light. Choose again.';
    }
    return;
  }

  if (choiceStatus) {
    choiceStatus.textContent = 'The blessing has begun to shine..!';
  }

  stepIndex += 1;
  updateNameDisplay();

  if (stepIndex >= nameLetters.length) {
    isComplete = true;
    if (choicePrompt) {
      choicePrompt.textContent = 'Lovely — That\'s incredibly unique!';
    }
    if (choiceButtons) {
      choiceButtons.innerHTML = '';
    }
    storySection?.classList.remove('hidden');
    storySection?.classList.add('visible');

    // Trigger celebration after final reveal animation completes
    setTimeout(() => {
      startKlintaraCelebration();
    }, 300);

    return;
  }

  renderChoices();
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

function resetPagePosition() {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

resetPagePosition();
createSparkles();
buildFullNameReveal();
updateNameDisplay();
renderChoices();

window.addEventListener('load', resetPagePosition);
document.addEventListener('pointermove', updateCursorGlow, { passive: true });
document.addEventListener('pointerleave', () => {
  if (heroPanel) {
    heroPanel.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  }
});
document.addEventListener('scroll', handleScroll, { passive: true });
