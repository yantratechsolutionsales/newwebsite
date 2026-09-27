# Yantratech Solutions — Vercel Ready

Static multi-page website for Vercel.

## Deploy with Vercel Drop
1. Open https://vercel.com/drop
2. Drag this ZIP (or the extracted folder) into Vercel Drop.
3. Deploy.

The website root contains `index.html`, so `/` serves the homepage.

## GitHub + Vercel
If the files are in a Git repository, import the repository into Vercel and keep the Root Directory as `./` (or the directory containing this `index.html`). Use Framework Preset **Other**. No build command or output directory is required.

`vercel.json` enables clean URLs, so `products.html` can be visited as `/products`, `contact.html` as `/contact`, etc.
