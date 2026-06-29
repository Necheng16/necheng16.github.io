# Updating The Site

Use `site-data.js` as the main content file for things that change often.

## Updates

Edit the `updates` list in `site-data.js`.

```js
{
  date: "2025-11",
  title: "Update title",
  body: "A short update paragraph.",
}
```

Past dates are fine. The site sorts updates from newest to oldest automatically.
Use `YYYY-MM` for a month-level update or `YYYY-MM-DD` if you want to display an
exact day.

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

You can rename sections freely. For example, `Snow`, `Campus`, `Travel`,
`Archive`, or any custom collection name.

## Travel

Edit `travel.countries` in `site-data.js`.

```js
{
  iso3: "FRA",
  name: "France",
  cities: [
    "Paris",
    {
      name: "Nice",
      coordinates: [7.262, 43.71],
    },
  ],
}
```

Use ISO3 country codes when possible: `FRA` for France, `CHN` for China,
`USA` for the United States, `JPN` for Japan. Places can be plain names. If
you add `coordinates: [longitude, latitude]`, the place also appears as a pin
when the country is selected.

## Publishing

For a static personal site, the clean workflow is:

1. Edit files locally.
2. Preview the site in a browser.
3. Commit and push to GitHub.
4. Let GitHub Pages redeploy the site.

Commands:

```sh
cd /Users/necheng/Documents/Self/personal-site
git status
git add .
git commit -m "Update site content"
git push
```

The old browser-only local editor is not suitable for a public production site because it stores drafts only in one browser and is not a secure owner-only CMS.
