# Photography Assets

Put future photography files anywhere under this folder, then list them in
`../../site-data.js`.

Example folders:

- `series-01/`
- `series-02/`
- `archive/`

Example file names:

- `series-01/photo-01.jpg`
- `series-02/photo-01.jpg`
- `archive/photo-01.jpg`

To rename sections or add photos, edit the `photographySections` list in
`site-data.js`:

```js
{
  id: "series-01",
  label: "Series 01",
  title: "Series 01",
  folder: "assets/photos/series-01/",
  photos: [
    {
      file: "photo-01.jpg",
      alt: "Short photo description",
    },
  ],
  minimumSlots: 3,
}
```
