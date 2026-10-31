import test from "node:test";import assert from "node:assert/strict";
import {BASE,KEY,changedPublicPages} from "../scripts/indexnow-urls.mjs";
test("correct ownership key",()=>assert.match(KEY,/^[a-f0-9]{32}$/));
test("only real public changed HTML pages",()=>assert.deepEqual(changedPublicPages(["frontend/index.html","frontend/demo.html","frontend/lead-admin.html","frontend/lead-delete.html","frontend/demo.html","frontend/videos/a.mp4"]),[BASE+"/",BASE+"/demo.html"]));
