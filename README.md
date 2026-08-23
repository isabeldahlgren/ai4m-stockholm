# AI4M Stockholm — website

A small static site: three pages, one stylesheet, no build step, no dependencies, no
framework. All of the text lives in plain files in `content/`, so the site can be
maintained without touching HTML.

**If you are here to change the words on the site, read [EDITING.md](EDITING.md) instead.**

```
content/settings.txt    Site name, menu, contact address, footer
content/home.md         Front page
content/events.md       Events page (wording around the listings)
content/resources.md    Resources page
content/calendar.txt    The events themselves

index.html              Page shells: no content, only <body data-page="…">
events.html
resources.html

assets/style.css        All styling (colours and spacing are variables at the top)
assets/markdown.js      Markdown → HTML
assets/events.js        Reads calendar.txt, draws the listings
assets/site.js          Assembles each page from the files above

preview.command         Double-click to serve the site locally
```

## How a page is put together

Each HTML file is a shell that names itself, for instance `<body data-page="events">`.
On load, `assets/site.js` fetches `content/settings.txt` and `content/events.md`,
renders the masthead, the page body and the footer, and asks `assets/events.js` to
replace any `{{upcoming events}}`-style placeholder with a listing from
`content/calendar.txt`.

The rendered markup is the same as the hand-written HTML this site started from, so
`style.css` needs no knowledge of any of it. Two additions were made for this
arrangement: `.section__note`, for a paragraph sitting beside a wide listing, and
`.notice`, for the message shown when a content file cannot be read or an event is
written in a way the site cannot parse.

The Markdown subset is deliberately small — headings, paragraphs, notes, lists, links,
emphasis, code — with two conventions of its own: `## Label :: Heading` produces the
eyebrow label above a section heading, and a list whose every item begins with a link
is rendered as a resource list. Text is escaped before rendering, dashes and quotation
marks are made typographic, and `{email}` and other settings can be written in curly
brackets anywhere in the content.

Events are read from a forgiving `key: value` format. Unrecognised keys are treated as
continuations of the previous line, so a colon inside an abstract is harmless; dates
and times are matched by pattern, so `2026-11-19 to 2026-11-20` and `9.00` are both
understood. Anything unreadable is reported on the page rather than dropped silently.
Times are Stockholm wall-clock time, converted with an `Intl` round trip that respects
the summer/winter change.

## Previewing

Content is fetched over HTTP, so the pages need to be served rather than opened from
Finder. Double-click `preview.command`: it serves the folder on the first free port from
8000, opens a browser, and sends `Cache-Control: no-store`, so an edit is never hidden
behind a copy the browser kept. Plain `python3 -m http.server` works too, but without
those headers a browser may go on running an old `assets/*.js` — if a page reports that
a script "did not load or is an old copy", reload holding Shift.

A page opened as `file://` detects the situation and says what to do instead, and a page
whose scripts are stale still renders its text and explains itself rather than failing
blank.

The three `<script>` tags carry a `?v=` token. If you change anything in `assets/`,
raise the number in all three HTML files: browsers cache a script by its URL, and the
token is what tells them to fetch it again. Nothing in `content/` needs this — those
files are fetched with `cache: "no-cache"` and always revalidated.

## Before going live

- `ai4m@example.se` in `content/settings.txt` — the contact and mailing-list address,
  which propagates to every page
- the seeded events in `content/calendar.txt` — replace with the real autumn programme
- room numbers and the workshop venue

## Publishing

The site is plain files and can be hosted anywhere — a department web space, or
GitHub Pages:

```sh
git init && git add . && git commit -m "Initial site"
git remote add origin git@github.com:<org>/<repo>.git
git push -u origin main
```

then enable Pages in the repository settings (Settings → Pages → deploy from `main`,
folder `/root`). All links are relative, so no configuration is needed at a department
URL either. Hosting on GitHub also gives editors a browser-based way to change the
files in `content/`, which is the easiest arrangement for a group.
