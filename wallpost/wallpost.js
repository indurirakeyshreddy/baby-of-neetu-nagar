const wallpostList = document.getElementById('wallpostList');
const wallpostCount = document.getElementById('wallpostCount');

function createWallpostElement(tagName, className, textContent) {
  const element = document.createElement(tagName);
  element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

async function loadWallposts() {
  if (!wallpostList) return;

  const indexResponse = await fetch('posts/index.yaml');
  if (!indexResponse.ok) throw new Error(`Unable to load wallposts index: ${indexResponse.status}`);

  const indexData = parseSimpleYaml(await indexResponse.text());
  const postResponses = await Promise.all(indexData.posts.map((fileName) => fetch(`posts/${fileName}`)));
  const failedResponse = postResponses.find((response) => !response.ok);
  if (failedResponse) throw new Error(`Unable to load a wallpost: ${failedResponse.status}`);

  const posts = await Promise.all(postResponses.map(async (response) => parseSimpleYaml(await response.text())));
  posts.sort((firstPost, secondPost) => (Number(secondPost.order) || 0) - (Number(firstPost.order) || 0));
  document.title = indexData.pageTitle;
  document.querySelector('meta[name="description"]')?.setAttribute('content', indexData.pageDescription);
  wallpostCount.textContent = `${String(posts.length).padStart(2, '0')} ${posts.length === 1 ? 'POST' : 'POSTS'}`;

  if (!posts.length) return;
  wallpostList.replaceChildren();

  posts.forEach((post, index) => {
    const entry = createWallpostElement('article', 'wallpost-entry');
    const imageFrame = createWallpostElement('figure', 'wallpost-image-frame');
    const image = createWallpostElement('img', 'wallpost-image');
    image.src = post.image;
    image.alt = post.alt || post.title;
    image.loading = index === 0 ? 'eager' : 'lazy';
    entry.style.setProperty('--post-index', index);
    imageFrame.append(image);

    const copy = createWallpostElement('div', 'wallpost-copy-block');
    copy.append(
      createWallpostElement('p', 'wallpost-number', `Wallpost ${String(index + 1).padStart(2, '0')}`),
      createWallpostElement('h2', 'wallpost-title', post.title),
      createWallpostElement('p', 'wallpost-text', post.text)
    );
    entry.append(imageFrame, copy);
    wallpostList.append(entry);
  });
}

loadWallposts().catch((error) => {
  console.error(error);
  if (wallpostList) wallpostList.textContent = 'Wallposts could not be loaded right now.';
});
