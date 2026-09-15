/** @typedef {'quote' | 'numeric' | 'event' | 'entity' | 'definition' | 'causal' | 'other'} FactType */

/** @typedef {'high' | 'medium' | 'low'} Confidence */

/** @typedef {'pending' | 'verified' | 'rejected'} ReviewStatus */

/**
 * A fact exactly as it appears in an imported document.
 *
 * @typedef {object} Fact
 * @property {number} id
 * @property {string} fact
 * @property {FactType} type
 * @property {Confidence} confidence
 * @property {string | null} verbatim
 */

/** @typedef {{ facts: Fact[] }} FactsDocument */

/**
 * A human assessment that augments, rather than mutates, an imported fact.
 *
 * @typedef {object} HumanReview
 * @property {ReviewStatus} status
 * @property {string} notes
 * @property {string | null} corrected_fact
 */

/** @typedef {Fact & { human_review: HumanReview }} ReviewedFact */

/** @typedef {{ facts: ReviewedFact[] }} ReviewedFactsDocument */

export const FACT_TYPES = /** @type {const} */ ([
  'quote',
  'numeric',
  'event',
  'entity',
  'definition',
  'causal',
  'other'
]);

export const CONFIDENCE_LEVELS = /** @type {const} */ (['high', 'medium', 'low']);

export const REVIEW_STATUSES = /** @type {const} */ (['pending', 'verified', 'rejected']);

/** @type {HumanReview} */
export const DEFAULT_HUMAN_REVIEW = {
  status: 'pending',
  notes: '',
  corrected_fact: null
};

/**
 * Adds an independent pending review to a source fact.
 *
 * @param {Fact} fact
 * @returns {ReviewedFact}
 */
export function createReviewedFact(fact) {
  return { ...fact, human_review: { ...DEFAULT_HUMAN_REVIEW } };
}

/**
 * Produces a reviewed document from an imported document without modifying it.
 *
 * @param {FactsDocument} document
 * @returns {ReviewedFactsDocument}
 */
export function createReviewedDocument(document) {
  return { facts: document.facts.map(createReviewedFact) };
}
