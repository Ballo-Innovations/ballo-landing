import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isHtmlContent } from "./contentFormat.ts";

describe("isHtmlContent", () => {
  it("detects TipTap HTML", () => {
    assert.equal(isHtmlContent("<p>Hello</p>"), true);
    assert.equal(isHtmlContent('<h2>Title</h2><p>Body</p>'), true);
  });

  it("detects Markdown", () => {
    assert.equal(isHtmlContent("# Hello\n\nWorld"), false);
    assert.equal(isHtmlContent("Just a plain sentence."), false);
  });
});
