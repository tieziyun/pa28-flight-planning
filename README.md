# G-CEZO PA-28-161 Cadet — planning tools and checklists

> **UNOFFICIAL — FOR REFERENCE AND DOUBLE-CHECKING ONLY. Do not use for your main calculations.**
>
> This is an unofficial, unapproved and untested training aid. It is not a substitute for the aircraft's POH/AFM, the operator's procedures,
> official weather, NOTAMs and charts, or an instructor. Chart values were digitised from a scanned POH and any figure may be wrong.
> The pilot in command alone is responsible for the flight and for verifying every figure (SERA.2010).
> Provided "as is", without warranty of any kind, express or implied. To the fullest extent permitted by law, the author(s) accept no
> responsibility or liability for any loss, damage, injury or death arising from its use or from reliance on it.
> Nothing here excludes liability that cannot lawfully be excluded.

**Web tools:** <https://tieziyun.github.io/pa28-checklist/> (opens `tools/preflight.html`). They run entirely in the browser and work offline; inputs are stored only in your own browser.

## Web tools (`tools/`)

| Page | What it does |
|---|---|
| Pre-flight planning | Planning in order: pilot → documents & aircraft → weather & NOTAMs → route → fuel → weight & balance → take-off/landing → before you go, with a summary of every check |
| Weight & balance | Loading form, C.G. envelope plot (POH Section 6, G-CEZO weight schedule) |
| Take-off / landing | Distances from the POH Section 5 charts, wind components, factors, runway drawing and the POH chart worksheet with this flight's path drawn on it |
| Nav legs | Wind triangle per leg (optional per-leg wind), PLOG with altitudes and frequencies |
| Fuel | Fuel plan with Part-NCO reserve check |
| Aircraft settings | Aircraft data (weights, arms, limits, fuel flows); change only if the aircraft changes |

Every page shows its equations ("Show the maths") and explains every abbreviation (hover, and the list at the bottom of the page).
Chart digitisation reproduces each POH worked example to within about 3%.

## Checklists (all marked unofficial, for reference only)

- `G-CEZO_Checklist.tex` / `.pdf` — A5, Pooleys-style layout. Part A: Redhill & Shoreham PA28 checklist (Rev 1.0, 31 Mar 2021) as printed, with boxed POH reference notes ("POH differs" where the POH figure is different). Part B: the POH checklists.
- `G-CEZO_POH_Checklists.tex` / `.pdf` — A5, the POH Section 3 and 4 checklists and 2.23 placards on their own.
- `poh-body.tex`, `checklist-style.tex`, `checklist-assets/` — shared LaTeX content and style. `poh-supplements.tex` holds the Section 9 supplement procedures, removed from the checklists (not included).
- `PA28 2021 Checklist DRAFT v2 - UNOFFICIAL.pdf` — the Redhill source checklist with an unofficial stamp on every page; earlier drafts: `PA28_Checklist_DRAFT.md`, `PA28_Checklist_Printable.tex/.pdf`, `pa28_old.txt`.

Build: `pdflatex G-CEZO_Checklist.tex` (run twice).

## Sources

G-CEZO POH (Piper Report VB-1360; scan kept locally, not in the repository), G-CEZO Weight & C.G. Schedule (LW 4072), club spreadsheets,
CAA Safety Sense 05, CAA airspace-infringement guidance, SERA.2010, CAA Skyway Code.
