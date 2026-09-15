---
name: Fact Researcher
description: Evidence Calibration Ledger seed for a private, browser-based fact-verification workbench.
---

<!-- SEED: established with the user before implementation; re-run $impeccable document once there's code to capture the actual tokens and components. -->

# Design

## Overview

Fact Researcher uses the **Evidence Calibration Ledger**: a daylight work surface whose visual order makes the relationship between a claim, its verbatim evidence, and a human decision unmistakable. It is a restrained Operate system, not a generic dashboard: the central object is an inspectable record ledger with an inline review tray, while progress and filters support the work rather than becoming decoration. The reusable signature is the metadata rail and status marker that stay attached to a record in both the desktop ledger and mobile card.

**The Evidence-Adjacent Rule.** Original fact and verbatim evidence remain visible when review fields open; a decision never replaces, hides, or visually outweighs the source wording.

The intended physical scene is a focused daytime review session on a laptop: neutral white document stock, graphite marks, cobalt index tabs, and carefully bounded semantic color. Motion is quiet, 150–250ms state feedback: expand the review tray, update its record marker, and reveal folded mobile filters. There is no decorative page-load choreography, texture simulation, or external imagery.

## Colors

Use a **Restrained** strategy: cool neutral document fields, deep graphite text/rules, one cobalt navigation/action color, and semantic colors reserved for review meaning. Exact values are **[to be resolved during implementation]**; they must meet contrast requirements on every document field.

**The Instrument Accent Rule.** Cobalt identifies the current tool context and primary action; it is not scattered through inactive controls or body copy. Verified, pending, rejected, warning, and error states pair color with a text label and an icon, pattern, or left-edge marker.

## Typography

Use the device's native system sans stack for UI, facts, controls, and explanatory copy; use a system monospace stack with tabular numerals for IDs, field values, JSON-oriented metadata, and progress counts. This preserves a fast, dependency-free workbench and makes structured data visually distinct without turning the whole product into a terminal. Exact sizes, weights, and line heights are **[to be resolved during implementation]**.

**The Scan-Then-Read Rule.** Labels and metadata are compact and stable; the original fact gets the largest readable measure in each record, and verbatim evidence is secondary but never reduced below a comfortable reading size.

## Layout

Desktop is a broad, low-friction ledger: masthead, work bar, then a full-width table with a stable metadata edge, dominant fact column, evidence column, state marker, and review action. The expanded review tray spans the record beneath its source row, so edits retain their evidence context. Progress is visible at work-bar level, not promoted into separate dashboard cards.

At 390px, layout changes structurally: masthead actions condense, filters live behind a disclosed control, the table becomes one record card per fact, and export remains reachable without returning to the top. Long source text wraps naturally; metadata groups into a compact rail before the fact.

**The One-Open-Record Rule.** Expansion emphasizes one decision at a time, prevents dense rows from becoming a wall of form controls, and makes keyboard focus recovery predictable.

## Elevation & Depth

Depth comes from document grouping and a clear current-record boundary, not shadows stacked on every surface. Base content stays flat on the primary field; the open review tray earns a slight separation through a stronger rule, quiet surface shift, and focused state. Exact elevation values are **[to be resolved during implementation]**.

**The Flat Evidence Rule.** Evidence and inactive records do not float. Reserve depth for a control that is currently changing the review state or needs to escape a mobile filter layer.

## Shapes

Use mostly square document geometry softened only where direct touch interaction benefits from it. Rules and tabs should feel precise; buttons, inputs, and disclosure controls share one gently rounded corner language. Exact radii and rule widths are **[to be resolved during implementation]**.

**The Record Edge Rule.** Status is carried by a persistent left marker and a worded badge; a color dot alone is never the state treatment.

## Do's and Don'ts

- Do preserve original facts verbatim and show the exact review status in words.
- Do surface local-only processing and a recoverable draft as clear, plain interface facts.
- Do use empty and error states to teach the next safe action, with an announced message.
- Do keep focus highly visible and return it intentionally after tray, dialog, and filter actions.
- Don't convert the workbench into decorative KPI cards, an analytics dashboard, or a terminal theme.
- Don't use color, hover, or drag-and-drop as the only way to understand or operate a feature.
- Don't introduce remote fonts, external images, tracking marks, paper textures, or invented proof.
- Don't hide a rejected fact: preserve it and mark its recorded decision.
