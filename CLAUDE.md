# PA28 Checklist Project

This project contains aircraft checklists for the PA-28, along with related tools such as weight and balance calculations.

## Rules for checklists (CRITICAL)

- When working with checklist content, ONLY copy and paste existing text verbatim.
- Do NOT add, remove, reword, reorder, or otherwise change any checklist item unless the user has explicitly told you to.
- If you think something should be added, removed, or changed, you MUST ask the user first and wait for approval. Do not make the change on your own.
- This applies to all checklist sources and outputs (e.g. `.md`, `.tex`, `.txt`, PDF-derived content).
- Every checklist must be marked "UNOFFICIAL – FOR REFERENCE ONLY" (LaTeX footer on every page via checklist-style.tex / G-CEZO_Checklist.tex; a note at the top of .md/.txt; stamped copy for the source PDF).

## Rules for weight & balance and other calculations

- When copying or recreating weight and balance functions, formulas, or any other math, reproduce them exactly and correctly.
- Preserve all values, units, constants, arms, limits, and equations from the source. Double-check every calculation.
- Where sources disagree (POH, weight schedule, club spreadsheets), use the most conservative value as the default.
- Exception: unit conversions (kg↔lb 2.20462262, USG↔L 3.78541 / 0.264172) are verified and fixed (GCEZO_CONV) — not editable, do not change.
- Every other default must be editable by the user:
  - Aircraft data (changes only if the aircraft changes) goes on the Aircraft settings page, tools/settings.html (GCEZO_PARAMS in tools/gcezo-lib.js).
  - Per-flight assumptions (wind credit, pressure-altitude rule, distance/safety factors, reserves, contingency, power setting) are edited on the pages that use them, not on Settings.
- Every calculation must show its equation, with the live numbers substituted ("Show the maths" blocks, helpers in tools/gcezo-ui.js).
- Every tool page must show the disclaimer banner (DISCLAIMER_HTML in tools/gcezo-ui.js, added by navBar).
- Every abbreviation shown on a tool page must have an explanation in GLOSSARY (tools/gcezo-glossary.js).

## Repository

- The repo is public and published with GitHub Pages (https://tieziyun.github.io/pa28-flight-planning/). Never commit `G-CEZO POH.pdf` (131 MB, over GitHub's limit; Piper copyright) — it is in .gitignore.
