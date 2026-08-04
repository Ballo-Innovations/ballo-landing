import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEV_APP_API_BASE,
  PROD_APP_API_BASE,
  STAGING_APP_API_BASE,
  normalizeApiBase,
  resolvePublicApiBase,
} from "./publicApiBase.ts";

describe("resolvePublicApiBase", () => {
  it("maps local and dev hosts to app-api-dev", () => {
    assert.equal(resolvePublicApiBase("localhost:3000"), normalizeApiBase(DEV_APP_API_BASE));
    assert.equal(resolvePublicApiBase("127.0.0.1:3000"), normalizeApiBase(DEV_APP_API_BASE));
    assert.equal(resolvePublicApiBase("dev.balloads.com"), normalizeApiBase(DEV_APP_API_BASE));
  });

  it("maps staging hosts to app-api-staging", () => {
    assert.equal(resolvePublicApiBase("staging.balloads.com"), normalizeApiBase(STAGING_APP_API_BASE));
  });

  it("maps production hosts to app-api", () => {
    assert.equal(resolvePublicApiBase("balloads.com"), normalizeApiBase(PROD_APP_API_BASE));
    assert.equal(resolvePublicApiBase("www.balloads.com"), normalizeApiBase(PROD_APP_API_BASE));
    assert.equal(resolvePublicApiBase(null), normalizeApiBase(PROD_APP_API_BASE));
  });

  it("does not use the path-restricted developer api hosts as defaults", () => {
    assert.doesNotMatch(normalizeApiBase(DEV_APP_API_BASE), /^https:\/\/(api-dev|dev-api)\./);
    assert.doesNotMatch(normalizeApiBase(PROD_APP_API_BASE), /^https:\/\/api\.balloads\.com$/);
    assert.match(normalizeApiBase(DEV_APP_API_BASE), /app-api/);
    assert.match(normalizeApiBase(PROD_APP_API_BASE), /app-api/);
  });
});
