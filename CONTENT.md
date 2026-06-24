# Updating The Site

Use `site-data.js` as the main content file for things that change often.

## Updates

Edit the `updates` list in `site-data.js`.

```js
{
  date: "2026-07",
  title: "Update title",
  body: "A short update paragraph.",
}
```

## Photography

1. Put image files under `assets/photos/`, usually inside a folder for that section.
2. Edit `photographySections` in `site-data.js`.

```js
{
  id: "snow",
  label: "Snow",
  title: "Snow",
  folder: "assets/photos/snow/",
  photos: [
    {
      file: "photo-01.jpg",
      alt: "Short photo description",
    },
  ],
  minimumSlots: 3,
}
```

## Publishing

For a static personal site, the clean workflow is:

1. Edit files locally.
2. Preview the site in a browser.
3. Commit and push to GitHub.
4. Let GitHub Pages, Netlify, or Vercel redeploy the site.

The old browser-only local editor is not suitable for a public production site because it stores drafts only in one browser and is not a secure owner-only CMS.
