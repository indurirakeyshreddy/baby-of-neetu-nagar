const rhymePage = document.querySelector('[data-rhyme-language]');

async function loadRhymes() {
  if (!rhymePage) return;

  const language = rhymePage.dataset.rhymeLanguage;
  const indexResponse = await fetch(`${language}/index.json`);
  if (!indexResponse.ok) throw new Error(`Unable to load ${language}/index.json: ${indexResponse.status}`);

  const pageData = await indexResponse.json();
  const rhymeResponses = await Promise.all(pageData.rhymes.map((fileName) => fetch(`${language}/${fileName}`)));
  const failedResponse = rhymeResponses.find((response) => !response.ok);
  if (failedResponse) throw new Error(`Unable to load a ${language} rhyme: ${failedResponse.status}`);

  pageData.rhymes = await Promise.all(rhymeResponses.map((response) => response.json()));

  document.documentElement.lang = pageData.lang;
  document.title = pageData.pageTitle;
  document.querySelector('meta[name="description"]')?.setAttribute('content', pageData.pageDescription);

  rhymePage.classList.add(pageData.className);
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
