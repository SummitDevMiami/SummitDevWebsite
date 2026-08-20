# SummitDev — marketing site

Static site. No build step, no dependencies. Plain HTML, one stylesheet, one script.
Open any `.html` file to edit it; changes are live on refresh.

```
index.html              Home
web-development.html    Web development service page
seo.html                SEO / local search service page
work.html               Portfolio (placeholder slots — see below)
about.html              About / how we work
contact.html            Free estimate form
404.html                Not found
styles.css              All styles (design tokens at the top)
main.js                 Nav drawer, form validation, form submit
favicon.svg             Browser tab icon
assets/logo-mark.svg    The summit mark on its own
```

## Design system

Everything is driven by the tokens in the `:root` block at the top of `styles.css`.

| Token | Value | Use |
|---|---|---|
| `--ink-900` | `#07080a` | Page ground — the same near-black the logo sits on |
| `--blue-500` | `#2f80c9` | Brand blue, buttons and links |
| `--blue-300` | `#8cc4ee` | Light blue, section labels and accents |
| `--snow` | `#f4f8fb` | Headings |
| `--r-1` / `--r-2` | 2px / 4px | The only two radii — kept small deliberately |
| `--s-1` … `--s-9` | 4px … 96px | The only spacing values used anywhere |

Type is **Archivo** (variable width — headings run wide at `wdth 112` to echo the
logo wordmark) and **IBM Plex Mono** for labels, both from Google Fonts.

Gradients appear **only** inside the logo mark. No gradient text, no glow — that
was a deliberate call so the site does not read as generated.

## Contact details

These are live everywhere on the site — header, footer, every call-to-action, the
contact page, the estimate form, and the business schema in `index.html`:

- **Phone** — (786) 830-0888, linked as `tel:+17868300888`
- **Email** — SummitDevSupport@gmail.com
- **Domain** — `https://summitdev.dev`, set in every canonical and og tag,
  `sitemap.xml`, `robots.txt`, and the business schema

To change any of them later, search and replace across `*.html` and `main.js`. The
phone appears in three forms: display `(786) 830-0888`, link `tel:+17868300888`, and
schema `+1-786-830-0888`.

> **`.dev` is HTTPS-only.** The whole TLD sits on the browsers' HSTS preload list, so
> `http://summitdev.dev` will not load at all — there is no insecure fallback to
> misconfigure. Vercel issues the certificate automatically, so this needs nothing
> from you; just never link to the site with `http://`.

## Still to do before launch

| Placeholder | Where | Replace with |
|---|---|---|
| `Fort Lauderdale, FL` | footer, about page, schema | Real city — note 786 is a Miami-Dade area code |
| `Mon–Fri, 9–6 ET` | footer, contact page | Real hours |

Also:

1. **Portfolio.** `work.html` ships with three empty project slots and a comment
   block explaining how to fill each one. Replace them with real projects or delete
   the section — do not publish the placeholder text.
2. **Social image.** Save a 1200×630 PNG to `assets/og-image.png`. The logo on the
   black background works well.
3. **Send one real test through the estimate form** after deploying, to confirm
   delivery and to train Gmail not to file it as spam.

## The logo

Every logo on the site — 13 of them across the 7 pages — points at the single file
`assets/logo-mark.svg`, a vector redraw of the summit mark. **Change that one file and
every page updates.** The wordmark next to it ("Summit**Dev**" plus the tagline) is live
HTML text set in Archivo, so it stays sharp and selectable at any size.

To use a raster version of the logo instead, drop it in `assets/` and point the image
tags at it:

```bash
# from this folder — swaps the mark on all 7 pages at once
sed -i 's|assets/logo-mark.svg|assets/logo.png|g' *.html
```

Then adjust `width`/`height` on those `<img>` tags to match the file's aspect ratio.
An SVG is the better choice if you have one — it stays crisp on retina screens and
weighs about 1 KB.

## The estimate form → SummitDevSupport@gmail.com

**This is wired and live.** `contact.html` submits through `main.js`, which posts to
Web3Forms, which delivers to SummitDevSupport@gmail.com. Nothing further to set up.

Each request arrives with the subject **"Estimate request — [business name]"** and the
sender's own address set as reply-to, so hitting reply in Gmail goes straight back to
the customer. All nine form fields come through: name, business, email, phone, city,
service, current website, timeline, and the project notes.

The access key lives in `main.js` and is **meant to be public** — Web3Forms' docs say
so directly, since it has to ship in client-side code to work. It is tied to the email
address it was issued for, so it can only ever deliver to you. Committing it and
deploying it is fine.

Three layers of spam handling: a honeypot field in the form (stripped from the payload
before sending), Web3Forms' own server-side filtering, and required-field validation
that runs before anything is sent.

**Test it once on the live site.** Submit a real inquiry after deploying and confirm
the email arrives — check spam the first time and mark it "not spam" so later ones land
in the inbox. Local testing is not conclusive here.

**To move delivery elsewhere later:** clear `WEB3FORMS_KEY` and set `FORM_ENDPOINT` to
any endpoint that accepts a JSON `POST` — Formspree, Basin, Netlify Forms, or your own
serverless route. With both empty, the form falls back to opening the visitor's mail
client, pre-filled.

Prefer a different service? Leave `WEB3FORMS_KEY` empty and set `FORM_ENDPOINT` to any
endpoint that accepts a JSON `POST` — Formspree, Basin, Netlify Forms, or your own
serverless route. The form posts the raw fields as JSON in that case.

**Test it after wiring:** submit the form on the live site once and confirm the email
arrives — check the spam folder the first time, and mark it "not spam" so later ones
land in the inbox.

## Running it locally

```bash
python -m http.server 4321
```

Then open `http://localhost:4321`. Opening the files directly with `file://` works
too, but a server matches production more closely.

## Deploying to Vercel

There is no build step, so Vercel serves this folder as static files. No framework
preset, no build command, no output directory — leave all three blank if it asks.

**Option A — CLI, fastest:**

```bash
npx vercel --prod
```

**Option B — Git, better long term.** This folder is already a git repo with an
initial commit. Create an empty repo on GitHub, push to it, then in Vercel choose
*Add New → Project → Import*. After that every `git push` deploys automatically.

```bash
git remote add origin https://github.com/YOUR-USERNAME/summitdev-website.git
git push -u origin main
```

**Then, in the Vercel dashboard:** add your domain under *Settings → Domains* and
point the registrar's nameservers (or an A/CNAME record) at Vercel. HTTPS is issued
automatically.

### What `vercel.json` does

- **Security headers** on every response: `nosniff`, `SAMEORIGIN` framing,
  `strict-origin-when-cross-origin` referrer, a locked-down `Permissions-Policy`,
  and HSTS.
- **Caching split by file type.** HTML, CSS, and JS are set to `max-age=0,
  must-revalidate`; images and fonts get a day plus a week of
  `stale-while-revalidate`. This matters here: the filenames never change (there is
  no build hashing them), so a long cache on `styles.css` would leave returning
  visitors stuck on an old stylesheet for as long as the cache lasts.
- **`cleanUrls` is off** so the deployed URLs match the `.html` links in the pages
  exactly — no redirect on every click, and the site behaves the same locally as it
  does live. Turning it on would serve `/seo` instead of `/seo.html`, but then every
  internal link would take a 308 redirect first unless all the hrefs, canonical tags,
  and `sitemap.xml` were rewritten to match.
- `404.html` is picked up automatically for unknown paths.

`.vercelignore` keeps `.claude/` and the readmes out of the deployment.

### Other hosts

Netlify, Cloudflare Pages, and GitHub Pages all work the same way — point them at
this folder with no build command. Only `vercel.json` is Vercel-specific; the
equivalents are `netlify.toml` or `_headers`.
