/* ---------------------------------------------------------------
   Builds each page from the text files in content/.

   Every page is the same shell: this file reads content/settings.txt
   for the name, menu and footer, reads the content file belonging to
   the page, and puts the result on the screen.

   Nothing here needs editing to change the site's text.
   --------------------------------------------------------------- */

(function (global) {
  "use strict";

  var CONTENT = "content/";

  /* --- reading "key: value" files --------------------------------- */

  /* Reads the simple format used by settings.txt and calendar.txt.

     A line "key: value" starts a field. An indented line continues the
     field above it. Lines beginning with # are ignored. When a list of
     permitted keys is given, any other line is treated as a
     continuation, so a colon inside a sentence causes no trouble. */
  function readFields(text, allowed) {
    var out = {}, current = null;

    String(text).replace(/\r\n?/g, "\n").split("\n").forEach(function (raw) {
      if (/^\s*#/.test(raw)) return;
      if (!raw.trim()) { current = null; return; }

      var indented = /^[ \t]/.test(raw);
      var m = indented ? null : /^([A-Za-z][A-Za-z0-9 _-]{0,30}?)\s*:\s*(.*)$/.exec(raw);
      var key = m ? global.Markdown.normKey(m[1]) : null;
      var canonical = key ? (allowed ? allowed[key] : key) : null;

      if (canonical) {
        current = canonical;
        var value = m[2].trim();
        if (canonical === "links") {
          out.links = out.links || [];
          if (value) out.links.push(value);
        } else {
          out[canonical] = value;
        }
        return;
      }

      if (!current) return;
      var line = raw.trim();
      if (current === "links") { out.links.push(line); return; }
      out[current] = out[current] ? out[current] + (allowed ? " " : "\n") + line : line;
    });

    return out;
  }

  /* "About = index.html" lines into [{ name, url }]. */
  function readList(value, settings) {
    return String(value || "").split("\n").map(function (line) {
      var m = /^(.*?)\s*=\s*(.*)$/.exec(line.trim());
      if (!m || !m[1]) return null;
      return { name: m[1].trim(), url: substitute(m[2].trim(), settings) };
    }).filter(Boolean);
  }

  /* Replaces {email} and any other setting written in curly brackets. */
  function substitute(text, settings) {
    return String(text).replace(/\{\s*([a-z][a-z0-9 _-]*?)\s*\}/gi, function (m, name) {
      var value = settings[global.Markdown.normKey(name)];
      return typeof value === "string" ? value : m;
    });
  }

  /* --- the parts every page shares --------------------------------- */

  function currentFile() {
    var file = global.location.pathname.split("/").pop();
    return file || "index.html";
  }

  function esc(s) { return global.Markdown.escapeHtml(s); }
  function attr(s) { return global.Markdown.escapeAttr(s); }
  function text(s) { return global.Markdown.typography(esc(s)); }

  function mastheadHtml(settings) {
    var here = currentFile();
    var menu = readList(settings.menu, settings).map(function (item) {
      var current = item.url.split("/").pop() === here ? ' aria-current="page"' : "";
      return '<a href="' + attr(item.url) + '"' + current + ">" + text(item.name) + "</a>";
    }).join("\n        ");

    return '<div class="wrap masthead__inner">\n' +
      '      <a class="wordmark" href="index.html">\n' +
      '        <span class="wordmark__name">' + text(settings["site name"] || "") + "</span>\n" +
      '        <span class="wordmark__hosts">' + text(settings.hosts || "") + "</span>\n" +
      "      </a>\n" +
      '      <nav class="nav" aria-label="Main">\n        ' + menu + "\n      </nav>\n    </div>";
  }

  function footerHtml(settings) {
    var lines = String(settings.footer || "").split("\n").map(text).join("<br>\n        ");
    var links = readList(settings["footer links"], settings).map(function (item) {
      return '<a href="' + attr(item.url) + '">' + text(item.name) + "</a>";
    }).join("\n        ");

    return '<div class="wrap footer__inner">\n' +
      "      <div>\n        " + lines + "\n      </div>\n" +
      '      <div class="footer__links">\n        ' + links + "\n      </div>\n    </div>";
  }

  /* --- messages when something is wrong ---------------------------- */

  function notice(title, lines) {
    return '<div class="notice"><p class="notice__title">' + esc(title) + "</p><ul>" +
      lines.map(function (line) { return "<li>" + esc(line) + "</li>"; }).join("") + "</ul></div>";
  }

  function showFatal(message) {
    var main = document.getElementById("content");
    if (!main) return;
    var hint = global.location.protocol === "file:"
      ? ["The address in the browser starts with file://, which stops the browser from reading the text files in the content folder.",
         "Open the site folder and double-click preview.command instead. It opens the site at http://localhost:8000, where everything works.",
         "Once the site is published on a web server, this does not arise."]
      : ["Reload the page while holding the Shift key. A browser sometimes keeps an old copy of a file, and that is the commonest cause.",
         "If that does not help, check that the content folder sits next to this page and contains settings.txt and the page's own text file.",
         "The exact problem was: " + message];
    document.title = "AI4Math Stockholm";
    main.innerHTML = '<div class="hero prose"><h1>The page could not be loaded</h1>' +
      notice("What to do", hint) + "</div>";
  }

  /* --- putting a page together -------------------------------------- */

  function fetchText(path) {
    return fetch(path, { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error(path + " could not be read (" + res.status + ")");
      return res.text();
    });
  }

  function setMeta(name, value) {
    var tag = document.querySelector('meta[name="' + name + '"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", value);
  }

  function build(page, settings, markdown, calendar) {
    var siteName = settings["site name"] || "";
    var vars = {};
    Object.keys(settings).forEach(function (key) {
      if (typeof settings[key] === "string" && key !== "menu" && key !== "footer links") vars[key] = settings[key];
    });

    document.getElementById("masthead").innerHTML = mastheadHtml(settings);
    document.getElementById("site-footer").innerHTML = footerHtml(settings);

    var rendered = global.Markdown.renderPage(markdown, vars);
    var main = document.getElementById("content");
    main.innerHTML = rendered.html;

    document.title = (page === "home" || !rendered.title)
      ? siteName
      : rendered.title + " — " + siteName;
    if (rendered.lede) setMeta("description", rendered.lede.replace(/\s+/g, " ").trim());

    var problems = global.Events
      ? global.Events.fill(main, calendar).problems
      : ["The calendar could not be drawn, because assets/events.js did not load or is an old copy. " +
         "Reload the page while holding the Shift key."];
    if (problems.length) {
      main.insertAdjacentHTML("afterbegin",
        notice(global.Events ? "Please check content/calendar.txt" : "The calendar is missing", problems));
    }
  }

  function init() {
    var page = document.body.getAttribute("data-page") || "home";

    Promise.all([
      fetchText(CONTENT + "settings.txt"),
      fetchText(CONTENT + page + ".md"),
      fetchText(CONTENT + "calendar.txt").catch(function () { return ""; })
    ]).then(function (files) {
      build(page, readFields(files[0]), files[1], files[2]);
    }).catch(function (error) {
      showFatal(error && error.message ? error.message : String(error));
    });
  }

  global.Site = { readFields: readFields, init: init };

  document.addEventListener("DOMContentLoaded", init);
})(window);
