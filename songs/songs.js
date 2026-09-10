const songsPage = document.querySelector('[data-song-language]');
const songsScrollTop = document.getElementById('songsScrollTop');
const availableAudioSongs = new Set([
  'aura-ammaka-chella',
  'vidhatha-talapuna',
  'orey-aanjaneyulu',
  'vaa-rayil-vida'
]);
let activeSongAudio = null;

function updateSongsScrollButton() {
  songsScrollTop?.classList.toggle('visible', window.scrollY > 360);
}

songsScrollTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
window.addEventListener('scroll', updateSongsScrollButton, { passive: true });
updateSongsScrollButton();

function createSongElement(tagName, className, textContent) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = textContent;
  return element;
}

function addSongAudioControl(feature, song, language) {
  if (!['telugu', 'tamil'].includes(language) || !availableAudioSongs.has(song.id)) return;

  const audio = document.createElement('audio');
  audio.className = 'songs-audio';
  audio.preload = 'none';
  audio.src = `${language}/audio/${song.id}.mp3`;
  audio.setAttribute('aria-hidden', 'true');

  const button = createSongElement('button', 'songs-audio-control', '🔈');
  button.type = 'button';
  button.setAttribute('aria-label', `Play ${song.title}`);
  button.title = `Play ${song.title}`;

  const updateButton = () => {
    const isPlaying = !audio.paused;
    button.textContent = isPlaying ? '🔊' : '🔈';
    button.setAttribute('aria-label', `${isPlaying ? 'Pause' : 'Play'} ${song.title}`);
    button.title = `${isPlaying ? 'Pause' : 'Play'} ${song.title}`;
    button.classList.toggle('is-playing', isPlaying);
  };

  button.addEventListener('click', () => {
    if (!audio.paused) {
      audio.pause();
      return;
    }

    if (activeSongAudio && activeSongAudio !== audio) activeSongAudio.pause();
    activeSongAudio = audio;
    audio.play().catch(() => updateButton());
  });

  audio.addEventListener('play', updateButton);
  audio.addEventListener('pause', updateButton);
  audio.addEventListener('ended', () => {
    activeSongAudio = null;
    updateButton();
  });

  feature.append(button, audio);
}

async function loadSongs() {
  if (!songsPage) return;

  const language = songsPage.dataset.songLanguage;
  const dataVersion = '20260907-6';
  const indexResponse = await fetch(`${language}/index.json?v=${dataVersion}`);
  if (!indexResponse.ok) throw new Error(`Unable to load ${language} songs index: ${indexResponse.status}`);

  const indexData = await indexResponse.json();
  const songResponses = await Promise.all(indexData.songs.map((fileName) => fetch(`${language}/${fileName}?v=${dataVersion}`)));
  const failedResponse = songResponses.find((response) => !response.ok);
  if (failedResponse) throw new Error(`Unable to load a ${language} song: ${failedResponse.status}`);

  const songs = await Promise.all(songResponses.map((response) => response.json()));
  document.documentElement.lang = indexData.lang;
  document.title = indexData.pageTitle;

  songsPage.classList.add('rhyme-editorial-page', `${language}-text`);

  const intro = createSongElement('header', 'rhyme-intro', '');
  const kicker = createSongElement('p', 'rhyme-kicker', '');
  kicker.append(
    document.createTextNode('A little library of '),
    createSongElement('span', 'rhyme-language-mark', `${indexData.languageName} Light`)
  );
  const introGrid = createSongElement('div', 'rhyme-intro-grid', '');
  const introMeta = createSongElement('div', 'rhyme-intro-meta', '');
  introMeta.append(createSongElement('span', 'rhyme-intro-index', `${String(songs.length).padStart(2, '0')} Songs`));
  const introTitle = createSongElement('h1', 'rhyme-intro-title', '');
  const introTitleLead = createSongElement('span', 'songs-intro-title-lead', `${language === 'telugu' || language === 'tamil' ? '' : `${indexData.languageName} `}Songs for little`);
  introTitle.append(introTitleLead, createSongElement('em', '', 'Klintara'));
  introGrid.append(
    introMeta,
    introTitle,
    createSongElement('p', 'rhyme-intro-copy', indexData.description)
  );
  intro.append(kicker, introGrid);

  const directory = createSongElement('section', 'rhyme-directory', '');
  const directoryHeading = createSongElement('div', 'rhyme-directory-heading', '');
  directoryHeading.append(createSongElement('p', 'rhyme-detail-label', 'Choose a song'), createSongElement('span', 'rhyme-directory-count', `01 / ${String(songs.length).padStart(2, '0')}`));
  const directoryGrid = createSongElement('div', 'rhyme-directory-grid', '');
  directory.append(directoryHeading, directoryGrid);

  const library = createSongElement('div', 'songs-library', '');
  library.setAttribute('aria-label', `${indexData.languageName} songs`);

  songs.forEach((song, index) => {
    const directoryCard = createSongElement('a', 'rhyme-directory-card', '');
    directoryCard.href = `#${song.id}`;
    directoryCard.append(
      createSongElement('span', 'rhyme-card-number', String(index + 1).padStart(2, '0')),
      createSongElement('strong', 'rhyme-card-title', song.title),
      createSongElement('span', 'rhyme-card-action', 'Sing along +')
    );
    directoryGrid.append(directoryCard);

    const entry = createSongElement('section', 'rhyme-entry', '');
    entry.id = song.id;
    const feature = createSongElement('article', 'rhyme-feature', '');
    const identity = createSongElement('div', 'rhyme-identity', '');
    identity.append(createSongElement('div', 'rhyme-number', String(index + 1).padStart(2, '0')));
    const titleBlock = createSongElement('div', 'rhyme-title-block', '');
    titleBlock.append(createSongElement('h2', '', song.title));
    const lyrics = createSongElement('div', 'rhyme-lyrics', '');
    lyrics.append(createSongElement('p', '', song.text));
    feature.append(identity, titleBlock, lyrics);
    addSongAudioControl(feature, song, language);
    entry.append(createSongElement('div', 'rhyme-grid-rule', ''), feature);
    library.append(entry);
  });

  songsPage.append(intro, directory, library);
}

loadSongs().catch((error) => {
  console.error(error);
  if (songsPage) songsPage.textContent = 'The songs could not be loaded right now.';
});