# How to edit this website

Everything you might want to change lives in the **content** folder, in four plain
text files. You never need to touch HTML.

| I want to change… | Open this file |
| --- | --- |
| the front page | `content/home.md` |
| the wording on the events page | `content/events.md` |
| the resources page | `content/resources.md` |
| the events themselves | `content/calendar.txt` |
| the site name, menu, e-mail address, footer | `content/settings.txt` |

Open a file in any text editor (TextEdit, Notes, VS Code, or the pencil icon on
GitHub), change the words, save. That is the whole procedure.

---

## Seeing your changes

Double-click **preview.command** in the site folder. A window of text opens and the
site appears in your browser. Leave the window open while you work: save a file, then
reload the browser page to see the change. Close the window when you have finished.

Opening `index.html` directly from Finder will not work — the page will tell you so and
point you back here. This is a restriction browsers place on files opened from the
desktop, and it does not affect the published site.

---

## Adding an event

Open `content/calendar.txt`. Copy an existing block, paste it at the end, and change
the words. Blocks are separated by a line of three dashes.

```
---

title: Formalisation with Lean: a working introduction
speaker: Jane Doe, KTH
series: AI4M Seminar
date: 2026-09-24
time: 15:15-16:15
location: KTH, Lindstedtsvägen 25, room 3721
abstract: A hands-on introduction to interactive theorem proving in Lean 4.
link: Register https://example.com/register
```

Only `title` and `date` are needed; delete any line you do not want. A few notes:

- **Dates** are written year–month–day: `2026-09-24`. A two-day event is
  `date: 2026-11-19 to 2026-11-20`.
- **Times** are Stockholm time, written `15:15-16:15`, or just `15:15`, or left out
  altogether for an all-day entry. The summer and winter clock change is handled for you.
- **Abstracts** may run over several lines; indent the continuing lines slightly.
- **Links** may be repeated: one `link:` line for each. Write the words first and the
  address second.
- **Order does not matter.** The site sorts events by date, shows the next three on the
  front page, and moves an event down to "Past events" by itself once it is over.
- **Never delete a past event.** Leaving it in place is what keeps the archive.

If something is written in a way the site cannot read, it says so in a small box at the
top of the events page, naming the event and the problem. Nobody else's event is
affected.

---

## Adding a resource

Open `content/resources.md`. Each entry is a line beginning with a dash, holding the
title in square brackets and the web address in round brackets, with the note on the
line below:

```
- [Kevin Buzzard, *The Xena Project*](https://xenaproject.wordpress.com/)
  A long-running blog on formalising modern mathematics in Lean.
```

The note is optional. Words between `*asterisks*` come out in italics; use them for
titles of books and papers.

To start a new group of resources, copy one of the `##` lines:

```
## Community and funding
```

If you write `## Elsewhere :: Community and funding`, the words before the `::` come
out as a small grey label above the heading. The resources page does not use these; the
front page and the events page do.

---

## Changing the text of a page

The three `.md` files are ordinary prose with a few marks:

| Written like this | Comes out as |
| --- | --- |
| `# Events` | the large title at the top of the page (one per page) |
| `## Calendar :: Upcoming` | a new section, with a small grey label and a heading |
| `### Starting out` | a smaller heading inside a section |
| a blank line | a new paragraph |
| `> Everyone is welcome.` | an indented note in the margin style |
| `*emphasis*` | *emphasis* |
| `**important**` | **important** |
| `[the resources page](resources.html)` | a link |
| `{email}` | the contact address, as a working link |

The first paragraph under the title is automatically set in the larger introductory
size, and is also what search engines show under the page's name.

Three phrases fill themselves in from the calendar, and can be moved or removed like
any other line:

- `{{next events}}` — the next three events (used on the front page)
- `{{upcoming events}}` — all events still to come
- `{{past events}}` — the archive

Anything between `<!--` and `-->` is a note to yourself and never appears on the site.

---

## Changing the name, the menu, the address, the footer

Open `content/settings.txt`. It is a list of labelled lines:

```
site name: AI4M Stockholm
hosts: KTH Royal Institute of Technology · Stockholm University
email: ai4m@example.se

menu:
  About = index.html
  Events = events.html
  Resources = resources.html
```

Changing `email:` changes it everywhere on the site at once, because the pages write
`{email}` rather than the address itself.

To reorder the menu, reorder those lines. To rename a page in the menu, change the
words to the left of the `=`.

---

## Adding a whole new page

This is the only task that touches an HTML file, and it takes one change.

1. Write the text in a new file, say `content/people.md`.
2. Duplicate `events.html` in Finder and rename the copy `people.html`.
3. Open it in a text editor and change the one line near the middle that reads
   `<body data-page="events">` to `<body data-page="people">`.
4. Add `People = people.html` to the `menu:` list in `content/settings.txt`.

---

## Publishing

How the site gets onto the web depends on where it is hosted.

- **GitHub Pages.** Edit the file in the browser through GitHub's pencil icon, write a
  short line saying what you changed, and press *Commit*. The site updates itself
  within a minute. This is the easiest arrangement for a group, because nobody needs to
  install anything.
- **A department web space.** Copy the changed file — usually only something inside
  `content/` — to the server in the same way the site was first uploaded. The rest of
  the site does not need to be re-uploaded.

---

## If something looks wrong

- **The page is blank or says it could not be loaded.** You are probably looking at it
  from Finder rather than through `preview.command`. See "Seeing your changes" above.
- **A change does not show up, or the page complains about the calendar.** The browser
  is showing you an old copy. Reload while holding the Shift key, and use
  `preview.command` rather than starting a server by hand — it tells the browser not to
  keep copies.
- **A box appears saying to check `calendar.txt`.** An event has a date or a line the
  site cannot read; the box names it. Compare it with a neighbouring event.
- **An event is missing.** Check its date: if it has passed, it is now further down the
  page under "Past events".
- **A whole paragraph disappeared into a heading.** A stray `#` at the start of a line
  makes a heading. Remove it.

Nothing you can write in these files can break the site permanently. If a change looks
wrong, undo it, save, and reload.
