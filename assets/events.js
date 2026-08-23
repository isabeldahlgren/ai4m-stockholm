/* ---------------------------------------------------------------
   The calendar: reads content/calendar.txt and draws the listings.

   To add or change an event, edit content/calendar.txt. Nothing in
   this file needs to be touched.
   --------------------------------------------------------------- */

(function (global) {
  "use strict";

  var TZ = "Europe/Stockholm";

  /* Which words in calendar.txt mean what. Anything else is treated as
     a continuation of the previous line, so a stray colon in an
     abstract does no harm. */
  var FIELDS = {
    "title": "title",
    "speaker": "speaker",
    "speakers": "speaker",
    "series": "series",
    "date": "date",
    "dates": "date",
    "time": "time",
    "times": "time",
    "location": "location",
    "place": "location",
    "room": "location",
    "venue": "location",
    "abstract": "abstract",
    "description": "abstract",
    "summary": "abstract",
    "link": "links",
    "links": "links",
    "url": "links",
    "register": "links"
  };

  /* --- reading calendar.txt --------------------------------------- */

  function normalizeTime(value) {
    var m = /^(\d{1,2})[:.](\d{2})$/.exec(value);
    return m ? ("0" + m[1]).slice(-2) + ":" + m[2] : null;
  }

  function parseLink(value) {
    var m = /^(.*?)\s*[—–|-]?\s*((?:https?:\/\/|mailto:|\/|\.)\S+)\s*$/.exec(value);
    if (!m) return null;
    var url = m[2];
    var text = m[1].trim() || url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return { text: text, url: url };
  }

  function buildEvent(fields, position, problems) {
    if (!fields.title) {
      problems.push("The event in position " + position + " of calendar.txt has no title line.");
      return null;
    }
    var where = "\u201c" + fields.title + "\u201d";

    var dates = (fields.date || "").match(/\d{4}-\d{1,2}-\d{1,2}/g) || [];
    if (!dates.length) {
      problems.push("The event " + where + " has no usable date. Write the date as, for example, 2026-09-24.");
      return null;
    }
    dates = dates.map(function (d) {
      var p = d.split("-");
      return p[0] + "-" + ("0" + p[1]).slice(-2) + "-" + ("0" + p[2]).slice(-2);
    });

    var rawTimes = (fields.time || "").match(/\d{1,2}[:.]\d{2}/g) || [];
    var times = rawTimes.map(normalizeTime).filter(Boolean);
    if (fields.time && !times.length) {
      problems.push("The event " + where + " has a time that could not be read. Write the time as, for example, 15:15-16:15.");
    }

    var start = dates[0] + (times[0] ? "T" + times[0] : "");
    var end = null;
    if (dates[1]) end = dates[1] + (times[1] ? "T" + times[1] : (times[0] ? "T" + times[0] : ""));
    else if (times[1]) end = dates[0] + "T" + times[1];

    var links = (fields.links || []).map(parseLink).filter(Boolean);

    return {
      title: fields.title,
      speaker: fields.speaker || "",
      series: fields.series || "",
      location: fields.location || "",
      abstract: fields.abstract || "",
      start: start,
      end: end,
      links: links
    };
  }

  function parseCalendar(text) {
    var problems = [];
    var chunks = String(text).replace(/\r\n?/g, "\n").split(/^[ \t]*-{3,}[ \t]*$/m);
    var events = [];

    chunks.forEach(function (chunk, index) {
      if (!/\S/.test(chunk.replace(/^[ \t]*#.*$/gm, ""))) return;
      var fields = global.Site.readFields(chunk, FIELDS);
      if (!Object.keys(fields).length) return;
      var event = buildEvent(fields, index + 1, problems);
      if (event) events.push(event);
    });

    return { events: events, problems: problems };
  }

  /* --- dates ------------------------------------------------------- */

  function fmt(date, opts) {
    return new Intl.DateTimeFormat("en-GB", Object.assign({ timeZone: TZ }, opts)).format(date);
  }

  /* Read the wall-clock time a date shows in Stockholm, as a UTC timestamp. */
  function stockholmClock(date) {
    var p = {};
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    }).formatToParts(date).forEach(function (part) { p[part.type] = part.value; });
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
  }

  /* Interpret "2026-09-17T15:15" as wall-clock time in Stockholm, honouring
     the summer/winter clock change. */
  function parseStockholm(value) {
    if (/(Z|[+-]\d{2}:?\d{2})$/.test(value)) return new Date(value);
    var target = new Date((/T/.test(value) ? value : value + "T00:00") + "Z").getTime();
    var guess = target;
    for (var i = 0; i < 3; i++) {
      guess += target - stockholmClock(new Date(guess));
    }
    return new Date(guess);
  }

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* Date pieces in Stockholm time, with consistent three-letter months. */
  function dateParts(date) {
    var parts = {};
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ, weekday: "short", day: "numeric", month: "numeric", year: "numeric"
    }).formatToParts(date).forEach(function (part) { parts[part.type] = part.value; });
    return {
      weekday: parts.weekday,
      day: String(Number(parts.day)),
      month: MONTHS[Number(parts.month) - 1],
      year: parts.year
    };
  }

  /* "Thu 10 Sep 2026" */
  function dateLine(date) {
    var p = dateParts(date);
    return p.weekday + " " + p.day + " " + p.month + " " + p.year;
  }

  /* "20 Nov" */
  function monthDay(date) {
    var p = dateParts(date);
    return p.day + " " + p.month;
  }

  function sameDay(a, b) {
    return fmt(a, { dateStyle: "short" }) === fmt(b, { dateStyle: "short" });
  }

  /* --- drawing ----------------------------------------------------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function renderEvent(ev, isPast) {
    var item = el("li", "event" + (isPast ? " event--past" : ""));

    var when = el("div", "event__when");
    when.appendChild(el("span", "event__date", dateLine(ev.start)));

    var second = "";
    if (ev.end && !sameDay(ev.start, ev.end)) {
      second = "until " + monthDay(ev.end);
    } else if (!ev.allDay) {
      second = fmt(ev.start, { hour: "2-digit", minute: "2-digit", hour12: false });
      if (ev.end) second += "–" + fmt(ev.end, { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    if (second) when.appendChild(el("span", "event__time", second));
    item.appendChild(when);

    var body = el("div", "event__body");
    var heading = el("h3", "event__title", ev.title);
    if (ev.series) heading.appendChild(el("span", "tag", ev.series));
    body.appendChild(heading);

    if (ev.speaker) body.appendChild(el("span", "event__speaker", ev.speaker));
    if (ev.location) body.appendChild(el("div", "event__meta", ev.location));
    if (ev.abstract) body.appendChild(el("p", "event__abstract", ev.abstract));

    if (ev.links && ev.links.length) {
      var links = el("div", "event__links");
      ev.links.forEach(function (link) {
        var a = el("a", null, link.text);
        a.href = link.url;
        links.appendChild(a);
      });
      body.appendChild(links);
    }

    item.appendChild(body);
    return item;
  }

  function partition(events) {
    var now = Date.now();
    var parsed = events.map(function (ev) {
      var copy = Object.assign({}, ev);
      copy.start = parseStockholm(ev.start);
      copy.end = ev.end ? parseStockholm(ev.end) : null;
      copy.allDay = !/T/.test(ev.start);
      return copy;
    });
    return {
      upcoming: parsed
        .filter(function (ev) { return (ev.end || ev.start).getTime() >= now; })
        .sort(function (a, b) { return a.start - b.start; }),
      past: parsed
        .filter(function (ev) { return (ev.end || ev.start).getTime() < now; })
        .sort(function (a, b) { return b.start - a.start; })
    };
  }

  var SLOTS = {
    nextevents: { list: "upcoming", limit: 3, past: false, empty: "No events are scheduled at the moment. Please check back shortly." },
    upcomingevents: { list: "upcoming", limit: 0, past: false, empty: "No events are scheduled at the moment. Please check back shortly." },
    events: { list: "upcoming", limit: 0, past: false, empty: "No events are scheduled at the moment. Please check back shortly." },
    pastevents: { list: "past", limit: 0, past: true, empty: "Past events will be listed here." }
  };

  /* Replace every {{...events}} placeholder on the page with a listing. */
  function fill(root, calendarText) {
    var slots = root.querySelectorAll("[data-slot]");
    if (!slots.length) return { problems: [] };

    var read = parseCalendar(calendarText || "");
    var split = partition(read.events);

    Array.prototype.forEach.call(slots, function (node) {
      var spec = SLOTS[node.getAttribute("data-slot")];
      if (!spec) {
        read.problems.push("A content file asks for {{" + node.getAttribute("data-slot") +
          "}}, which the site does not know. Use {{upcoming events}}, {{past events}} or {{next events}}.");
        return;
      }
      var limit = Number(node.getAttribute("data-limit")) || spec.limit;
      var list = split[spec.list];
      var items = limit ? list.slice(0, limit) : list;

      if (!items.length) {
        node.replaceWith(el("p", "empty", spec.empty));
        return;
      }
      var ul = el("ul", "events");
      items.forEach(function (ev) { ul.appendChild(renderEvent(ev, spec.past)); });
      node.replaceWith(ul);
    });

    return { problems: read.problems };
  }

  global.Events = { fill: fill, parseCalendar: parseCalendar, parseStockholm: parseStockholm };
})(window);
