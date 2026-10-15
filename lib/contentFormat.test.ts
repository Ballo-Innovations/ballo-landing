import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isHtmlContent, sanitizeBlogHtml } from "./contentFormat.ts";

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

describe("sanitizeBlogHtml media", () => {
  const S3 = "https://s3.balloads.com/balloads/cms-assets/2026/10/clip.mp4";

  it("keeps uploaded video and audio from our storage, with controls", () => {
    const out = sanitizeBlogHtml(
      `<video src="${S3}" autoplay></video><audio src="https://s3.balloads.com/balloads/cms-assets/a.mp3"></audio>`,
    );
    assert.match(out, /<video src="https:\/\/s3\.balloads\.com[^"]+" controls preload="metadata" playsinline><\/video>/);
    assert.match(out, /<audio src="https:\/\/s3\.balloads\.com[^"]+" controls preload="metadata"><\/audio>/);
    assert.doesNotMatch(out, /autoplay/);
  });

  it("drops media hotlinked from other hosts", () => {
    assert.equal(sanitizeBlogHtml('<video src="https://evil.example/x.mp4"></video>'), "");
    assert.equal(sanitizeBlogHtml('<audio src="http://s3.balloads.com/a.mp3"></audio>'), "");
  });

  it("allows the supported player hosts and nothing else", () => {
    for (const src of [
      "https://player.vimeo.com/video/76979871",
      "https://open.spotify.com/embed/episode/abc",
      "https://w.soundcloud.com/player/?url=x",
      "https://www.tiktok.com/embed/v2/123",
      "https://www.youtube-nocookie.com/embed/abc",
    ]) {
      assert.match(sanitizeBlogHtml(`<iframe data-embed="x" src="${src}"></iframe>`), /<iframe/, src);
    }
    assert.doesNotMatch(sanitizeBlogHtml('<iframe src="https://evil.example/embed"></iframe>'), /src=/);
  });

  it("treats a body that opens with media as HTML", () => {
    assert.equal(isHtmlContent(`<video src="${S3}"></video><p>Hi</p>`), true);
  });
});
