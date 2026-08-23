/* ---------------------------------------------------------------
   A small Markdown renderer, written for this site.

   You should not need to open this file. It turns the text files in
   content/ into the pages you see: headings, paragraphs, notes,
   links and lists, with proper dashes and quotation marks.
   --------------------------------------------------------------- */

(function (global) {
  "use strict";

  /* A character that cannot appear in the text, used to park pieces of
     finished HTML while the rest of a line is being processed. */
  var MARK = "\u0000";

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, "&quot;");
  }

  function normKey(name) {
    return String(name).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function lookup(vars, name) {
    if (!vars) return null;
    var key = normKey(name);
    var found = null;
    Object.keys(vars).forEach(function (k) { if (normKey(k) === key) found = vars[k]; });
    return typeof found === "string" ? found : null;
  }

  /* Proper dashes, ellipses and curly quotation marks. */
  function typography(s) {
    return s
      .replace(/---/g, "—")
      .replace(/--/g, "–")
      .replace(/\.\.\./g, "…")
      .replace(/(^|[\s(\[{“‘–—])"/g, "$1“")
      .replace(/"/g, "”")
      .replace(/(^|[\s(\[{“‘–—])'/g, "$1‘")
      .replace(/'/g, "’");
  }

  function resolveUrl(url, vars) {
    return String(url).replace(/\{\s*([a-z][a-z0-9 _-]*?)\s*\}/gi, function (m, name) {
      var value = lookup(vars, name);
      return value == null ? m : value;
    });
  }

  /* Bold, italic, code, links, and {email} and friends. */
  function inline(text, vars) {
    var kept = [];
    function keep(html) { kept.push(html); return MARK + (kept.length - 1) + MARK; }

    var s = String(text == null ? "" : text);

    s = s.replace(/`([^`]+)`/g, function (m, code) {
      return keep("<code>" + escapeHtml(code) + "</code>");
    });

    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, url) {
      return keep('<a href="' + escapeAttr(resolveUrl(url, vars)) + '">' + inline(label, vars) + "</a>");
    });

    s = s.replace(/\{\s*([a-z][a-z0-9 _-]*?)\s*\}/gi, function (m, name) {
      var value = lookup(vars, name);
      if (value == null) return m;
      if (/^[^@\s]+@[^@\s]+$/.test(value)) {
        return keep('<a href="mailto:' + escapeAttr(value) + '">' + escapeHtml(value) + "</a>");
      }
      return keep(escapeHtml(value));
    });

    s = typography(escapeHtml(s))
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(/(^|[\s(])_([^_\n]+)_/g, "$1<em>$2</em>");

    return s.replace(new RegExp(MARK + "(\\d+)" + MARK, "g"), function (m, i) { return kept[Number(i)]; });
  }

  /* --- text to blocks -------------------------------------------- */

  var BLOCK_START = /^(#{1,6}\s|>|\s*[-*]\s|\{\{|-{3,}\s*$|\*{3,}\s*$)/;

  function splitParagraphs(lines) {
    var paragraphs = [], current = [];
    lines.forEach(function (line) {
      if (line.trim()) { current.push(line.trim()); return; }
      if (current.length) { paragraphs.push(current.join(" ")); current = []; }
    });
    if (current.length) paragraphs.push(current.join(" "));
    return paragraphs;
  }

  function parseBlocks(md) {
    var lines = String(md)
      .replace(/\r\n?/g, "\n")
      .replace(/<!--[\s\S]*?-->/g, "")
      .split("\n");
    var blocks = [], i = 0, m;

    while (i < lines.length) {
      var line = lines[i];

      if (!line.trim()) { i++; continue; }

      if ((m = /^#\s+(.*)$/.exec(line))) { blocks.push({ type: "h1", text: m[1].trim() }); i++; continue; }

      if ((m = /^##\s+(.*)$/.exec(line))) {
        var halves = m[1].split("::");
        blocks.push({
          type: "h2",
          label: halves.length > 1 ? halves[0].trim() : "",
          text: (halves.length > 1 ? halves.slice(1).join("::") : halves[0]).trim()
        });
        i++; continue;
      }

      if ((m = /^#{3,6}\s+(.*)$/.exec(line))) { blocks.push({ type: "h3", text: m[1].trim() }); i++; continue; }

      if ((m = /^\{\{\s*(.+?)\s*\}\}\s*$/.exec(line))) { blocks.push({ type: "slot", name: m[1] }); i++; continue; }

      if (/^(-{3,}|\*{3,})\s*$/.test(line)) { blocks.push({ type: "hr" }); i++; continue; }

      if (/^>/.test(line)) {
        var quoted = [];
        while (i < lines.length && (/^>/.test(lines[i]) || (quoted.length && lines[i].trim() && !BLOCK_START.test(lines[i])))) {
          quoted.push(lines[i].replace(/^>\s?/, ""));
          i++;
        }
        blocks.push({ type: "quote", paragraphs: splitParagraphs(quoted) });
        continue;
      }

      if (/^\s*[-*]\s+/.test(line)) {
        var items = [];
        while (i < lines.length) {
          var l = lines[i];
          if (/^\s*[-*]\s+/.test(l)) { items.push({ head: l.replace(/^\s*[-*]\s+/, "").trim(), rest: [] }); i++; continue; }
          if (!l.trim()) {
            var j = i;
            while (j < lines.length && !lines[j].trim()) j++;
            if (j < lines.length && /^\s*[-*]\s+/.test(lines[j])) { i = j; continue; }
            break;
          }
          if (/^(#{1,6}\s|>|\{\{)/.test(l.trim())) break;
          if (!items.length) break;
          items[items.length - 1].rest.push(l.trim());
          i++;
        }
        blocks.push({ type: "list", items: items });
        continue;
      }

      var para = [];
      while (i < lines.length && lines[i].trim() && !BLOCK_START.test(lines[i])) { para.push(lines[i].trim()); i++; }
      blocks.push({ type: "p", text: para.join(" ") });
    }

    return blocks;
  }

  /* --- blocks to HTML -------------------------------------------- */

  var LINK_ITEM = /^\[([^\]]+)\]\(([^)\s]+)\)\s*(.*)$/;

  function renderList(block, vars) {
    var linkFirst = block.items.length > 0 && block.items.every(function (item) { return LINK_ITEM.test(item.head); });

    if (!linkFirst) {
      return "<ul>" + block.items.map(function (item) {
        return "<li>" + inline([item.head].concat(item.rest).join(" "), vars) + "</li>";
      }).join("") + "</ul>";
    }

    return '<ul class="res">' + block.items.map(function (item) {
      var m = LINK_ITEM.exec(item.head);
      var note = [m[3]].concat(item.rest).join(" ").replace(/^\s*[—–-]\s*/, "").trim();
      return '<li><a class="res__title" href="' + escapeAttr(resolveUrl(m[2], vars)) + '">' + inline(m[1], vars) + "</a>" +
        (note ? '<span class="res__note">' + inline(note, vars) + "</span>" : "") + "</li>";
    }).join("") + "</ul>";
  }

  function slotName(name) {
    return String(name).toLowerCase().replace(/[^a-z]+/g, "");
  }

  function slotLimit(name) {
    var m = /(\d+)/.exec(String(name));
    return m ? Number(m[1]) : 0;
  }

  function renderBlock(block, vars) {
    switch (block.type) {
      case "h1": return "<h1>" + inline(block.text, vars) + "</h1>";
      case "h3": return '<h3 class="subhead">' + inline(block.text, vars) + "</h3>";
      case "p": return "<p>" + inline(block.text, vars) + "</p>";
      case "quote": return block.paragraphs.map(function (p) {
        return '<p class="callout">' + inline(p, vars) + "</p>";
      }).join("\n");
      case "list": return renderList(block, vars);
      case "hr": return "<hr>";
      case "slot": return '<div data-slot="' + escapeAttr(slotName(block.name)) + '" data-limit="' + slotLimit(block.name) + '"></div>';
      default: return "";
    }
  }

  function renderSection(head, body, vars) {
    var hasSlot = body.some(function (b) { return b.type === "slot"; });
    var headHtml = '<div class="section__head' + (hasSlot ? " prose" : "") + '">' +
      (head.label ? '<span class="label">' + inline(head.label, vars) + "</span>" : "") +
      "<h2>" + inline(head.text, vars) + "</h2></div>";

    var parts = [], pending = [];
    function flush() {
      if (!pending.length) return;
      var inner = pending.join("\n");
      pending = [];
      parts.push(hasSlot ? '<div class="section__note">' + inner + "</div>" : inner);
    }
    body.forEach(function (block) {
      if (block.type === "slot") { flush(); parts.push(renderBlock(block, vars)); }
      else pending.push(renderBlock(block, vars));
    });
    flush();

    return '<section class="section' + (hasSlot ? "" : " prose") + '">' + headHtml + "\n" + parts.join("\n") + "</section>";
  }

  /* Returns { html, title, lede }. */
  function renderPage(md, vars) {
    var blocks = parseBlocks(md);
    var out = [], i = 0, title = "", lede = "";

    var heroBlocks = [];
    while (i < blocks.length && blocks[i].type !== "h2") { heroBlocks.push(blocks[i]); i++; }

    if (heroBlocks.length) {
      var seenParagraph = false;
      var hero = heroBlocks.map(function (block) {
        if (block.type === "h1") { title = block.text; return renderBlock(block, vars); }
        if (block.type === "p" && !seenParagraph) {
          seenParagraph = true;
          lede = block.text;
          return '<p class="lede">' + inline(block.text, vars) + "</p>";
        }
        return renderBlock(block, vars);
      });
      out.push('<div class="hero prose">' + hero.join("\n") + "</div>");
    }

    while (i < blocks.length) {
      var head = blocks[i];
      i++;
      var body = [];
      while (i < blocks.length && blocks[i].type !== "h2") { body.push(blocks[i]); i++; }
      out.push(renderSection(head, body, vars));
    }

    return { html: out.join("\n"), title: title, lede: lede };
  }

  global.Markdown = {
    renderPage: renderPage,
    inline: inline,
    escapeHtml: escapeHtml,
    escapeAttr: escapeAttr,
    typography: typography,
    normKey: normKey
  };
})(window);
