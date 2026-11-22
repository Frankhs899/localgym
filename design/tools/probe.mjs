#!/usr/bin/env node
// Measurement probe for the gentle-design artboards.
//
// The artboards are the authority the real implementation is built from, so their
// geometry has to be reproducible by anyone, not just by the session that wrote them.
// This script drives a headless Chrome, injects a small measurement script, and prints
// the numbers the design system states in design/system.md.
//
// Usage:
//   node design/tools/probe.mjs design/design-system/02-neutral-signal.html [width]
//
// Defaults to 1440 px. Set CHROME=/path/to/chrome if auto-detection fails.
//
// Notes that cost a session to learn:
// - The temporary copy must live NEXT TO the original, because the artboards load their
//   fonts and read local files through relative URLs; a copy in the OS temp dir renders
//   with fallback fonts and silently mismeasures.
// - The socios listing renders ZERO rows on load: issue #5 forbids a listing on an empty
//   query, so the probe types into the search field before measuring. Measuring without
//   that step reports a table that is not there.

import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { basename, dirname, join, resolve } from "node:path";

const CHROME_CANDIDATES = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chrome) {
  console.error("No Chrome found. Set CHROME=/path/to/chrome and retry.");
  process.exit(2);
}

const [html, widthArg] = process.argv.slice(2);
if (!html) {
  console.error("Usage: node design/tools/probe.mjs <artboard.html> [width]");
  process.exit(2);
}
const width = widthArg || "1440";

const PROBE = `<script>
(function () {
  var log = [];
  function measure() {
    var out = [];
    function m(label, sel, idx, styles) {
      var els = document.querySelectorAll(sel);
      var el = els[idx || 0];
      if (!el) { out.push(label + '|none'); return; }
      var r = el.getBoundingClientRect(), s = getComputedStyle(el), extra = '';
      (styles || []).forEach(function (p) { extra += '|' + p + '=' + s[p]; });
      out.push(label + '|h=' + (Math.round(r.height * 100) / 100) + '|w=' + (Math.round(r.width * 100) / 100) + extra);
    }
    m('row0', 'tbody tr', 0);
    m('row1', 'tbody tr', 1);
    m('cell', 'tbody td', 0, ['paddingTop', 'paddingBottom', 'paddingLeft']);
    m('thead', 'thead th', 0, ['paddingTop', 'paddingBottom']);
    m('input', 'input', 0, ['height', 'paddingLeft']);
    m('button', 'button', 0, ['height', 'paddingLeft']);
    m('btnSm', '.btn-sm', 0, ['minHeight', 'height']);
    m('btnFull', '.btn:not(.btn-sm)', 0, ['minHeight', 'height']);
    m('aside', 'aside', 0);
    out.push('rows|' + document.querySelectorAll('tbody tr').length);
    out.push('fontChecks|' + ['Inter', 'Playfair Display', 'JetBrains Mono'].map(function (f) {
      return f + '=' + document.fonts.check('16px "' + f + '"');
    }).join(','));
    out.push('extFontRes|' + performance.getEntriesByType('resource').filter(function (r) {
      return r.name.indexOf('gstatic.com') > -1 || r.name.indexOf('googleapis.com') > -1;
    }).length);
    out.push('overflowX|' + document.documentElement.scrollWidth + '/' + document.documentElement.clientWidth);
    var d = document.createElement('pre');
    d.setAttribute('id', 'probeout');
    d.textContent = out.join(' ; ');
    document.body.appendChild(d);
  }
  function safeMeasure() {
    try { measure(); } catch (e) {
      var d = document.createElement('pre');
      d.setAttribute('id', 'probeout');
      d.textContent = 'fatal|' + e.message;
      document.body.appendChild(d);
    }
  }
  function act() {
    var input = document.querySelector('input[type="search"], input[type="text"]');
    var seg = document.querySelector('.seg-btn');
    if (seg) seg.click();
    if (input) {
      input.value = 'a';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  function run() {
    try { act(); } catch (e) { log.push('actErr:' + e.message); }
    document.fonts.ready.then(function () { setTimeout(safeMeasure, 300); });
  }
  if (document.readyState === 'complete') setTimeout(run, 300);
  else window.addEventListener('load', function () { setTimeout(run, 300); });
})();
</script>`;

const src = readFileSync(html, "utf8");
const at = src.toLowerCase().lastIndexOf("</body>");
if (at < 0) {
  console.error("No </body> in " + html);
  process.exit(1);
}

const outFile = join(dirname(resolve(html)), "._probe_" + basename(html));
writeFileSync(outFile, src.slice(0, at) + PROBE + src.slice(at), "utf8");

let dom;
try {
  dom = execFileSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--virtual-time-budget=9000",
      "--window-size=" + width + ",1000",
      "--dump-dom",
      pathToFileURL(resolve(outFile)).href,
    ],
    { encoding: "utf8", maxBuffer: 96 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] },
  );
} finally {
  try { unlinkSync(outFile); } catch {}
}

const match = dom.match(/<pre id="probeout">([\s\S]*?)<\/pre>/);
if (!match) {
  console.error("Probe produced no output for " + html);
  process.exit(1);
}
console.log("### " + basename(html) + " @ " + width);
console.log(match[1].split(" ; ").join("\n"));
