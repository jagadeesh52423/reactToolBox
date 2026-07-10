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
