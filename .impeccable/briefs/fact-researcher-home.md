# Fact Researcher — primary workbench

## Scope

Route: `src/routes/+page.svelte` (planned). Visitor mode: **Operate**. This is the one-screen
workbench for importing a fact JSON document, working through its human-review decisions, restoring
a local draft, and exporting the enriched result.

## Audience, job, and proof

Researchers and developers handling sensitive material need to compare each claim with its verbatim
evidence, record a decision without altering the source fact, and leave with a portable JSON file.
The proof is operational rather than promotional: the visible fact, source wording, type,
confidence, review state, and locally saved progress. The privacy statement is a product guarantee:
processing remains in-browser and the interface makes no network request.

## Constraints and states

The workbench must handle the import, validation-error, empty, local-storage-warning, active-review,
all-pending export-confirmation, restored-draft, and download-ready states. Every control is keyboard
reachable and has a visible focus treatment; status uses a label and icon/shape in addition to color.
The 1440px desktop surface prioritizes a dense evidence table. At 390px, it changes structurally to
review cards with collapsible filters and persistent export access. No external fonts, imagery,
tracking, or server claims are allowed.

## Chosen direction

**Evidence Calibration Ledger** (assigned candidate 4 of 7; seed `49e935cb`). A verification pass is
treated as a measured record, not a content feed: cool-white calibration sheets, graphite rules,
cobalt navigation tabs, and a single controlled verification green organize evidence into durable,
inspectable fields. A fact's decision is recorded beside—not over—the original wording. The signature
moment is an inline review tray that opens beneath the selected row and changes the row's left-edge
marker plus its worded status, preserving the evidence above it. This is the default selected by the
required direction roll; the supplied plan explicitly authorizes accepting it without a separate
selection round.

## Direction contract

**THESIS:** This surface is an evidence calibration ledger: every review decision is a measured entry
that remains adjacent to the source claim and verbatim evidence. It refuses the category-default
dashboard of detached KPI cards and pastel status pills.

**OWN-WORLD:** Restrained, daylight-lit cool white fields use graphite ink, a disciplined cobalt for
navigation and primary action, and semantic green/ochre/red only inside labeled status marks. Hairline
rules, square-to-gently-rounded control geometry, tabbed sections, system sans text, and tabular
system monospace for identifiers make the interface read as an instrument record, not a magazine.
Declined challenger raises: the sneaker archive's end-label discipline becomes compact metadata rails;
the cloud quarry's depth becomes generous separation between evidence clusters; the console's focused
room becomes a single deliberate expanded-review tray; the ticket wallet's permanent cancellation
record makes rejection visible without deleting content; the phosphor terminal contributes a
keyboard-first command rhythm; the arcade grid contributes strict alignment and non-color state marks.

**STORY:** On arrival, the visitor sees that the document can be reviewed privately on this device.
After import, they can scan what the fact says, how confident it is, and its exact evidence before
opening one review tray. The workbench makes completed and remaining review count tangible, supports
returning to a local draft, and permits export with an explicit pending-review confirmation.

**FIRST VIEWPORT:** At 1440px, a quiet masthead carries the product name, local-only assurance, and
compact draft/export controls. Beneath it, a full-width work bar pairs review progress with search and
three filters. The evidence ledger fills the frame: fixed metadata at left, original fact as the
dominant reading column, verbatim evidence in a restrained secondary column, and a right-side,
worded review mark plus Review action. At 390px the masthead condenses, filters fold into a button,
and each fact becomes a bordered record card with a persistent status marker and action.

**FORM:** Evidence Calibration Ledger is grounded direction 4 of 7, assigned by Impeccable's Operate
seed `49e935cb`. Its form is a calibration sheet and controlled document register, translated for a
browser workbench rather than imitating paper texture or office nostalgia.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved implementation decisions

Exact token values, component dimensions, and icon source are intentionally deferred until the UI is
implemented. The first visual implementation must preserve this contract and be inspected at 1440px
and 390px.
