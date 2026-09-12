const rhymePage = document.querySelector('[data-rhyme-language]');
let activeRhymeAudio = null;

function createRhymeElement(tagName, className, textContent) {
  const element = document.createElement(tagName);
  element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

function addRhymeAudioControl(card, rhyme, language) {
  if (language !== 'telugu') return;

  const audio = document.createElement('audio');
  audio.className = 'rhyme-audio';
  audio.preload = 'none';
  audio.src = `${language}/audio/${rhyme.id}.mp3`;
  audio.setAttribute('aria-hidden', 'true');

  const button = createRhymeElement('button', 'rhyme-audio-control', '🔈');
  button.type = 'button';
  button.setAttribute('aria-label', `Play ${rhyme.title}`);
  button.title = `Play ${rhyme.title}`;

  const updateButton = () => {
    const isPlaying = !audio.paused;
    button.textContent = isPlaying ? '🔊' : '🔈';
    button.setAttribute('aria-label', `${isPlaying ? 'Pause' : 'Play'} ${rhyme.title}`);
    button.title = `${isPlaying ? 'Pause' : 'Play'} ${rhyme.title}`;
    button.classList.toggle('is-playing', isPlaying);
  };

  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!audio.paused) {
      audio.pause();
      return;
    }

    if (activeRhymeAudio && activeRhymeAudio !== audio) activeRhymeAudio.pause();
    activeRhymeAudio = audio;
    audio.play().catch(() => updateButton());
  });

  audio.addEventListener('play', updateButton);
  audio.addEventListener('pause', updateButton);
  audio.addEventListener('ended', () => {
    activeRhymeAudio = null;
    updateButton();
  });

  card.append(button, audio);
}

function buildEditorialPage(pageData, language) {
  const languageName = language.charAt(0).toUpperCase() + language.slice(1);
  rhymePage.classList.add('rhyme-editorial-page');
  const intro = createRhymeElement('header', 'rhyme-intro');
  const kicker = createRhymeElement('p', 'rhyme-kicker');
  kicker.append(
    document.createTextNode('A little library of '),
    createRhymeElement('span', 'rhyme-language-mark', `${languageName} light`)
  );
  intro.append(kicker);

  const introGrid = createRhymeElement('div', 'rhyme-intro-grid');
  const count = String(pageData.rhymes.length).padStart(2, '0');
  const introMeta = createRhymeElement('div', 'rhyme-intro-meta');
  introMeta.append(createRhymeElement('span', 'rhyme-intro-index', `${count} Rhymes`));
  const introTitle = createRhymeElement('h1', 'rhyme-intro-title');
  introTitle.append(
    document.createTextNode('Rhymes for little'),
    createRhymeElement('em', '', 'Klintara')
  );
  introGrid.append(
    introMeta,
    introTitle,
    createRhymeElement('p', 'rhyme-intro-copy', `A handpicked collection of ${languageName} rhymes for soft mornings, bright eyes, and voices growing into their own rhythm.`)
  );
  intro.append(introGrid);

  const directory = createRhymeElement('section', 'rhyme-directory');
  directory.setAttribute('aria-labelledby', 'rhymeDirectoryTitle');
  const directoryHeading = createRhymeElement('div', 'rhyme-directory-heading');
  directoryHeading.append(
    createRhymeElement('p', 'rhyme-detail-label', 'Choose a rhyme'),
    createRhymeElement('span', 'rhyme-directory-count', `01 / ${count}`)
  );
  directoryHeading.firstChild.id = 'rhymeDirectoryTitle';
  const directoryGrid = createRhymeElement('div', 'rhyme-directory-grid');
  const toc = createRhymeElement('div', 'table-of-contents');

  pageData.rhymes.forEach((rhyme, index) => {
    const link = createRhymeElement('a', 'rhyme-directory-card', '');
    link.href = `#${rhyme.id}`;
    link.append(
      createRhymeElement('span', 'rhyme-card-number', String(index + 1).padStart(2, '0')),
      createRhymeElement('strong', 'rhyme-card-title', rhyme.title),
      createRhymeElement('span', 'rhyme-card-action', 'Read rhyme +')
    );
    directoryGrid.append(link);

    const tocLink = createRhymeElement('a', '', rhyme.title);
    tocLink.href = `#${rhyme.id}`;
    toc.append(tocLink);
  });

  directory.append(directoryHeading, directoryGrid);
  rhymePage.append(intro, directory, toc);

  pageData.rhymes.forEach((rhyme, index) => {
    const section = createRhymeElement('section', 'rhyme-entry');
    section.id = rhyme.id;
    section.setAttribute('aria-labelledby', `${rhyme.id}-title`);

    const feature = createRhymeElement('article', 'rhyme-feature');
    const identity = createRhymeElement('div', 'rhyme-identity');
    identity.append(
      createRhymeElement('div', 'rhyme-number', String(index + 1).padStart(2, '0'))
    );

    const titleBlock = createRhymeElement('div', 'rhyme-title-block');
    titleBlock.append(
      createRhymeElement('h2', '', rhyme.title)
    );
    titleBlock.lastChild.id = `${rhyme.id}-title`;

    const lyrics = createRhymeElement('div', 'rhyme-lyrics');
    lyrics.append(
      createRhymeElement('p', '', rhyme.text)
    );

    feature.append(identity, titleBlock, lyrics);
    addRhymeAudioControl(feature, rhyme, language);
    section.append(createRhymeElement('div', 'rhyme-grid-rule'), feature);
    rhymePage.append(section);
  });
}

async function loadRhymes() {
  if (!rhymePage) return;

  const language = rhymePage.dataset.rhymeLanguage;
  const indexResponse = await fetch(`${language}/index.yaml`);
  if (!indexResponse.ok) throw new Error(`Unable to load ${language}/index.yaml: ${indexResponse.status}`);

  const pageData = parseSimpleYaml(await indexResponse.text());
  const rhymeResponses = await Promise.all(pageData.rhymes.map((fileName) => fetch(`${language}/${fileName}`)));
  const failedResponse = rhymeResponses.find((response) => !response.ok);
  if (failedResponse) throw new Error(`Unable to load a ${language} rhyme: ${failedResponse.status}`);

  pageData.rhymes = await Promise.all(rhymeResponses.map(async (response) => parseSimpleYaml(await response.text())));

  document.documentElement.lang = pageData.lang;
  document.title = pageData.pageTitle;
  document.querySelector('meta[name="description"]')?.setAttribute('content', pageData.pageDescription);

  rhymePage.classList.add(pageData.className);

  if (['telugu', 'hindi', 'sanskrit'].includes(language)) {
    buildEditorialPage(pageData, language);
    window.refreshRhymeWordCount?.();
    return;
  }

  const toc = document.createElement('div');
  toc.className = 'table-of-contents';

  pageData.rhymes.forEach((rhyme) => {
    const link = document.createElement('a');
    link.href = `#${rhyme.id}`;
    link.textContent = rhyme.title;
    toc.append(link);
  });

  rhymePage.append(toc);

  pageData.rhymes.forEach((rhyme) => {
    const section = document.createElement('section');
    section.className = 'feature-section';
    section.id = rhyme.id;

    const card = document.createElement('div');
    card.className = 'feature-card';

    const title = document.createElement('h2');
    title.textContent = rhyme.title;

    const item = document.createElement('div');
    item.className = 'rhyme-item';
    item.textContent = rhyme.text;

    card.append(title, item);
    section.append(card);
    rhymePage.append(section);
  });

  window.refreshRhymeWordCount?.();
}

loadRhymes().catch((error) => {
  console.error(error);
  if (rhymePage) {
    rhymePage.textContent = 'The rhymes could not be loaded right now.';
  }
});
