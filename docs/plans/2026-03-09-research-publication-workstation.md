# Research Publication Workstation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the observatory into a desktop-first research-to-publication workstation where the user can investigate one actor, pin records, synthesize findings, and draft source-backed article sections.

**Architecture:** Keep the existing static HTML + vanilla JS frontend and current FastAPI/JSON backend surfaces, but refactor the frontend around one canonical investigation actor and add lightweight local persistence for pins, findings, and drafts. Reuse the current drawer, actor, evidence, contradiction, document, and analytics primitives instead of rebuilding the entire application shell.

**Tech Stack:** Vanilla JS, HTML, CSS, Chart.js, FastAPI, SQLite/JSON data, localStorage, ESLint, Playwright, Python unittest.

---

## Preconditions

- This plan assumes implementation happens in this repo root: `/Users/pms/Documents/GitHub/apatheia-observatory`
- The current Playwright config expects a `.venv` FastAPI runtime
- `requirements.txt` is currently incomplete for `analysis_engine.py`; add `vaderSentiment`
- The repo currently has a smoke test in `tests/e2e/smoke.spec.js`, but not a workstation workflow suite

### Task 1: Stabilize Runtime And Test Harness

**Files:**
- Modify: `requirements.txt`
- Modify: `package.json`
- Modify: `playwright.config.js`
- Create: `tests/e2e/research-workstation.spec.js`

**Step 1: Write the failing end-to-end workstation test**

Create `tests/e2e/research-workstation.spec.js` with a first failing test that expresses the target workflow shell:

```javascript
const { test, expect } = require("@playwright/test");

test("actor-first workstation entry flow", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText(/start an investigation/i)).toBeVisible();
  await page.getByLabel(/choose actor/i).selectOption({ index: 1 });

  await expect(page.getByText(/you are investigating/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /investigate/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /synthesize/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /write/i })).toBeVisible();
});
```

**Step 2: Run the test to verify it fails**

Run:

```bash
npx playwright test tests/e2e/research-workstation.spec.js -g "actor-first workstation entry flow"
```

Expected:

- fail because the current app has no `Start an investigation` empty state
- fail because there is no `Investigate / Synthesize / Write` workstation flow yet

**Step 3: Fix the local runtime dependencies**

Update `requirements.txt` to include the analysis dependency used by `analysis_engine.py`:

```txt
fastapi
uvicorn
vaderSentiment
```

Update `package.json` scripts and dev dependencies:

```json
{
  "scripts": {
    "lint": "eslint .",
    "test:contract": "python3 -m unittest discover -s tests -p \"test_*.py\"",
    "check:perf-budget": "python3 tests/perf_budget_check.py",
    "test:e2e": "playwright test",
    "ci": "npm run lint && npm run test:contract && npm run check:perf-budget && npm run test:e2e"
  },
  "devDependencies": {
    "@playwright/test": "latest"
  }
}
```

Update `playwright.config.js` so the web server creates runtime data before boot:

```javascript
webServer: {
  command: ".venv/bin/python init_db.py && .venv/bin/python build_profiles.py && .venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 4173",
  url: "http://127.0.0.1:4173",
  reuseExistingServer: true,
  timeout: 120000,
}
```

**Step 4: Install dependencies and verify the test harness runs**

Run:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
npm install -D @playwright/test
npx playwright test tests/e2e/research-workstation.spec.js -g "actor-first workstation entry flow"
```

Expected:

- the app boots
- the new test still fails, but now for missing UI behavior rather than missing runtime dependencies

**Step 5: Commit**

```bash
git add requirements.txt package.json package-lock.json playwright.config.js tests/e2e/research-workstation.spec.js
git commit -m "chore: stabilize workstation test runtime"
```

### Task 2: Introduce Canonical Investigation State

**Files:**
- Modify: `app.js:1-20`
- Modify: `app.js:437-470`
- Modify: `app.js:839-952`
- Modify: `app.js:1155-1218`
- Modify: `index.html:177-246`

**Step 1: Write the failing behavior test for actor selection**

Extend `tests/e2e/research-workstation.spec.js`:

```javascript
test("selecting an actor sets a canonical investigation subject", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/choose actor/i).selectOption("hakeem-jeffries");

  await expect(page.getByText(/you are investigating hakeem jeffries/i)).toBeVisible();

  await page.getByRole("button", { name: /reset filters/i }).click();
  await expect(page.getByText(/you are investigating hakeem jeffries/i)).toBeVisible();

  await page.getByRole("button", { name: /clear investigation/i }).click();
  await expect(page.getByText(/start an investigation/i)).toBeVisible();
});
```

**Step 2: Refactor the frontend state shape**

In `app.js`, replace the split `activeProfileId`/`profile` model with a single canonical investigation actor:

```javascript
const state = {
  data: null,
  investigationActorId: null,
  activeWorkspace: "investigate",
  filters: {
    search: "",
    lens: "all",
    theme: "all",
    doc: "all",
  },
  pins: { evidence: [], contradictions: [], documents: [] },
  findings: [],
  draft: { title: "", dek: "", sections: [] },
  actorCategory: "all",
  evidencePage: 1,
  docSortCol: null,
  docSortAsc: true,
  contradictionExpanded: new Set(),
};
```

Add canonical helpers:

```javascript
function currentActor() {
  return state.investigationActorId ? profileById(state.investigationActorId) : null;
}

function setInvestigationActor(profileId) {
  state.investigationActorId = profileId || null;
  state.evidencePage = 1;
}

function resetFilters() {
  state.filters = { search: "", lens: "all", theme: "all", doc: "all" };
  state.evidencePage = 1;
}

function clearInvestigation() {
  setInvestigationActor(null);
  resetFilters();
}
```

**Step 3: Route all actor entry points through one handler**

Update `attachEvents()` and all actor click paths so these sources all call `setInvestigationActor()`:

- hero actor select
- actor directory buttons
- actor chips
- command palette actor results
- contradiction actor CTA
- evidence actor CTA

**Step 4: Update the header controls**

In `index.html`, rename and split controls clearly:

- `Reset filters`
- `Clear investigation`
- visible working-set status text area

**Step 5: Run tests**

Run:

```bash
npx playwright test tests/e2e/research-workstation.spec.js -g "canonical investigation subject"
npm run lint
```

Expected:

- new actor-state test passes
- lint passes

**Step 6: Commit**

```bash
git add app.js index.html tests/e2e/research-workstation.spec.js
git commit -m "feat: add canonical investigation actor state"
```

### Task 3: Build The Actor-First Investigate Workspace

**Files:**
- Modify: `index.html:82-245`
- Modify: `index.html` main content sections for investigation entry state
- Modify: `app.js:1211-1408`
- Modify: `app.js:1723-2438`
- Modify: `style.css:453-1088`

**Step 1: Write the failing layout test**

Extend `tests/e2e/research-workstation.spec.js`:

```javascript
test("investigate workspace prioritizes actor snapshot, evidence, contradictions, and sources", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/choose actor/i).selectOption("hakeem-jeffries");

  await expect(page.getByRole("heading", { name: /actor snapshot/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /trajectory/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /evidence stream/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /pressure points/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /source base/i })).toBeVisible();
});
```

**Step 2: Implement the investigation shell**

In `index.html`, create workstation-level panels:

- working-set bar
- investigate workspace section
- synthesize workspace section placeholder
- write workspace section placeholder

Add a guided empty state for pre-selection:

```html
<section id="investigation-empty-state" class="workstation-empty-state">
  <h2>Start an investigation</h2>
  <p>Select an actor to trace claims, contradictions, source files, and analytical pressure points.</p>
  <div id="suggested-actor-list"></div>
</section>
```

**Step 3: Reuse and re-order existing renderers**

In `app.js`, adapt these existing functions so they feed the investigation workspace:

- `renderWorkspaceStrip()`
- `renderProfiles()`
- `renderEvidence()`
- `renderContradictions()`
- `renderDocuments()`

Hide secondary panels until an actor is chosen. When an actor is selected, render the workflow in this order:

1. actor snapshot
2. trajectory
3. evidence stream
4. contradiction stack
5. source base
6. context pivots

**Step 4: Update CSS for the workstation layout**

In `style.css`, create a desktop-first research layout:

```css
.workstation-shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 340px;
  gap: var(--space-5);
}

.working-set-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.workstation-empty-state {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-6);
}
```

**Step 5: Run tests**

Run:

```bash
npx playwright test tests/e2e/research-workstation.spec.js -g "investigate workspace prioritizes"
npm run lint
python3 -m unittest discover -s tests -p "test_*.py"
python3 tests/perf_budget_check.py
```

Expected:

- investigation layout test passes
- existing Python tests still pass
- perf budget remains green

**Step 6: Commit**

```bash
git add index.html app.js style.css tests/e2e/research-workstation.spec.js
git commit -m "feat: add actor-first investigate workspace"
```

### Task 4: Add Pinning And Local Persistence

**Files:**
- Create: `js/workstation-storage.js`
- Modify: `index.html`
- Modify: `app.js:495-746`
- Modify: `style.css`
- Modify: `tests/e2e/research-workstation.spec.js`

**Step 1: Write the failing persistence test**

Add:

```javascript
test("pinned evidence survives reload", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/choose actor/i).selectOption("hakeem-jeffries");
  await page.getByText(/evidence stream/i).scrollIntoViewIfNeeded();
  await page.locator("[data-evidence-id]").first().click();
  await page.getByRole("button", { name: /pin evidence/i }).click();

  await page.reload();
  await expect(page.getByText(/1 pinned evidence/i)).toBeVisible();
});
```

**Step 2: Create a storage helper**

Create `js/workstation-storage.js`:

```javascript
(function () {
  const KEY = "apatheia.workstation.v1";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      return {};
    }
  }

  function save(payload) {
    localStorage.setItem(KEY, JSON.stringify(payload));
  }

  window.workstationStorage = { load, save };
})();
```

Load it before `app.js` in `index.html`.

**Step 3: Add pin actions**

In `app.js`, add drawer and list actions:

- `pin-evidence`
- `pin-contradiction`
- `pin-document`
- `unpin-*`

Persist:

- `investigationActorId`
- `pins`
- later `findings`
- later `draft`

**Step 4: Add the pinned records panel**

Create a persistent pinned panel in the workstation side rail with:

- pinned evidence count
- pinned contradictions count
- pinned documents count
- click-to-open records

**Step 5: Run tests**

Run:

```bash
npx playwright test tests/e2e/research-workstation.spec.js -g "pinned evidence survives reload"
npm run lint
```

Expected:

- persistence test passes
- lint passes

**Step 6: Commit**

```bash
git add js/workstation-storage.js index.html app.js style.css tests/e2e/research-workstation.spec.js
git commit -m "feat: add pinned research workspace persistence"
```

### Task 5: Build The Findings Board

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `style.css`
- Modify: `tests/e2e/research-workstation.spec.js`

**Step 1: Write the failing findings test**

Add:

```javascript
test("researcher can create a finding from pinned records", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/choose actor/i).selectOption("hakeem-jeffries");

  await page.locator("[data-evidence-id]").first().click();
  await page.getByRole("button", { name: /pin evidence/i }).click();

  await page.getByRole("button", { name: /synthesize/i }).click();
  await page.getByRole("button", { name: /new finding/i }).click();
  await page.getByLabel(/finding title/i).fill("Jeffries procedural opposition finding");
  await page.getByLabel(/thesis/i).fill("Jeffries shifts from threat framing toward procedural and evidentiary opposition.");
  await page.getByRole("button", { name: /save finding/i }).click();

  await expect(page.getByText(/jeffries procedural opposition finding/i)).toBeVisible();
});
```

**Step 2: Implement the synthesize workspace**

Create a findings board with:

- `New finding` action
- finding title
- thesis
- linked pinned records
- unresolved note
- optional analysis panel

Suggested data shape:

```javascript
{
  id: crypto.randomUUID(),
  title: "",
  thesis: "",
  evidenceIds: [],
  contradictionIds: [],
  documentIds: [],
  unresolved: "",
  metrics: {}
}
```

**Step 3: Integrate analysis engine outputs gracefully**

Use `fetch("/api/analysis")` when available to populate:

- contradiction totals
- actor-scoped trend hints
- sentiment summary

If the analysis endpoint fails, show a visible but non-blocking fallback:

```javascript
{ status: "failed", message: "Analysis metrics unavailable. Core evidence workflow still works." }
```

**Step 4: Run tests**

Run:

```bash
npx playwright test tests/e2e/research-workstation.spec.js -g "create a finding"
npm run lint
```

Expected:

- findings test passes
- lint passes

**Step 5: Commit**

```bash
git add index.html app.js style.css tests/e2e/research-workstation.spec.js
git commit -m "feat: add findings synthesis workflow"
```

### Task 6: Build The Writing Workspace And Export

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `style.css`
- Modify: `tests/e2e/research-workstation.spec.js`

**Step 1: Write the failing writing test**

Add:

```javascript
test("researcher can insert a finding into the draft and export markdown", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/choose actor/i).selectOption("hakeem-jeffries");

  // Reuse or seed one finding first.
  await page.getByRole("button", { name: /synthesize/i }).click();
  await page.getByRole("button", { name: /new finding/i }).click();
  await page.getByLabel(/finding title/i).fill("Jeffries procedural opposition finding");
  await page.getByLabel(/thesis/i).fill("Jeffries shifts from threat framing toward procedural and evidentiary opposition.");
  await page.getByRole("button", { name: /save finding/i }).click();

  await page.getByRole("button", { name: /write/i }).click();
  await page.getByRole("button", { name: /insert finding/i }).click();

  await expect(page.getByText(/jeffries procedural opposition finding/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /export markdown/i })).toBeVisible();
});
```

**Step 2: Implement the draft workspace**

Add a write workspace with:

- article title
- dek
- draft body blocks
- insert finding
- insert quote
- insert contradiction summary
- export markdown

Markdown assembly function:

```javascript
function buildMarkdownDraft(draft) {
  return [
    `# ${draft.title || "Untitled Draft"}`,
    draft.dek ? `\n> ${draft.dek}\n` : "",
    ...draft.sections.map(section => `\n${section}\n`)
  ].join("\n");
}
```

**Step 3: Implement copy/export**

Provide:

- `Copy markdown`
- `Download markdown`

The first pass can use a `Blob` download and clipboard copy rather than backend export APIs.

**Step 4: Run tests**

Run:

```bash
npx playwright test tests/e2e/research-workstation.spec.js -g "insert a finding into the draft"
npm run lint
```

Expected:

- writing workflow test passes
- lint passes

**Step 5: Commit**

```bash
git add index.html app.js style.css tests/e2e/research-workstation.spec.js
git commit -m "feat: add article drafting and markdown export"
```

### Task 7: Add Reliability States, Documentation, And Final Verification

**Files:**
- Modify: `app.js`
- Modify: `style.css`
- Modify: `README.md`
- Modify: `USER_GUIDE.md`
- Modify: `tests/e2e/research-workstation.spec.js`
- Modify: `tests/e2e/smoke.spec.js`

**Step 1: Write the failing reliability tests**

Add one route-failure test with Playwright request interception:

```javascript
test("analysis failure degrades visibly and recoverably", async ({ page }) => {
  await page.route("**/api/analysis", route => route.fulfill({ status: 500, body: "error" }));
  await page.goto("/");
  await page.getByLabel(/choose actor/i).selectOption("hakeem-jeffries");
  await page.getByRole("button", { name: /synthesize/i }).click();

  await expect(page.getByText(/analysis metrics unavailable/i)).toBeVisible();
});
```

**Step 2: Implement explicit state surfaces**

For each major surface, render one of:

- loading
- ready
- empty
- failed

Add retry buttons where the surface depends on fetch state.

**Step 3: Update docs**

Update `README.md` and `USER_GUIDE.md` with:

- actor-first investigation flow
- pinning workflow
- findings workflow
- writing/export workflow

**Step 4: Run the full verification suite**

Run:

```bash
npm run lint
python3 -m unittest discover -s tests -p "test_*.py"
python3 tests/perf_budget_check.py
npx playwright test
```

Expected:

- lint passes
- Python contract and analysis tests pass
- perf budget stays green
- Playwright smoke and workstation workflow tests pass

**Step 5: Manual verification**

Run the app and verify this exact loop in-browser:

1. select actor
2. inspect evidence
3. pin evidence and contradiction
4. create finding
5. insert finding into article draft
6. export markdown

**Step 6: Commit**

```bash
git add README.md USER_GUIDE.md app.js style.css tests/e2e/research-workstation.spec.js tests/e2e/smoke.spec.js
git commit -m "feat: complete research publication workstation workflow"
```

## Execution Notes

- Reuse the existing drawer and list rendering patterns wherever possible
- Do not rebuild charts or analytics from scratch; repurpose them as supporting context
- Keep the first pass desktop-first
- Prefer local persistence over adding new backend storage
- Treat evidence traceability as a hard requirement, not a stretch goal

## Definition Of Done

The implementation is complete when all of these are true:

- one canonical investigation actor exists in frontend state
- the user can pin records and reopen them after refresh
- the user can create a structured finding from pinned materials
- the user can insert findings and quotes into a draft workspace
- the user can export markdown
- the e2e suite proves the actor -> pin -> finding -> draft path works
