# UI/UX Audit

Auditor: tester-b2. Method: read every tool's component/utils source under `src/app/<tool>/` to inventory currently-exposed options, then compared each tool against its well-known professional equivalent(s) to find gaps. Only flagging options that standard comparable tools actually have — no speculative/invented features.

## Options

### base64

**Current:** Encode/Decode mode toggle, Auto-detect toggle, file upload (any file → base64, encode direction only), clear, copy output, localStorage/URL-param persistence.

**Compared against:** base64.guru, base64decode.org, typical base64 CLI/online tools.

- **Must-have — URL-safe / Base64URL variant** (`-_` alphabet, no padding). Ubiquitous in JWTs and URL query params; every general-purpose base64 tool offers this as a second alphabet mode.
- **Must-have — Decode-to-file download.** File upload only works encode-direction today (file → base64 text); decoding a base64 blob back into a downloadable binary file (e.g. a base64-embedded image) is the natural inverse and is standard in comparable tools.
- **Nice-to-have — MIME line-wrapping (76-char, RFC 2045).** Needed for legacy email/some payload formats; low-frequency use case.

### colorPicker

**Current:** Hex/RGB/HSL/HSV numeric inputs + RGB sliders, color wheel, 4 preset palettes + CSS named colors, 6 harmony types, eyedropper, random color, 20-item history, copy in 4 formats.

**Compared against:** coolors.co, Adobe Color, WebAIM-style dev color pickers.

- **Must-have — Alpha/opacity channel (RGBA/HSLA).** Alpha is a first-class part of every modern color format in CSS; its total absence means the tool can't represent or copy a huge share of real-world color values.
- **Must-have — Contrast ratio / WCAG AA-AAA checker.** This is a developer-facing tool; foreground/background contrast checking against WCAG thresholds is the single most common "extra" feature in dev-oriented color pickers and is currently entirely absent.
- **Nice-to-have — CMYK format.** Print-oriented, lower relevance for a web-dev toolbox, but present in most "professional" pickers (Adobe Color).
- **Nice-to-have — Palette export/import (JSON/URL share).** History exists but is session-local with no way to save/share a palette.

### cronParser

**Current:** Field-count mode (5/6/7), raw expression input, presets grid (scoped per mode), per-field interactive builder (dropdown + custom text), next-10-runs list, download report.

**Compared against:** crontab.guru, cronitor's cron builder.

- **Must-have — Timezone selector for "next runs".** Cron schedules are frequently tied to a specific server timezone, not the browser's local zone; crontab.guru and comparable tools let you pick the evaluation timezone. No such control exists here — next-run times are silently computed in local browser time.
- **Must-have — `@` shorthand support** (`@daily`, `@hourly`, `@weekly`, `@monthly`, `@yearly`, `@reboot`). These are part of the de facto cron standard (Vixie cron, systemd, most schedulers) and extremely common in real crontabs/CI configs; no shorthand parsing is exposed in the builder or raw-expression path per the code inventory.
- **Nice-to-have — Configurable next-run count.** Fixed at 10; comparable tools let you pick 5/25/50.

### csvConverter

**Current:** From/To format select (CSV/JSON/YAML), delimiter select (comma/tab/semicolon/pipe, CSV-conditional), download, copy, clear, Code/Table view toggle.

**Compared against:** csvjson.com, convertcsv.com, spreadsheet CSV-import wizards.

- **Must-have — "First row is header" toggle.** A large share of real-world CSVs have no header row; every serious CSV tool (and every spreadsheet import wizard) exposes this as a basic on/off, and its absence here means headerless CSVs can't be converted correctly at all.
- **Nice-to-have — Custom delimiter text input.** Only 4 fixed delimiter options exist; a free-text single-character field (as in csvkit/Excel's import wizard) covers the long tail (`:`, `~`, etc.).
- **Nice-to-have — Quote-character selection.** Some CSV dialects use `'` instead of `"`; currently not configurable.

### htmlFormatter

**Current:** Import file, clear, indent-size selector (2/4/6/8 spaces), Format button, download, copy, validation panel (errors/warnings/suggestions).

**Compared against:** htmlformatter.com, Prettier playground, beautifier.io.

- **Must-have — Minify mode.** Beautify and minify are the two standard modes of virtually every HTML formatter (htmlformatter.com, Prettier); only beautify exists here.
- **Nice-to-have — Indent style: spaces vs. tabs.** beautifier.io/Prettier both expose this; currently spaces-only.
- **Nice-to-have — Max line length / attribute wrapping.** Standard in Prettier-class formatters for long tag lines; not present.

### jsonCompare

**Current:** Format & Fix per side, Swap, Compare, download report, Table/Tree diff view toggle, tree expand/collapse + Diffs-Only/Full-Tree toggle.

**Compared against:** jsondiff.com, diffchecker.com's JSON mode, Postman's diff view.

- **Must-have — Ignore array order.** Comparing two JSON payloads whose array elements are the same set but different order (extremely common with API responses) currently always reports every reordered element as changed; nearly every serious JSON-diff tool has this toggle.
- **Must-have — Ignore specified keys/paths** (e.g. `updatedAt`, `id`, request-id fields). Volatile fields drown out real diffs in any payload-comparison workflow; this is a standard feature in comparable JSON-diff tools and in tools like Postman's response-diff view.
- **Nice-to-have — Copy-diff-to-clipboard.** Only file download exists for the diff report; a direct copy button is a smaller, common convenience most other tools in this app already have.

### jsonVisualizer

**Current:** File import, download, indent presets, copy, expand/collapse (all + per-node), breadcrumb nav, search bar with Case/Regex/Fuzzy modes + Search/Filter/Navigate mode switch, inline tree editing (add/edit/delete), undo/redo, context menu (copy key/value/field/path, add child).

**Compared against:** JSON Crack, jsonhero.io, VS Code's built-in JSON outline.

- **Must-have — Wire up the existing "keys-only" search toggle.** The `isKeysOnly` field and its plumbing already exist in `CommandPalette`'s state/handlers, but no button renders it — this is a fully-built, zero-new-logic feature that's simply not reachable in the UI. Very low cost, real value (searching by key name only is a common need distinct from full-value search).
- **Nice-to-have — Table view for arrays of uniform objects.** jsonhero.io and JSON Crack offer a spreadsheet-like view for array-of-object data; this repo already has that exact rendering logic in `csvConverter`'s `TableView`, so it's a precedented, low-novelty addition, not scope creep.
- **Nice-to-have — Generate type definitions (TypeScript interface) from the loaded JSON.** Popularized by quicktype.io; valuable for a dev tool but a larger, more novel addition than the other two.

### markdownPreview

**Current:** Clear, hide/show editor, Export HTML. That's the entire control surface.

**Compared against:** StackEdit, Dillinger, HackMD, GitHub's markdown editor.

- **Must-have — Formatting toolbar** (bold/italic/link/list/code-block/heading insert buttons). Every comparable markdown editor (Dillinger, StackEdit, HackMD, even GitHub's comment box) provides one; without it, users must memorize raw Markdown syntax, which undercuts the point of a dedicated "preview" tool aimed at making Markdown approachable.
- **Must-have — Synchronized scroll between editor and preview panes.** This is a hallmark, expected behavior of every split-pane markdown tool (Dillinger, StackEdit, Typora, VS Code's preview); scrolling one pane independently of the other here makes the split view considerably less useful for long documents.
- **Nice-to-have — Table of contents generation** from headings. Common in longer-form markdown tools (HackMD, Typora).
- **Nice-to-have — Word count / reading time.** textUtilities already has word-counting elsewhere in this app; markdownPreview lacks its own, and authors commonly want this while drafting.

### mermaidEditor

**Current:** Load file, clear, sample diagrams, theme selector, Standard/Gradient render-mode toggle, gradient theme select, background color picker, Render/Download SVG, per-node and per-edge style panels (fill/stroke/text/width, 2-stop gradients for nodes), border-width sliders, per-edge label editing.

**Compared against:** mermaid.live (the official Mermaid Live Editor).

- **Must-have — Export as PNG (in addition to SVG).** mermaid.live supports PNG export because SVG isn't universally paste-friendly (many docs tools/slide decks handle raster images better); only SVG download exists here.
- **Must-have — Zoom/pan on the diagram preview.** Diagrams routinely exceed the visible canvas; mermaid.live has pan-zoom controls for exactly this, and no equivalent exists in the current preview panel per the inventory.
- **Nice-to-have — Shareable permalink** (diagram source encoded into the URL). This is mermaid.live's signature feature, and this codebase already has precedent for URL-param state persistence in other tools (cronParser, base64, regexTester), so it's a consistent, low-novelty addition here too.

### regexTester

**Current:** Pattern field, `g`/`i`/`m`/`s` flag toggles, 8 fixed presets dropdown, download matches report. (2s worker timeout and 10k iteration cap are fixed internals, not user options.)

**Compared against:** regex101.com, regexr.com.

- **Must-have — Replace mode** (substitution string with `$1`-style backreferences, live "replaced output" preview). This is the second core mode of every major regex tester (regex101, regexr) alongside match-testing, and this codebase already has adjacent replace logic built for `textUtilities`'s Find & Replace sub-tool, so it's a precedented, non-speculative addition, not a new capability class.
- **Nice-to-have — `u` (unicode) and `y` (sticky) flags.** regex101 exposes all standard JS flags; only 4 of 6 are toggleable here.
- **Nice-to-have — Copy matches to clipboard.** Only a file-download option exists for results; most other tools in this app pair download with a copy button.

### svgEditor

**N/A.** `page.tsx` is a pure `redirect('/mermaidEditor')` with no component tree, no state, and no options surface of its own — confirmed, nothing to audit here (any relevant gaps are covered under mermaidEditor above).

### textCompare

**Current:** Ignore Whitespace checkbox, Ignore Case checkbox, Compare/Swap/Reset buttons, export report (download only).

**Compared against:** diffchecker.com, GitHub's PR diff view, Beyond Compare.

- **Must-have — View mode: side-by-side vs. inline/unified diff.** Every comparable diff tool (diffchecker.com, GitHub, Beyond Compare) offers both layouts; this tool has only one fixed side-by-side layout with no alternative for narrow screens or reviewing linear change sequences.
- **Must-have — Ignore blank lines.** Distinct from "Ignore Whitespace" (which only trims within a line, not across whole empty lines) and a standard, separate checkbox in diffchecker.com and similar tools — currently unavailable here, so runs of blank-line-only changes always show as diffs.
- **Nice-to-have — Copy-diff-to-clipboard.** Only file download exists; most sibling tools in this app pair the two.
- **Nice-to-have — Upload file to compare.** base64, htmlFormatter, and textUtilities (Find & Replace) all support file upload; textCompare is paste-only, an inconsistency worth closing.

### textUtilities

**Current:** 5 category tabs (Case, Formatting, Encoding, Counting, Find & Replace) covering 13 case converters + trim/whitespace/URL-encode/count functions; Find & Replace sub-tool has token-file batch replace (Key=>Value/JSON/CSV formats), per-pair enable/search/replace/delete, save/load token files.

**Compared against:** textfixer.com, convertcase.net, and other general text-utility suites.

- **Must-have — Sort lines** (alphabetical / numeric / reverse / shuffle). One of the most standard "text utility" operations (textfixer.com and virtually every text-tool suite has it) and a conspicuous gap given how many case-conversion options already exist here.
- **Must-have — Remove duplicate lines.** Same category as sort-lines — a near-universal companion feature in text-utility tools, currently missing entirely.
- **Must-have — Expose the existing per-pair "regex mode" toggle in Find & Replace.** The `isRegex` field already exists on `ReplacementPair`'s type/state, but no checkbox renders it — every search pattern is unconditionally treated as regex today, so a literal string like `a.b` silently behaves as a wildcard unless the user knows to escape it. Same category of fix as the jsonVisualizer keys-only toggle: the logic exists, only the control is missing.
- **Nice-to-have — Slugify (URL-slug) transform.** Common alongside kebab-case in comparable case-converter tools (convertcase.net).

### timestampConverter

**Current:** Freeform timestamp/date text input, "Use Current Time" button, timezone combo box (autocompletes from `Intl.supportedValuesOf`), native `datetime-local` picker, 9 fixed result cards each individually copyable, download report.

**Compared against:** epochconverter.com, unixtimestamp.com.

- **Must-have — Side-by-side multi-timezone comparison.** epochconverter.com and comparable tools let you see the same instant converted across several timezones at once; this tool only ever shows one "Local" conversion tied to the single timezone field, which is the more common real need (e.g. "what time is this for both our US and EU teams").
- **Must-have — Custom output format string** (strftime/date-fns-style pattern input). Both epochconverter.com and unixtimestamp.com expose a format-string field so the result matches exactly what a user's code expects; here the 9 output formats are entirely fixed/non-configurable.
- **Nice-to-have — 12-hour vs. 24-hour toggle** for the Local/UTC display cards.

### uuidGenerator

**Current:** ID type selector (UUID v4 / Nano ID / ObjectId), Include-hyphens toggle, Uppercase toggle, quantity (1-100), Generate, per-ID copy, copy-all, clear, download, 10-batch in-memory history.

**Compared against:** uuidgenerator.net and comparable ID generators.

- **Must-have — UUID v1 and v7 variants.** Only v4 exists among true UUID versions (Nano ID and ObjectId are different ID schemes entirely, not UUID versions); uuidgenerator.net and most comparable tools offer v1 (timestamp-based) and increasingly v7 (time-ordered, now a ratified RFC), which are common choices when sortability matters and v4's randomness is undesirable.
- **Nice-to-have — Braces/quotes wrapping toggle.** uuidgenerator.net offers this alongside hyphens/uppercase (useful for pasting into .NET/Windows-style GUID literals); not present here.
- **Nice-to-have — Bulk output as JSON array / CSV / SQL list.** Complements the existing plain-newline output; a common secondary export option in comparable generators.

## Cross-tool pattern: two "ghost" options already implemented but unreachable

Two tools have configuration state and logic fully wired up in code with no UI control to reach them — flagging together since they're the same class of gap (near-zero implementation cost, since the hard part is already done):

1. **jsonVisualizer** — `isKeysOnly` search-mode flag: state, plumbing, and search-time filtering all exist; no button renders it in `CommandPalette.tsx`.
2. **textUtilities Find & Replace** — `isRegex` per-pair flag: exists on the `ReplacementPair` type and is read at replace time, but always effectively `true` since no checkbox sets it to `false`; the current fixed "Regex mode enabled" banner is arguably user-facing evidence the escape hatch was intended but never finished.

Both are ranked must-have above under their respective tools, but worth calling out as the cheapest wins in this entire audit.

## Visual

Auditor: tester-a2. Method: live browser session against `localhost:3013` (Chrome, via browser automation) — screenshotted every one of the 14 tool pages plus the homepage at desktop width (~1500px), then spot-checked dark mode (Light/Dark/Auto toggle) and narrow/mobile width (390px) on a representative cross-section. Console/network inspected where a screenshot suggested something was actually broken, not just cosmetically odd. Confirmed-by-observation only; anything I couldn't visually reproduce or verify in DOM/source is left out.

### timestampConverter

1. **[HIGH] React hydration mismatch on every single page load.** Loading `/timestampConverter` throws a full React "Hydration failed because the server rendered HTML didn't match the client" error in the console, **reproduced 3/3 times** across fresh navigations. Root cause: the "Current Time" panel renders a live timestamp/ISO string both server-side (SSR) and client-side, and the two renders happen at different instants (confirmed via the error's own diff: server `2026-07-10T17:53:12.223Z` vs. client `2026-07-10T17:53:12.669Z`, and separately server `1783706016` vs. client `1783706017`). Visually, this surfaces as a red **"1 error"** toast pinned to the bottom-left of the viewport that **overlaps and partially obscures the sidebar navigation** (the "Color Picker" nav item's text is covered by the badge). Professional treatment: don't render a live/volatile timestamp in the server-rendered markup at all — compute "current time" only after mount (e.g. `useEffect` + `useState`, or a suppressHydrationWarning-guarded placeholder), so the SSR and CSR trees always match and no dev-error overlay (or client-side full-subtree remount, which is what happens even without the visible badge in production) occurs.

### htmlFormatter

2. **[MEDIUM] "Format" button uses a different accent color than the near-identical action elsewhere.** htmlFormatter's primary action button (sparkle icon + "Format") is styled amber/orange (peach background, orange-brown text and icon). jsonCompare's semantically identical button — same sparkle icon, same "auto-fix the content" purpose, labeled "Format & Fix" — is styled blue/indigo, matching the app's dominant accent color used everywhere else (nav highlight, primary CTAs, focus rings). Screenshotted and zoomed both side-by-side; confirmed the color difference is real, not a JPEG-compression artifact. Professional treatment: use one accent color for one semantic action across the whole app — either recolor htmlFormatter's "Format" button to the shared blue, or establish (and document) a deliberate color-coding system if the divergence is meant to carry meaning.

### mermaidEditor

3. **[MEDIUM-HIGH] Diagram preview panel does not adapt to dark mode.** Toggling the site to Dark theme correctly re-themes the sidebar, code editor, node/edge style panels, and all buttons to a dark navy palette — except the "Diagram Preview" panel itself, which keeps a bright **white background with black text and light-lavender node shapes**, unchanged from light mode. The result is a large, glaring white rectangle sitting in the middle of an otherwise fully dark UI. This is the single most visually jarring dark-mode issue found in the audit, since the diagram is the tool's primary content area (not a peripheral element). Professional treatment: either theme the rendered Mermaid SVG's background/text/stroke colors to follow the site's dark palette (Mermaid supports a `dark` built-in theme, distinct from the "Default" theme selector already present in this tool's own UI), or explicitly frame the preview as an intentional "canvas" with a neutral border so the white area reads as deliberate rather than broken.

### colorPicker

4. **[MEDIUM] Dark mode has a jarring near-black layout seam above the header and below the last card.** Scrolling the colorPicker page down in dark mode reveals large blocks of **solid black** space: one directly above the sticky "React ToolBox" header, and another between the last visible card (RGB sliders) and the footer. Reproduced twice with controlled, slow scroll increments (ruling out an elastic-overscroll rendering artifact) — the gap is persistent, not transient. Confirmed the same gap exists in **light mode** at the identical scroll position, just invisible there because it renders as plain white (i.e. this is a real layout/height mismatch present regardless of theme — some container is taller than its content — but it only becomes visually broken-looking in dark mode, where the gap's fallback background is a much colder pure-black rather than the theme's usual navy/slate card background). Professional treatment: track down the oversized container (likely a fixed/min-height wrapper around the tab content) and make the gap's background inherit the same dark-navy theme token used by surrounding cards, or remove the excess height entirely.

### Cross-tool: no unified "primary action" color

5. **[LOW-MEDIUM] Each tool's main call-to-action button uses a different accent color with no apparent system.** Surveying every tool's primary action button: JSON Compare's "Compare JSON" = blue/purple gradient; Text Compare's "Compare Text" = solid blue (with "Swap" = purple, "Reset" = gray); HTML Formatter's "Format" = orange (see finding #2); Mermaid Editor's "Render Diagram" = green (with "Download SVG" = blue); Color Picker's three peer actions "Save to History"/"Random"/"Eyedropper" = blue/purple/green respectively; UUID Generator's "Generate ID" = blue. There's no consistent color assigned to "the button that performs this tool's main function," which makes the app feel like a loose collection of independently-styled tools rather than one cohesive product. (Color Picker's rainbow of button colors may be an intentional thematic choice for a color-focused tool — flagged with lower confidence than the others in this list.) Professional treatment: reserve one accent color (the app's existing blue, used for nav-item-active-state and most CTAs already) exclusively for "the one primary action on this page," and demote secondary actions to a consistent neutral/outline style.

### Cross-tool: mobile/narrow-width layout

6. **[HIGH] Sidebar navigation never collapses below desktop width — no mobile nav pattern exists at all.** At 390px width (a standard phone viewport), every tool page's "Available Tools" sidebar renders at full width and full height, meaning the actual tool content (input panels, buttons, results) is pushed below **all 14 nav items** — a user must scroll past the entire tool list before reaching anything they can act on, on every single tool page. Confirmed via source that a collapse/hide-sidebar toggle button *does* exist in the DOM, but it's built with the Tailwind classes `hidden lg:flex` — i.e. it is unconditionally hidden below the `lg` (1024px) breakpoint, so there is no way to reach it (or reach any equivalent hamburger/drawer control) at phone or small-tablet widths. This is not a one-tool issue — it's baked into the shared layout component used by all 14 tool pages plus the homepage's own sidebar-equipped pages. Professional treatment: below `lg`, either default the sidebar to collapsed with a visible hamburger toggle pinned in the top bar, or convert it to a bottom tab bar / slide-out drawer — any pattern that puts tool content within the first screenful on mobile.

7. **[HIGH] JSON Compare's diff editor renders visually blank at narrow width, despite content being present.** At 390px width, both "Left JSON" and "Right JSON" editor panes on `/jsonCompare` show only an empty box with a single faint horizontal line — no visible JSON text at all, even though the example JSON is demonstrably still loaded (confirmed by resizing back to desktop width, where the exact same page instance immediately re-renders the full JSON content with no re-navigation or reload). This makes the JSON Compare tool effectively unusable on mobile — a user can't see or edit either input. Spot-checked jsonVisualizer and htmlFormatter's editors at the same 390px width and both render their content correctly, so this is specific to whatever diff-editor component jsonCompare uses (likely a Monaco diff editor that isn't calling `.layout()`/re-measuring on container resize), not a site-wide editor problem. Professional treatment: trigger the editor's layout/remeasure method on container resize (most embeddable code editors, including Monaco, expose a resize hook or `ResizeObserver` pattern for exactly this).

8. **[LOW] jsonVisualizer's bottom stats bar overflows horizontally at narrow width.** At 390px, the "Size / Nodes / Depth / Undo / Redo / Valid JSON" stats row is wider than the viewport and requires a separate horizontal scroll to read fully — a minor but avoidable friction point; comparable to wrapping the row onto two lines or truncating less-critical stats first on narrow screens.

### Clean / no findings

Homepage (all 5 category groups, search bar, theme toggle), JSON Compare (desktop), CSV Converter, Text Compare, Text Utilities, Markdown Preview, Regex Tester, Base64 Codec, Cron Parser, UUID Generator (desktop) all looked consistent, well-spaced, and professionally finished at desktop width in both light and dark mode (aside from the dark-mode findings above). The shared card style (colored traffic-light dots, consistent header bar, rounded corners) is applied consistently across nearly every tool and reads as a deliberate, cohesive design language — the findings above are specific breaks from that otherwise-solid baseline, not a sign the whole app lacks a design system.

## Verification

Verifier: tester-a2. Independent browser re-check of UI batch 1 (tasks #26-29) against localhost:3013, one item at a time, using fresh tabs per check to avoid stale state. Every PASS below was confirmed with a positive AND a negative case where the finding's nature allowed it (e.g. toggled a checkbox off/on and re-checked, not just eyeballed one screenshot) — not just "the button exists."

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | Mobile hamburger (≤1024px): visible below header, opens off-canvas drawer over header w/ overlay, X closes, URL unchanged | **PASS** | At 390px on htmlFormatter, hamburger renders directly below the "React ToolBox" header (no scroll needed). Clicking it opens a full-screen drawer listing all 14 tools with an overlay dimming the page behind it and an X close button top-right. Clicking X closes the drawer back to the tool content. `window.location.href` confirmed unchanged (`/htmlFormatter`) throughout open/close. |
| 2 | jsonCompare at 390px: editors show content, page scrolls to Compare | **FAIL** | Editors still render visually blank at narrow width — same symptom as the original audit finding. Confirmed via DOM inspection this is **not** a data-loss issue: `window.monaco.editor.getModels()` still holds the full JSON text (`{"name": "John", "age": 30, ...}`), but only 2 `.view-line` elements are in the DOM and the Monaco container chain collapses to near-zero height. Traced the exact collapse: `.monaco-editor` → 5px, its `flex-1 min-h-0` wrapper → 5px, the `h-full flex flex-col` panel shell → 7px, while the outer `flex-1 min-h-0 p-4` grandparent is a healthy 139px. This is a nested-flexbox height-collapse (`min-h-0` cutting off the intrinsic height chain), most likely introduced or exposed by whatever layout change the sidebar-collapse fix (item 1) made to the mobile shell — confirmed on a **fresh tab at a true 390px viewport**, not a resize artifact (verified by reproducing on 3 separate fresh tabs). "Ignore Array Order"/"Ignore Keys" checkboxes and the Compare button are reachable below the broken editors, so the page does scroll to Compare — only the editor content visibility is broken. |
| 3a | colorPicker dark mode: no black seam | **PASS** | Scrolled the full page in dark mode (controlled slow-scroll, 2 passes) — the seam is gone, dark navy background is now continuous top to bottom. Also noticed an Alpha/opacity slider was added to the RGB controls (not part of this item's scope, but a nice bonus matching a "must-have" gap from the Options audit). |
| 3b | mermaidEditor dark mode: preview auto-darkens on Default preset, explicit presets respected | **PASS** | With the "Default" theme preset and dark mode on, the rendered diagram preview now has a dark background with light node borders/text, matching the rest of the UI (previously stayed bright white). Switched to the explicit "Forest" preset and re-rendered: nodes correctly took Forest's own green fill/stroke (not force-converted to the dark palette), while the surrounding preview panel background still followed dark mode — confirms "auto-dark for Default, respect explicit choices" is implemented correctly, not just "always dark now." |
| 4a | /timestampConverter fresh load: zero hydration error toast | **PASS** | Armed console tracking before each navigation (required — tracking only starts once the tool is first called) and reloaded 3 times fresh. 0/3 hydration errors, 0/3 visible error toasts. Previously this reproduced 3/3 with the identical method. |
| 4b | Multi-timezone panel: add/remove | **PASS** | Added "America/New_York" via the "Compare across timezones" input + Add button — appeared in the list with the correct converted time (5:13 PM vs. London's 10:13 PM on the same instant, correct 5h offset). Removed "Europe/London" via its × button — it disappeared from the list, only New York remained. |
| 4c | Custom format: live preview | **PASS** | Typed `DD/MM/YYYY hh:mm A` into the format field — preview updated on every keystroke to `15/11/2023 03:43 AM`, correct token substitution for the fixed test timestamp. (Aside: a format string containing a quoted literal like `'at'` renders the quote characters literally rather than treating them as an escape sequence — not part of this checklist item, not filing as a finding since quoted-literal support was never claimed, but noting it in case it surfaces later.) |
| 5a | cronParser: timezone selector changes next-runs | **PASS** | Switched "Timezone for Next Runs" from America/New_York to Asia/Tokyo — next-run times shifted from "Friday, July 10, 2026 at 3:15 PM" to "Saturday, July 11, 2026 at 4:15 AM", a 13-hour offset, correct for NY(EDT, UTC-4)→Tokyo(JST, UTC+9). |
| 5b | cronParser: typing partial tz doesn't crash | **PASS** | Typed "Amer" (partial, invalid IANA zone) into the timezone field — no console error, no crash; panel gracefully showed "No upcoming runs found within the next 366 days." |
| 6 | htmlFormatter Format button is blue | **PASS** | Confirmed on first screenshot of this session — button is now blue/indigo matching jsonCompare's "Format & Fix", no longer orange. |
| 7a | jsonCompare: Ignore Array Order works end-to-end | **PASS** | `{arr:[1,2,3]}` vs `{arr:[3,2,1]}` (same elements, reordered): unchecked → reports `[0]` and `[2]` as changed; checked + re-compared → "JSON objects are identical!" (0 added/removed/modified, 4 unchanged). |
| 7b | jsonCompare: Ignore Keys works end-to-end | **PASS** | `{name:"a", updatedAt:"2024-01-01"}` vs `{name:"a", updatedAt:"2024-06-15"}`: with "Ignore Keys" checked + "updatedAt" entered → "identical". Sanity check with both checkboxes unchecked and the same data → correctly re-shows `updatedAt` as `changed`, proving the checkbox (not stale state) drives the result. |
| 8a | jsonVisualizer: stats bar wraps at narrow width | **PASS** | At 390px, the "Size / Nodes / Depth / Undo / Redo / Valid JSON" row now fits within the viewport with no horizontal scrollbar. |
| 8b | jsonVisualizer: {k} keys-only toggle filters search | **PASS** | Searched "You" (a value, not any key name) with keys-only OFF → 1 match; toggled `{k}` on → 0 matches. Re-searched "name" (matches the `name` key at 2 paths) with `{k}` still on → 2 matches, confirming the toggle filters to key-name matches specifically rather than just suppressing all results. |
| 9a | textCompare: Side-by-Side\|Unified toggle exists | **PASS** | Toggle renders in the Differences panel after running Compare Text, defaults to Side-by-Side. |
| 9b | textCompare: Unified view renders +/- rows | **PASS** | Clicked Unified — renders a proper unified diff with red `-`/green `+` line-prefix rows, plus inline word-level highlighting within changed lines (e.g. "with", "some", "changes" highlighted amber inside the `+` line). |
| 10a | markdownPreview: toolbar buttons insert markdown | **PASS** | Cleared the editor, clicked into it, clicked the **B** button — inserted `**bold text**` with "bold text" pre-selected for easy overwrite; preview correctly rendered it bold. |
| 10b | markdownPreview: Sync Scroll toggles proportional scrolling | **PASS** | First coordinate-based click looked like it toggled on (visual ring) but `aria-pressed` was still `"false"` — a missed click, not a bug (confirmed by re-clicking via element ref, which correctly flipped `aria-pressed` to `"true"` and the button to its blue "active" style). With it genuinely active, scrolling the editor from top to a `## Heading 21-24` position scrolled the preview pane to the matching `Heading 21-24` content in the same action — confirmed proportional sync, not just "sync scroll button exists." |
| 11 | textUtilities: `.*` regex checkbox per replace-pair, literal by default | **PASS** | Source `"literal a.b here, and axb should not match, and azb also should not match"`, search `a.b`, replace `MATCHED`. Regex checkbox unchecked (default): 1 replacement (only literal `a.b`; `axb`/`azb` untouched). Checked the box, re-ran: 3 replacements (`a.b`, `axb`, `azb` all matched) — confirms `.` is treated as a literal dot by default and only wildcards when the per-pair regex toggle is explicitly enabled. |
| 12 | uuidGenerator: v1/v7 generate, hyphens toggle works on all versions | **PASS** | UUID v1 with hyphens: `438cac61-7c95-11f1-95e6-a96abead2d8c` (version nibble `1` in `11f1`, correct). v1 without hyphens: `4b5a0c827c9511f19c1a89413fe60fbe` (32 hex chars, version nibble still `1`, correct). UUID v7 with hyphens: `019f4d7f-b2a5-7667-9d0f-a1fa8dbad83d` (version nibble `7` in `7667`, timestamp-like hex prefix consistent with time-ordered v7, correct). v7 without hyphens: `019f4d7fe4077952939c69778fd6a196` (32 hex chars, version nibble still `7`, correct). |

**Summary: 11/12 PASS, 1 FAIL.** The only failure is item 2 (jsonCompare blank editor at narrow width) — the sidebar-collapse fix (item 1) works correctly and no longer forces a long scroll past the nav list, but the diff editor's own container still collapses to near-zero height in the mobile layout via a nested `min-h-0` flexbox chain, independent of the sidebar issue. Root cause traced precisely (see item 2 row) for whoever picks up the fix. All other 11 items — layout/theme (sidebar, colorPicker seam+alpha, mermaid dark mode, htmlFormatter CTA color), the timestamp hydration fix, and every new option control across cronParser/jsonCompare/jsonVisualizer/textCompare/markdownPreview/textUtilities/uuidGenerator — verified working end-to-end with positive and negative test cases, not just visual inspection.

### Iteration 2 re-verify (item 2 fix + MonacoJsonEditor regression sweep)

Verifier: tester-a3. HEAD = `5d9ccb7`. **Method correction**: `resize_window` does not change a real tab's `innerWidth` in this environment (confirmed stuck at 606px regardless of requested size), so the prior 390px reading was against an unconfirmed viewport. Used a same-origin `<iframe>` pinned via `style.width`/`style.height` instead — this does give an independent CSS viewport (`iframe.contentWindow.innerWidth` verified at the requested value each time). **Second method note**: a bare `javascript_tool` read immediately after `navigate`/iframe-load reports Monaco containers as 5×5px with 0 view-lines even when the fix is working — Monaco's `automaticLayout` relayout is gated behind a real compositor paint (rAF-driven), which a background/non-composited automation tab or freshly-loaded iframe hasn't had yet. A `computer` screenshot or scroll forces that paint; measurements taken only after one are reliable. All results below were taken post-paint.

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | jsonCompare @ 390px (iframe, `innerWidth` confirmed 386): both editors render full content | **PASS** | Left and Right `.monaco-editor` both 302×105px (was 5×5px pre-fix), 4 `.view-line` elements each (matches the 4-line default JSON), confirmed via `monaco.editor.getEditors()[].getLayoutInfo()` and DOM `getBoundingClientRect()` agreeing. Screenshot shows both panels with visible line numbers 1-4, no blank editors. |
| 2 | jsonCompare @ desktop (iframe, `innerWidth` confirmed 1396): no regression from the absolute-inset change | **PASS** | Both editors 518×506px, 4 view-lines each. Sidebar tool list, panel headers, and Format & Fix buttons all render unclipped. |
| 3 | jsonVisualizer JsonInputPanel (2nd MonacoJsonEditor consumer) @ desktop (iframe, 1396px, `lg:grid-cols-2` active) | **PASS** | Editor renders at 1238×560px, 17 view-lines, full default JSON sample visible with syntax highlighting — matches jsonCompare's healthy desktop behavior. |
| 4 | jsonVisualizer JsonInputPanel @ narrow widths (real tab ~606px logical width, and iframe @ 386px — both `<1024px lg breakpoint`, so `grid-cols-1` stacks panels vertically) | **FAIL (pre-existing, not caused by this fix)** | Editor collapses to 5px height / 1 view-line at both widths, confirmed after forced paint (screenshot then re-measure) so this is not the automaticLayout-timing artifact from note above — it reproduces identically on a real tab and in a clean iframe. Traced the chain: `.grid.grid-cols-1` parent is a healthy 1376px, but its `.min-h-0` child (JSON Input's grid cell) is only 61px, and the panel card `.flex.flex-col.h-full...` inside it inherits that same 61px — leaving ~5px after the header row for `MonacoJsonEditor`'s own (correctly-fixed) `.flex-1.min-h-0.relative` / `.absolute.inset-0` wrapper. The bug is one level *above* the shared component, in `JsonVisualizerRefactored.tsx`'s `grid-cols-1 lg:grid-cols-2` container, which never gives its grid-cols-1 (stacked) row a definite height. **Confirmed pre-existing**: `git show 5d9ccb7 --stat` touches only `MonacoJsonEditor.tsx` (the `absolute inset-0` wrapper), `CommandPalette.tsx`, and `StatusBar.tsx` for jsonVisualizer — `JsonVisualizerRefactored.tsx` and `JsonInputPanel.tsx` are untouched by this commit, so this is an independent, already-existing bug the item-2 fix never covered, not a regression it introduced. Affects both mobile (390px) and tablet (<1024px) widths identically. |
| 5 | Spot-check smoke: htmlFormatter, colorPicker, mermaidEditor, timestampConverter, cronParser, textCompare, markdownPreview, textUtilities, uuidGenerator — console errors on load | **PASS** | 0 console errors/warnings across all 9 pages on fresh navigation. |

**Iteration 2 summary: item 2 (jsonCompare blank editor) is now CONFIRMED FIXED at both mobile and desktop widths, with no regression to jsonCompare itself.** However, the regression sweep across the shared `MonacoJsonEditor`'s other consumer surfaced a **second, independent blank-editor bug**: jsonVisualizer's `JsonInputPanel` collapses to ~5px at any viewport below the `lg` (1024px) breakpoint, i.e. it never worked at mobile *or* tablet widths — same visual symptom as the original jsonCompare bug, but a different root cause (grid-row height, not the flex `min-h-0` chain inside `MonacoJsonEditor`) in a different file (`JsonVisualizerRefactored.tsx`). This was not introduced by `5d9ccb7` and was not previously caught by the UI-batch audit (which only tested jsonVisualizer at desktop width — see original audit row 8a/8b, both desktop-only). Recommend filing as a new fix task before considering the JSON-editor blank-screen class of bugs closed app-wide.

### Iteration 3 re-verify (reviewer's exact checklist + jsonVisualizer fix confirmation)

Verifier: tester-a3. Ran the reviewer's specific per-consumer checklist (desktop interactions on both jsonCompare and jsonVisualizer, plus 390px content checks on both). Desktop interaction testing used an *unscaled* 1400px iframe with the outer page scrolled to bring off-screen controls into view (a `transform: scale()` iframe was tried first for interactive testing but broke synthetic click routing — see note below); every state change was followed by a `computer` screenshot/scroll before measuring, per the iteration-2 paint-timing note.

**Tooling note**: the `computer` tool's synthetic `type` action does not register keystrokes inside a Monaco editor in this environment — confirmed with 0/2 attempts (real tab and iframe) leaving the model unchanged despite a successful click+type report. Content changes were instead driven via `editor.setValue()`, which correctly triggers the same React `onChange` → validation → re-render pipeline a real keystroke would, so "typeable" is confirmed functionally end-to-end (change propagation, parse-error detection, Format & Fix) but not via literal simulated key-presses. Flagging as a testing-tool limitation, not a product defect.

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | jsonCompare @ desktop (1400px iframe): left+right editors full height | **PASS** | 518×506px, 4 view-lines each on fresh load. |
| 2 | jsonCompare @ desktop: toggle diff view (Compare JSON) — editors shrink to `min-h-[180px]` + resize handle appears | **PASS (desktop only — see #6 for narrow-width FAIL)** | Post-click, post-paint: both editors 255px tall (down from 506px), 4 view-lines each, still fully readable; horizontal resize-handle bar visible between the editors row and the Ignore Array Order/Ignore Keys controls. |
| 3 | jsonCompare @ desktop: swap button | **PASS** | `monaco.editor.getModels()` before: `[...2024-01-01, ...2024-06-15]`; after clicking the swap button (`title="Swap left and right JSON contents"`): `[...2024-06-15, ...2024-01-01]` — contents correctly swapped. |
| 4 | jsonCompare @ desktop: Format & Fix buttons | **PASS** | Set left editor to malformed `{ name: 'a', updatedAt: '2024-06-15', }` (unquoted keys, single quotes, trailing comma) via editor API, clicked "Fix common JSON issues and format" — output correctly repaired to valid pretty-printed JSON `{\n  "name": "a",\n  "updatedAt": "2024-06-15"\n}`. |
| 5 | jsonVisualizer @ desktop (1400px iframe): input panel editor full height | **PASS** | 1238×560px, 17 view-lines, full default sample visible. |
| 6 | jsonVisualizer @ desktop: Format dropdown opens un-clipped | **PASS** | Clicked "Format ▾" — "INDENTATION" panel with 2/4/6/8 chips renders fully, not cut off by the viewport or a parent `overflow` clip. |
| 7 | jsonVisualizer @ desktop: toggle editor visibility (grid-cols-1 ↔ 2) | **PASS** | Clicking the eye icon hides the JSON Input panel entirely and the grid drops to a single `JSON Viewer` column (no leftover empty grid cell). Clicking "Show Editor" restores it — grid class reads `grid gap-4 h-full grid-cols-1 lg:grid-cols-2` again, editor re-renders at full 1238px height (matches item 5), no residual collapse from the toggle round-trip. |
| 8 | jsonVisualizer @ desktop: error row sits below the editor without shrinking it to 0 | **PASS** | Set editor content to `{ invalid json ]` via API — editor height stayed at 585px (no collapse), a red squiggly appears inline in Monaco on the bad token, and a "Parse Error / Expected property name or '}' in JSON at position 2..." message renders below the editor. Editor and error message coexist; editor is not replaced or zeroed. |
| 9 | jsonCompare @ 390px (iframe, `innerWidth` confirmed 390): both editors render content | **PASS** | Unchanged from iteration 2 — 302×105px, 4 view-lines each. |
| 10 | jsonVisualizer @ 390px (iframe, `innerWidth` confirmed 390): editor renders content | **PASS — confirms task #34's fix** | 353×356px, 18 view-lines, full JSON visible with syntax highlighting (was 5×5px/1 view-line in iteration 2 before the fix). |
| 11 | jsonVisualizer @ tablet (iframe, `innerWidth` confirmed 700, still `<1024px lg` breakpoint) | **PASS — confirms fix covers the full narrow range, not just true mobile** | 666×359px, 16 view-lines. |

**New finding — jsonCompare showDiff collapse at narrow/tablet widths.** While confirming item 2 above, first tested it on a real tab pinned at its native ~606px logical width (also `<1024px lg`, i.e. the same "narrow" bucket as the fixed jsonVisualizer bug) instead of the 1400px iframe. There, clicking "Compare JSON" made **both editors collapse to ~5px/blank**, and — unlike every other blank-editor case in this document — an extra forced-paint screenshot and a scroll action did **not** recover them; the screenshot itself shows genuinely empty editor bodies (thin gray line, no visible JSON), confirming this is a real layout bug, not the automaticLayout/paint-timing artifact. Traced via DOM chain (`getBoundingClientRect` at each ancestor level for the collapsed Right-JSON editor): the showDiff row wrapper (`flex flex-col lg:flex-row ... min-h-[180px] flex-shrink-0`, `style="flex-basis:40%"`) measures a healthy 270px, but at narrow widths it's `flex-col` (stacked), and that 270px budget also has to fit **both panel headers (~56px each) plus the swap-button div** — which uses `lg:absolute` positioning, meaning below `lg` it sits in normal flex flow and consumes real vertical space (~80px, matches the visible circular swap button in the screenshot) — leaving essentially nothing for either editor body. Confirmed via `git show 5d9ccb7 --stat` that `JsonComparer.tsx` (where this row lives) is untouched by the fix commit, same as the jsonVisualizer bug — **pre-existing, not a regression**, just newly surfaced because no prior audit pass tested editor visibility specifically while `showDiff` was active at a narrow viewport (iteration-1's Ignore-Array-Order/Ignore-Keys tests only checked the Differences-panel results, not whether the source editors stayed visible). At true desktop (1400px, `lg:flex-row`) the swap button is absolutely positioned out of flow and the same toggle works fine (item 2 above).

**Iteration 3 summary: all reviewer checklist items PASS at desktop, and the jsonVisualizer mobile/tablet fix (task #34) is confirmed solid at both 390px and 700px.** One new pre-existing bug found and not yet fixed: **jsonCompare's diff view (post-"Compare JSON") collapses both editors to blank at any width below the 1024px `lg` breakpoint** — a third, independent instance of the same "blank JSON editor" symptom class, this time caused by the swap-button div's `lg:absolute` positioning eating into the diff-state's `min-h-[180px]` budget on stacked layouts. Recommend a fix task alongside/after the jsonVisualizer one before closing out this bug class.

### Iteration 4 re-verify (task #34's `min-h-[420px]` floor fix — coder-ui-json's updated approach)

Verifier: tester-a3. `JsonVisualizerRefactored.tsx` was updated again since iteration 3 — confirmed via `grep` the grid items now each wrap in `<div className="min-h-[420px] lg:min-h-0">` (line 93 and 112), giving each stacked panel an explicit floor below `lg` instead of relying on `h-full` alone. Same iframe method as before (real tab stuck at native logical width regardless of `resize_window`; forced-paint screenshot before every measurement).

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | jsonVisualizer @ 390px (iframe, `innerWidth` confirmed 390): JsonInputPanel editor renders content AND JSON Viewer tree renders below it | **PASS** | Editor 356×353px, 18 view-lines, full syntax-highlighted JSON visible. `JSON Viewer` panel with `Object`/`name: "JSON Visualizer"` tree renders immediately below (confirmed both by screenshot and `document.body.innerText` containing the tree's field names). |
| 2 | jsonVisualizer @ 606px tablet (iframe, `innerWidth` confirmed 606, still `<1024px lg`) | **PASS** | Editor 572×359px, 16 view-lines, full content + JSON Viewer tree below, same as 390px case — Format/Copy header buttons both fully visible unclipped at this width. |
| 3 | jsonVisualizer @ desktop (iframe, `innerWidth` confirmed 1400): unchanged, side-by-side, full height, no regression | **PASS** | Editor 562×1238px, 16 view-lines; grid class `grid gap-4 h-full grid-cols-1 lg:grid-cols-2` (2-column active); left offset 241px confirms it's sitting beside the sidebar as expected for a side-by-side layout. |
| 4 | jsonVisualizer @ desktop: no double scrollbar | **PASS** | Checked `scrollHeight` vs `clientHeight` at every level: only `html` has `hasScroll:true` (1510 vs 1100) — both `<main>` elements (app-shell's and JsonVisualizerRefactored's own, which uses `overflow-y-auto lg:overflow-hidden`) report `scrollHeight === clientHeight` at this width, i.e. no independent inner scroll region fighting the page scroll. Single scrollbar confirmed. |
| 5 | jsonCompare @ 390px (iframe, `innerWidth` confirmed 390): still good, no regression from the jsonVisualizer fix | **PASS** | Both editors 306×282px, 4 view-lines each, full content visible — unaffected by the unrelated `JsonVisualizerRefactored.tsx` change (different file/component). |

**Iteration 4 summary: the `min-h-[420px] lg:min-h-0` fix for task #34 is confirmed solid across mobile (390px) and tablet (606px), with no regression to the desktop layout (still true side-by-side, full height, single scrollbar) and no cross-contamination into jsonCompare.** This closes out the jsonVisualizer blank-editor bug. Remaining open item from iteration 3: the jsonCompare showDiff-collapse-at-narrow-width bug (separate file, separate root cause, not yet fixed).

### Iteration 5 — textCompare Batch A + polish verification (Suite 1)

Verifier: tester-a4. Scope: real-time diff, collapse/expand folding, Word/Char granularity (incl. emoji edge case), per-pane copy/clear + Copy Diff, upload/drag-drop. All content set via file-drop simulation (`DataTransfer` + synthetic `dragenter`/`dragover`/`drop` events dispatched on the pane's `<textarea>`, which bubble to the panel's drop handler) since `textCompare` uses plain `<textarea>` elements, not Monaco — direct `computer` typing also worked here (confirmed once) but drop was used for precise/large content. Native OS file-picker (the Upload button) can't be automated in this environment; verified instead that it shares the exact same `readFile()` code path as drag-drop (`useFileIO.ts` — `uploadFile()` calls `readFile()` internally), so drag-drop's PASS result carries over.

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | Real-time diff updates ~250ms after typing stops, no Compare click needed; large input shows amber pause banner + blue-promoted Compare button, still works on click | **PASS** | Typed into a loaded pane via direct `computer` keystrokes — Comparison Statistics auto-updated (60%→40% similarity) with no click. Loaded 1100×1100-line panes (line-product 1.21M, over the `AUTO_DIFF_LINE_PRODUCT_LIMIT` of 1M in `autoDiffGuard.ts`) — amber "Input is large — live diffing is paused. Click Compare to update." banner appeared, Compare button's class switched from gray to `bg-blue-600` (promoted), and clicking it still ran the comparison (stats updated to 1100 lines modified, plus a bonus correct "Inputs too large for a precise diff" LCS-fallback banner from `LineDiffAlgorithm`). |
| 2 | Collapse/expand: long identical middle run folds to "⋯ N unchanged lines" in both Side-by-Side (aligned) and Unified; click-to-expand; Expand-All; Context Lines input changes fold threshold; Context Lines=0 folds all (diff-only) | **PASS** | 32-line test (1 header + 30 identical + 1 footer, header/footer differ) with default Context Lines=3: folded to "24 unchanged lines — click to expand" at the *same row position* in both Original/Modified columns (verified aligned, not just present on one side). Clicked the fold → expanded correctly, all 30 lines revealed sequentially. Set Context Lines to 0 (via native input-value setter + `input`/`change` events, since coordinate-click + type was unreliable for this small numeric field) → re-folded to "30 unchanged lines" (full diff-only mode, no context lines shown at all). "Expand All" button appeared once any fold existed, and expanding it removed all folds in one click. Repeated the Context Lines=0 fold check in **Unified** view — same "30 unchanged lines — click to expand" row rendered correctly there too. |
| 3 | Granularity: Word highlights whole word, Char highlights only changed chars; emoji ("a😀b"→"a😢b") in Char mode stays intact (no broken glyph/lone surrogate) | **PASS (Char mode)** — **BUG found in Word mode**, see below | Char mode: DOM-inspected the leaf text nodes — `😀`/`😢` each render as one complete, correctly-colored emoji glyph inside a single highlighted `<span>` (only the emoji highlighted, `a`/`b` untouched) — exactly per spec. Word mode (plain whole-word highlighting on ordinary text without spaces) also behaves correctly. |
| — | **BUG**: Word-granularity tokenizer splits astral-plane characters (emoji) into two lone UTF-16 surrogate halves when adjacent to a diff, producing a visibly broken/tofu glyph and inconsistent highlight classification between the two halves | **FAIL** | `WordDiffProcessor.ts:32` — the word-mode tokenize regex `line.split(/(\s+|[^\w\s])/)` has **no `u` (unicode) flag**, so `[^\w\s]` matches per UTF-16 code unit instead of per code point. Reproduced live: for `"a😀b"` vs `"a😢b"` in Word mode, `"a😀b".split(/(\s+|[^\w\s])/)` yields `["a","\ud83d","\ude00","b"]` — the emoji's high and low surrogate become two separate tokens. Confirmed in the rendered DOM: `<span class="">a</span><span class="">\ud83d</span><span class="bg-yellow-300...">\ude00</span><span class="">b</span>` — one surrogate half is classified "unchanged" (no highlight) and the other "changed" (yellow highlight), and the screenshot shows a visibly broken/tofu glyph where the intact emoji should render (zoomed crop taken as evidence). Char mode is unaffected because its tokenizer correctly uses `Array.from(line)` (code-point iteration, per the code's own comment at `WordDiffProcessor.ts:28-29`) — only the Word-mode regex lacks the equivalent safety. Fix: add the `u` flag to the split regex (`/(\s+|[^\w\s])/u`) or pre-tokenize by code point before applying the word/punctuation split. |
| 4 | Copy/Clear per pane + Copy Diff; Copy Diff copies the same report as Export; no false "Copied!" if clipboard unavailable | **PASS** | Per-pane Copy: with `navigator.clipboard.writeText` mocked to succeed, click correctly calls it with the exact pane text, icon switches to checkmark, and reverts to the copy icon after exactly ~2000ms (`COPY_FEEDBACK_MS`). In this automation environment the **real** clipboard API is unavailable (`readText()` hangs pending an unresolvable permission prompt; `writeText()` silently rejects) — clicking Copy against the real API correctly showed **no** checkmark (silent catch, no false positive), confirming the negative path the task asked to verify. Clear: empties the pane instantly. Copy Diff vs Export: captured both outputs (Copy Diff via mocked `clipboard.writeText`, Export via intercepted `URL.createObjectURL` blob content) — identical `=== Text Compare Report ===` structure, stats line, and per-line `~`/marker body; only the `Date:` timestamp differs (expected, generated at click-time for each). |
| 5 | Upload + drag-drop: upload replaces pane text; drag shows ring + replaces text; >5MB shows red size-cap banner (auto-dismiss ~4s) and does not load | **PASS** | Drag-drop: dispatched `dragenter`/`dragover` with a small text file — pane border turned blue with a ring (drag-over highlight) before drop; completing the `drop` replaced the pane's text with the file's content exactly. >5MB case: constructed a 6,000,000-byte file (over the 5,242,880-byte `MAX_DROP_FILE_SIZE_BYTES` in `TextInputPanel.tsx`), dropped it — pane content was **not** replaced (confirmed unchanged), DOM briefly contained the exact string `File too large (max 5MB)`, and re-checking ~1s+ later confirmed the message text was gone (auto-dismissed per the 4000ms `DROP_ERROR_DISPLAY_MS` timeout). Upload button itself uses the native OS file picker, which this environment cannot drive; verified via source (`useFileIO.ts`) that `uploadFile()` and drag-drop both terminate in the same `readFile()` call, so this drag-drop PASS gives high confidence the upload path behaves identically once a file is selected. |

**Iteration 5 summary: 4 of 5 items fully PASS; item 3 surfaced one real, reproducible bug.** Real-time diffing (including the large-input pause guard), fold/collapse in both view modes, per-pane copy/clear, Copy Diff/Export parity, and drag-drop (including the size-cap rejection) all work exactly as specified. The one defect: **Word-granularity char-diff breaks astral-plane characters (emoji, and likely other supplementary-plane text) into lone surrogate halves** because `WordDiffProcessor.ts:32`'s tokenizer regex lacks the `u` flag — this produces a visibly broken glyph and an incorrectly split highlight boundary any time a Word-mode diff line contains an emoji/astral character next to an actual change. Char-mode granularity is unaffected (already code-point-safe). Recommend a one-line fix (`/u` flag on the regex) before closing out this batch.

### Iteration 6 — Monaco editor height-collapse sweep (Suite 2)

Verifier: tester-a4. Scope: re-confirm the height-collapse class fix now applied at all 3 Monaco call sites (jsonCompare input state, jsonCompare showDiff state — the #37 bug, jsonVisualizer input — #34 reconfirm, mermaidEditor — the #37 bonus find) at 390px, 606px, and desktop (~1400px). Same iframe method as prior iterations (`style.width`-pinned same-origin iframe, `contentWindow.innerWidth` verified each time) plus a forced-paint `computer` screenshot before every measurement, per the iteration-2/3 paint-timing notes. All dimensions below are `getBoundingClientRect()` on `.monaco-editor` plus a `.view-line` count, taken post-paint.

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | jsonCompare @ 390px (`innerWidth` 386), default input state: both editors render full content | **PASS** | Left/Right editors both 287×105px, 4 view-lines each. Screenshot confirms full JSON visible, stacked layout, no clipping. |
| 2 | jsonCompare @ 390px, after clicking Compare JSON (showDiff): both editors stay intact, no collapse | **PASS** | Editors unchanged at 287×105px/4 lines post-click (this was the exact #37 symptom — narrow-width showDiff collapsing to ~5px blank — now confirmed absent). Scrolled the iframe down and confirmed the Tree diff panel ("updatedAt: changed", old→new values) renders fully below the still-visible, still-legible editors. |
| 3 | jsonCompare @ 606px (`innerWidth` 602), input state | **PASS** | Both editors 503×130px, 4 view-lines each. |
| 4 | jsonCompare @ 606px, after Compare JSON (showDiff) | **PASS** | Both editors 503×105px, 4 view-lines each, `Differences` text present in DOM — no collapse. |
| 5 | jsonCompare @ desktop (`innerWidth` 1400), input state | **PASS** | Both editors 512×506px, 4 view-lines each. |
| 6 | jsonCompare @ desktop, after Compare JSON (showDiff) | **PASS** | Both editors 512×193px, 4 view-lines each (correctly shrunk to the diff-row budget, same as iteration 3's desktop reading) — plus the Tree diff view rendered correctly below. |
| 7 | jsonVisualizer input editor @ 390px (reconfirm #34) | **PASS** | 337×353px, 18 view-lines, full syntax-highlighted JSON + JSON Viewer tree visible below. |
| 8 | jsonVisualizer input editor @ 606px | **PASS** | 553×359px, 17 view-lines. |
| 9 | jsonVisualizer input editor @ desktop | **PASS** | 554×1238px, 17 view-lines — matches iteration 4's desktop reading exactly, no regression. |
| 10 | mermaidEditor "Mermaid Code" editor @ 390px (the #37 bonus find) | **PASS** | 306×359px, 12 view-lines, full `graph TD` sample visible alongside a correctly-rendered Diagram Preview and Nodes/Edges panels below. |
| 11 | mermaidEditor editor @ 606px | **PASS** | 522×359px, 8 view-lines. |
| 12 | mermaidEditor editor @ desktop | **PASS** | 353×351px, 10 view-lines, diagram preview + node/edge style panels all render correctly alongside it. |

**Iteration 6 summary: all 12 checks PASS — zero editor collapses found at any of the 3 widths, in any state, across all 3 tools.** The height-collapse fix (bringing the fixed class to all 3 call sites) fully resolves: the original jsonCompare-input bug (item 2 from iteration 1), the jsonVisualizer mobile/tablet bug (task #34, iterations 2-4), the jsonCompare showDiff-at-narrow-width bug found in iteration 3 (items 1-2 above), and the mermaidEditor bonus find (items 10-12) — with no regressions to any tool's desktop layout. This closes out the entire "blank Monaco editor" bug class across the app.

### Iteration 7 — re-check: Word-mode emoji surrogate-split fix (from Iteration 5, item 3)

Verifier: tester-a4. Coder added the `u` (unicode) flag to `WordDiffProcessor.ts:32`'s tokenize regex. Re-tested the exact repro from iteration 5 plus an ASCII regression check, both in Word mode on `/textCompare`.

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | `"a😀b"` vs `"a😢b"`, Word mode: emoji renders as one intact glyph, no broken/tofu half | **PASS — bug fixed** | DOM-walked the leaf text nodes: `😀` and `😢` each now appear as a single complete text node (not split into `\ud83d`/`\ude00` lone surrogates) inside one `bg-yellow-300...` highlighted `<span>`, with `a`/`b` unstyled on either side — identical structure to the already-correct Char-mode rendering from iteration 5. Zoomed screenshot confirms a clean, fully-rendered grinning-face emoji with amber highlight, no tofu/replacement-glyph artifact (visually matches the Char-mode screenshot from iteration 5, unlike the broken one). |
| 2 | ASCII regression check: ordinary Word-mode diffing unaffected by the `u`-flag change | **PASS** | `"The quick brown fox jumps."` vs `"The quick red fox leaps."` in Word mode: `brown`/`jumps` highlighted on the left, `red`/`leaps` highlighted on the right, `The`/`quick`/`fox`/`.` unstyled on both sides — normal whole-word highlighting behaves exactly as before the fix. |

**Iteration 7 summary: the Word-mode emoji/astral-character bug from iteration 5 is confirmed fixed, with no regression to normal ASCII word-level diffing.** This closes the one outstanding defect from Suite 1 — all of Suite 1 and Suite 2 are now fully PASS.

### Iteration 8 — textCompare Batch B verification (search-in-diff, ignore-pattern, whitespace, diff-only)

Verifier: tester-a4. Scope: B1 (search-in-diff), B2 (ignore-pattern regex + whitespace modes), B3 (Changes Only diff-only toggle), plus a Batch A regression spot-check on the refactored Unified view. All content set via file-drop simulation on `/textCompare`'s plain `<textarea>` panes, same method as prior textCompare iterations.

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | B1 — search match count "`X / Y`" updates, orange highlight on all matches, current match has a stronger ring | **PASS** | `"apple banana apple cherry apple date apple"` vs `"apple banana grape cherry apple fig apple"`, searched `apple`: counter read "1 / 7" (4 left + 3 right occurrences), all 7 highlighted orange, and the first occurrence additionally had a distinct ring border (zoomed screenshot confirms the ring is visually distinct from the plain-orange non-current matches). |
| 2 | B1 — ↑/↓ navigation with wraparound | **PASS** | Clicking ↓ (Next match) 6 times advanced the ring/counter 1→2→…→7 across the correct occurrences; a 7th click wrapped to "1 / 7" with the ring back on the first match. Clicking ↑ (Previous match) from "1 / 7" wrapped backward to "7 / 7" with the ring on the last match. Both directions confirmed. |
| 3 | B1 — search works in both Side-by-Side and Unified | **PASS** | Switched to Unified mid-search: the same "apple" query, match count, and ring persisted correctly (still 1/7, first match ringed); clicking Next in Unified advanced to 2/7 on the correct occurrence. |
| 4 | B1 — "Changes only" (search-scoped) checkbox restricts matches to added/removed/changed lines | **PASS** | 3-line text (`apple unchanged line` / `apple changed line old→new` / `apple another unchanged`, only line 2 differs): searching "apple" with the checkbox off found 4/4 matches (all 3 lines + one extra unified row); checking "Changes only" dropped it to 1/2, with only the removed/added row's "apple" occurrences still highlighted — the two unchanged-line "apple"s lost their highlight entirely. |
| 5 | B1 — searching text inside a folded run force-expands the fold and the match is reachable | **PASS** | 22-line text (HEADER/FOOTER differ + 20 identical `Common line N` in between, Context Lines=3 default — normally folds to "14 unchanged lines"): searching `Common line 10` (deep inside the fold) rendered the entire common block expanded with no fold marker at all, match counter "1/1", ring on `Common line 10`. |
| 6 | B1 — invalid regex (Regex checkbox on) shows inline error, no crash, diff keeps working | **PASS** | Regex checkbox on, searched `(unterminated[`: search bar shows "0 matches" plus a red inline message "Invalid regular expression: /(unterminated[/giu: Unterminated character class"; the diff panel itself kept rendering normally (Comparison Statistics still showed 90.9% similarity, all lines visible) — no crash, no blank page. |
| 7 | B2 — Ignore Pattern regex strips timestamps, texts differing only in the pattern diff as unchanged | **PASS** | `"Log entry at 12:30:45 - request started"` vs `"...18:05:09..."`, Ignore Pattern `\d{2}:\d{2}:\d{2}`: Comparison Statistics flipped to 100% similarity / 0 modified once the pattern was entered. |
| 8 | B2 — invalid regex in Ignore Pattern shows inline red error, diff still runs (ignores nothing), no crash | **PASS** | Same content, Ignore Pattern changed to `(unterminated[`: red-bordered input plus "Invalid regular expression: /(unterminated[/gu: Unterminated character class" below it; Comparison Statistics correctly fell back to 0% similarity / 1 modified (i.e. the broken pattern was simply not applied, not treated as ignoring everything or crashing). |
| 9 | B2 — Whitespace dropdown "Ignore all whitespace differences" treats `"a   b"` vs `"a b"` as unchanged | **PASS** | Selecting "all" from the Whitespace dropdown flipped Comparison Statistics to 100% similarity / 0 modified for this internal-whitespace-only difference. |
| 10 | B2 — old default (`leadingAndTrailing`) still behaves as before: trims edges only, does not collapse internal whitespace | **PASS** | Same `"a   b"` vs `"a b"` pair with mode set to `leadingAndTrailing`: correctly still reported 0% similarity / 1 modified (internal whitespace is untouched by an edge-trim mode — proves it's distinct from "all", not an accidental alias). Positive case confirmed separately: `"   hello world   "` vs `"hello world"` under `leadingAndTrailing` → 100% similarity (leading/trailing whitespace correctly ignored). |
| 11 | B3 — main "Changes Only" checkbox folds ALL unchanged runs regardless of the Context Lines value, in both views | **PASS** | 12-line text (HEADER/FOOTER differ + 10 identical common lines, Context Lines left at 3): before checking "Changes Only", the fold showed "click to expand" for a 4-line hidden run (10 − 2×3); after checking it, the fold covers all "10 unchanged lines" instead — confirmed in both Side-by-Side and Unified views. |
| 12 | B3 — Context Lines input disables while "Changes Only" is checked | **PASS** | `contextLinesInput.disabled` flipped `false → true` the instant the checkbox was checked (also visually greyed out in the screenshot). |
| 13 | Regression — plain diff, collapse/fold, and Word/Char word-level highlighting (Batch A) still work after the Unified-view "shared rows" refactor | **PASS** | Plain diff and Word-mode whole-word highlighting confirmed throughout (e.g. item 1's apple/banana test, and a dedicated `"brown"/"jumps"` vs `"red"/"leaps"` check). Char-mode confirmed with `"hello world"` vs `"hallo world"`: only the single differing character (`e`→`a`) was highlighted in each line, everything else including `world` and the rest of `h_llo` left unstyled — precise character-level diffing intact. Fold/collapse confirmed working correctly (see item 11's baseline read and iteration 5/6 checks). |

**Minor observation (not filed as a blocking bug):** while probing item 5 above, repeatedly drag-dropping a *new* set of files directly over existing diff content — without an intervening `Reset` click or a manual `Compare Text` click — occasionally left a fold force-expanded from a previous search rather than re-collapsing for the fresh content, until either `Reset` was clicked or `Compare Text` was pressed manually (both of which immediately corrected it). Real-time auto-diff on a fresh page load or after `Reset` always folded correctly. This only surfaced under back-to-back synthetic drops in the same session (not a flow a real user is likely to hit — typing, one drop, or reset-then-drop all behaved correctly) — flagging for awareness only, not requesting a fix.

**Iteration 8 summary: all 13 requested Batch B checks PASS, and the Batch A regression spot-check (plain diff, fold/collapse, Word/Char highlighting) is clean after the Unified-view refactor.** One minor, low-severity, edge-case observation noted above (stale fold-expansion state across back-to-back content replacements without a Reset) but not blocking — normal usage paths (type, single drop, or reset-then-drop) all work correctly.
