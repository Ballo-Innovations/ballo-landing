import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { renderLegalHtml } from "./renderLegalHtml.ts";
import { formatLegalDate } from "./format.ts";

describe("renderLegalHtml", () => {
  it("anchors each H2 and lists it in the table of contents", () => {
    const { html, toc } = renderLegalHtml(
      '<h2 style="text-align:left">Your data</h2><p>a</p><h2>Your data</h2><h2>Law &amp; disputes</h2>',
    );
    assert.deepEqual(toc, [
      { id: "your-data", text: "Your data" },
      { id: "your-data-2", text: "Your data" },
      { id: "law-and-disputes", text: "Law & disputes" },
    ]);
    assert.match(html, /<h2 id="your-data">Your data<\/h2>/);
    assert.doesNotMatch(html, /style=/);
  });

  it("turns an H1 into an H2 and drops empty headings", () => {
    const { html, toc } = renderLegalHtml("<h1>Intro</h1><h2>  </h2>");
    assert.equal(toc.length, 1);
    assert.match(html, /<h2 id="intro">Intro<\/h2>/);
  });

  it("highlights [[TBC]] markers without letting them inject HTML", () => {
    const { html } = renderLegalHtml("<p>Address [[TBC: <b>street</b>]] and [[TBC: date]]</p>");
    assert.match(html, /<mark class="legal-tbc">TBC: date<\/mark>/);
    assert.doesNotMatch(html, /<mark class="legal-tbc">TBC: <b>/);
  });

  it("strips scripts, images, embeds and javascript links", () => {
    const { html } = renderLegalHtml(
      '<p>x<script>alert(1)</script><img src="https://a/b.png"><iframe src="https://youtube.com"></iframe><a href="javascript:alert(1)">bad</a></p>',
    );
    assert.doesNotMatch(html, /script|img|iframe|javascript/);
  });

  it("opens external links in a new tab and keeps internal links plain", () => {
    const { html } = renderLegalHtml(
      '<p><a href="https://example.com" target="_self">ext</a> <a href="/legal/dpa" target="_blank">dpa</a></p>',
    );
    assert.match(html, /<a href="https:\/\/example.com" target="_blank" rel="noopener noreferrer">ext<\/a>/);
    assert.match(html, /<a href="\/legal\/dpa">dpa<\/a>/);
  });

  it("keeps tables", () => {
    const { html } = renderLegalHtml("<table><tbody><tr><th><p>A</p></th></tr><tr><td><p>B</p></td></tr></tbody></table>");
    assert.match(html, /<table><tbody><tr><th><p>A<\/p><\/th><\/tr><tr><td><p>B<\/p><\/td><\/tr><\/tbody><\/table>/);
  });
});

describe("formatLegalDate", () => {
  it("formats ISO dates without timezone drift", () => {
    assert.equal(formatLegalDate("2026-11-01"), "1 November 2026");
  });
});
