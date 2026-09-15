# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

SvelteKit static site using JavaScript with JSDoc and pnpm. This was specified for the planned build.

## Users

People who need to manually assess extracted facts in a JSON document before sharing or using the reviewed results. This primary-user description is an assumption inferred from the requested workflow; no specific role or organization was provided.

## Product Purpose

Fact Researcher makes it possible to import a structured set of facts, review each item manually, and download an enriched JSON record of that assessment. Success is a complete, portable review record that preserves both the original fact and any human correction.

## Positioning

The product is a private, browser-only fact-review workbench: it validates a deliberately strict input schema, retains a local draft, and emits a compatible JSON document with a human-review record for every fact. No server or network request is part of its operation.

## Operating Context

Users open a local JSON file containing `facts`, filter and inspect its records, assign each one a review status, optionally add notes or a proposed correction, and export the completed document. They may return later to restore or discard the locally saved draft.

## Capabilities and Constraints

- Input root permits only `facts`; each fact permits only `id`, `fact`, `type`, `confidence`, and `verbatim`.
- Fact types are `quote`, `numeric`, `event`, `entity`, `definition`, `causal`, and `other`.
- Confidence values are `high`, `medium`, and `low`.
- IDs are not required to be unique.
- Human review statuses are `pending`, `verified`, and `rejected`, presented to users as Pendiente, Verídico, and Falso.
- Export retains the original fact, adds `human_review` to every record, and names the file `<original-name>-reviewed.json`.
- The active document and original filename persist only in versioned `localStorage`; a storage failure warns the user but does not prevent review or export.
- The application is static and client-side only. It has no analytics, tracking, external dependencies, server processing, or network communication.

## Brand Commitments

The durable product voice is clear, factual, and privacy-forward. The exact visual identity is intentionally undecided and will be established separately for the editorial verification workbench.

## Evidence on Hand

`result.json` in the initial repository commit is a real sample fact document. It is intentionally removed from the working product but remains recoverable from local Git history. No customer stories, testimonials, benchmarks, or visual assets were provided and none should be fabricated.

## Product Principles

1. Preserve source truth: never overwrite an imported fact when recording a correction.
2. Make review state explicit, complete, and easy to scan.
3. Keep sensitive documents on the user's machine.
4. Make incomplete work recoverable without making storage a dependency for export.
5. Keep validation strict and errors actionable by identifying the exact JSON path.

## Accessibility & Inclusion

The interface must support keyboard review, visible focus, labelled controls, accessible error and announcement regions, and non-colour status cues. Desktop and mobile web use are both required.
