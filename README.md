# AI4M Stockholm — website

A small static site: three pages, one stylesheet, no build step and no dependencies.
All of the text lives in plain files in `content/`, so the site can be maintained
without touching HTML.

**To change the words on the site, read [EDITING.md](EDITING.md).** It is written for
colleagues who do not work with code, and it is the only file they need. The rest of
this page is for whoever looks after the site itself.

```
content/settings.txt    Site name, menu, contact address, footer
content/home.md         Front page
content/events.md       Events page (wording around the listings)
content/resources.md    Resources page
content/calendar.txt    The events themselves

preview.command         Double-click to see the site locally

index.html              Page shells: no content, only <body data-page="…">
events.html
resources.html
assets/style.css        All styling (colours and spacing are variables at the top)
assets/markdown.js      Markdown → HTML
assets/events.js        Reads calendar.txt, draws the listings
assets/site.js          Assembles each page from the files in content/
```

## How a page is put together

Each HTML file is a shell that names itself, for instance `<body data-page="events">`.
On load, `assets/site.js` fetches `content/settings.txt` and `content/events.md`,
renders the masthead, the page body and the footer, and asks `assets/events.js` to
replace any `{{upcoming events}}`-style placeholder with a listing from
`content/calendar.txt`.

The Markdown subset is deliberately small, and the calendar format is deliberately
forgiving: anything unreadable is reported on the page, naming the event and the
problem, rather than dropped silently. Both are described from an editor's point of
view in [EDITING.md](EDITING.md).

## Previewing

Content is fetched over HTTP, so the pages must be served rather than opened from
Finder. `preview.command` serves the folder, opens a browser, and sends
`Cache-Control: no-store` so an edit is never hidden behind a cached copy.

The three `<script>` tags carry a `?v=` token. If you change anything in `assets/`,
raise the number in all three HTML files, or browsers will go on running the old
script. Nothing in `content/` needs this.

## Before going live

- `ai4m@example.se` in `content/settings.txt` — the contact and mailing-list address,
  which propagates to every page
- the seeded events in `content/calendar.txt` — replace with the real autumn programme
- room numbers and the workshop venue

## Publishing

The site is plain files and can be hosted anywhere. GitHub Pages is the easiest
arrangement for a group, because it also gives editors a browser-based way to change
the files in `content/`:

```sh
git remote add origin git@github.com:<org>/<repo>.git
git push -u origin main
```

then Settings → Pages → deploy from `main`, folder `/root`. All links are relative, so
no configuration is needed at a department URL either.
