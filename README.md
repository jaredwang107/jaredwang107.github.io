# Web Gadgets

Free online tools hosted at [web-gadgets.com](https://www.web-gadgets.com/).

## Structure

```
/
├── index.html              Web Gadgets home page
├── convertflow/
│   ├── index.html          ConvertFlow file converter
│   ├── formats.html
│   ├── features.html
│   └── pricing.html
└── _redirects              Legacy URL redirects (Cloudflare Pages)
```

## URLs

| Path | App |
|------|-----|
| `/` | Web Gadgets portal |
| `/convertflow/` | ConvertFlow |

## Deploy

Static site on **Cloudflare Pages** — no build step. Publish the repo root as the output directory.

Legacy paths (`/formats.html`, etc.) redirect to `/convertflow/...` via `_redirects`.
