# BABY-OF-NEETU-NAGAR

Static site for the BABY-OF-NEETU-NAGAR experience.

## GitHub Pages note

This project uses relative asset paths so it can render correctly when published from the repository root.

## Install as an app

The site is a Progressive Web App. After opening it from GitHub Pages, visitors can use their browser's **Add to Home Screen** or **Install app** action. The app shell, rhyme indexes, styles, scripts, and visited rhyme data are cached for offline use.

The service worker requires HTTPS in production, which GitHub Pages provides. It does not run from a `file://` URL.

## Optional reminders

Browser reminders require explicit notification permission and a push-notification service. The current PWA intentionally does not request notification permission or send reminders. A future reminders feature should use Firebase Cloud Messaging or another push provider with a server-side scheduler.

## Wallposts

Add image files under `wallpost/images/`. Create a YAML file under `wallpost/posts/` for each post, then add its filename to the `posts` list in `wallpost/posts/index.yaml`:

```yaml
posts:
	- first-note.yaml
```

Each post file uses this format. Image paths are relative to `wallpost/wallpost.html`:

```yaml
id: "first-note"
order: 10
title: "A little moment"
image: "images/first-note.jpg"
alt: "Describe the image"
text: |-
	Add the post text here.
	Separate lines are preserved.
```

Posts are sorted by `order`, highest number first. Give a newer post a higher number to place it on top; using values such as 10, 20, and 30 leaves room to insert posts later.
