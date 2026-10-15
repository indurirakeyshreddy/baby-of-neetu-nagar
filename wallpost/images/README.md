# Wallpost images

Place one image file here for each post. Use the same filename stem as its YAML file:

- `wallpost/posts/first-smile.yaml`
- `wallpost/images/first-smile.jpg`

In the post YAML, connect them with the image path relative to `wallpost/wallpost.html`:

```yaml
image: "images/first-smile.jpg"
text: |-
  Add the related post text here.
```

You can use `.jpg`, `.png`, or `.webp`; keep the filename and `image` path in sync.
