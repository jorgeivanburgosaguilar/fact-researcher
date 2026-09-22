// @ts-nocheck
import { createSummary } from './contracts.js';
/** @typedef {import('./contracts.js').ResultDocument} ResultDocument */
/** @typedef {import('./contracts.js').Fact} Fact */
/** @param {ResultDocument} document */
export function normalizeResultDocument(document) {
  const verbatim_facts = document.verbatim_facts.map((fact) => ({
    ...fact,
    position: { ...fact.position },
    notes: typeof fact.notes === 'string' ? fact.notes : '',
    verification_status: ['pending', 'verified'].includes(fact.verification_status)
      ? fact.verification_status
      : 'pending'
  }));
  const inferred_facts = document.inferred_facts.map((fact) => ({
    ...fact,
    position: { ...fact.position },
    notes: typeof fact.notes === 'string' ? fact.notes : '',
    verification_status: ['pending', 'verified'].includes(fact.verification_status)
      ? fact.verification_status
      : 'pending'
  }));
  return {
    ...document,
    summary: createSummary(verbatim_facts, inferred_facts, document.summary),
    verbatim_facts,
    inferred_facts
  };
}
/** @param {ResultDocument} document @param {'verbatim_facts' | 'inferred_facts'} group @param {number} index @param {Partial<Fact>} changes */
export function updateFactAtIndex(document, group, index, changes) {
  if (!Number.isInteger(index) || index < 0 || index >= document[group].length) return document;
  const facts = document[group].map((fact, factIndex) =>
    factIndex === index
      ? {
          ...fact,
          ...changes,
          position: changes.position ? { ...changes.position } : fact.position
        }
      : fact
  );
  const result = { ...document, [group]: facts };
  return {
    ...result,
    summary: createSummary(result.verbatim_facts, result.inferred_facts, result.summary)
  };
}
/** @param {ResultDocument} document @param {'verbatim_facts' | 'inferred_facts'} group @param {number} index */
export function deleteFactAtIndex(document, group, index) {
  if (!Number.isInteger(index) || index < 0 || index >= document[group].length) return document;
  const result = {
    ...document,
    [group]: document[group].filter((_, factIndex) => factIndex !== index)
  };
  return {
    ...result,
    summary: createSummary(result.verbatim_facts, result.inferred_facts, result.summary)
  };
}
/** @param {unknown} value */
export function isResultDocument(value) {
  try {
    const { validateResultDocument } = /** @type {any} */ ({ validateResultDocument: null });
    return Boolean(validateResultDocument && validateResultDocument(value));
  } catch {
    return false;
  }
}
