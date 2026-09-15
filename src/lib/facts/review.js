import {
  CONFIDENCE_LEVELS,
  DEFAULT_HUMAN_REVIEW,
  FACT_TYPES,
  REVIEW_STATUSES
} from './contracts.js';

/** @typedef {import('./contracts.js').Fact} Fact */
/** @typedef {import('./contracts.js').HumanReview} HumanReview */
/** @typedef {import('./contracts.js').ReviewedFact} ReviewedFact */
/** @typedef {import('./contracts.js').ReviewedFactsDocument} ReviewedFactsDocument */
/** @typedef {Partial<HumanReview>} ReviewChanges */
/** @typedef {{ total: number, pending: number, verified: number, rejected: number, completed: number, percent: number }} ReviewProgress */
/** @typedef {{ query?: string, status?: string, type?: string, confidence?: string }} FactFilters */

/** @param {unknown} review @returns {HumanReview} */
export function normalizeHumanReview(review) {
  const candidate = isPlainObject(review) ? review : {};
  return {
    status: isReviewStatus(candidate.status) ? candidate.status : DEFAULT_HUMAN_REVIEW.status,
    notes: typeof candidate.notes === 'string' ? candidate.notes : DEFAULT_HUMAN_REVIEW.notes,
    corrected_fact:
      typeof candidate.corrected_fact === 'string' || candidate.corrected_fact === null
        ? candidate.corrected_fact
        : DEFAULT_HUMAN_REVIEW.corrected_fact
  };
}

/**
 * @param {{ facts: Array<Fact & { human_review?: unknown }> }} document
 * @returns {ReviewedFactsDocument}
 */
export function normalizeReviewedDocument(document) {
  return {
    facts: document.facts.map((fact) => ({
      ...fact,
      human_review: normalizeHumanReview(fact.human_review)
    }))
  };
}

/** @param {ReviewedFactsDocument} document @param {number} index @param {ReviewChanges} changes @returns {ReviewedFactsDocument} */
export function updateHumanReviewAtIndex(document, index, changes) {
  if (!Number.isInteger(index) || index < 0 || index >= document.facts.length) return document;
  return {
    ...document,
    facts: document.facts.map((fact, factIndex) =>
      factIndex === index
        ? { ...fact, human_review: normalizeHumanReview({ ...fact.human_review, ...changes }) }
        : fact
    )
  };
}

/** @param {ReviewedFactsDocument} document @returns {ReviewProgress} */
export function getReviewProgress(document) {
  const progress = {
    total: document.facts.length,
    pending: 0,
    verified: 0,
    rejected: 0,
    completed: 0,
    percent: 0
  };
  for (const fact of document.facts) progress[normalizeHumanReview(fact.human_review).status] += 1;
  progress.completed = progress.verified + progress.rejected;
  progress.percent =
    progress.total === 0 ? 0 : Math.round((progress.completed / progress.total) * 100);
  return progress;
}

/** @param {ReviewedFactsDocument} document @param {FactFilters} [filters] @returns {ReviewedFact[]} */
export function filterReviewedFacts(document, filters = {}) {
  const query = filters.query?.trim().toLocaleLowerCase() ?? '';
  return document.facts.filter((fact) => {
    const review = normalizeHumanReview(fact.human_review);
    const searchable = [fact.id, fact.fact, fact.type, fact.confidence, fact.verbatim ?? '']
      .join(' ')
      .toLocaleLowerCase();
    return (
      (!query || searchable.includes(query)) &&
      (!filters.status || review.status === filters.status) &&
      (!filters.type || fact.type === filters.type) &&
      (!filters.confidence || fact.confidence === filters.confidence)
    );
  });
}

/** @param {unknown} value @returns {value is ReviewedFactsDocument} */
export function isReviewedFactsDocument(value) {
  return (
    isPlainObject(value) &&
    hasExactKeys(value, ['facts']) &&
    Array.isArray(value.facts) &&
    value.facts.every(isReviewedFact)
  );
}
/** @param {unknown} value @returns {value is ReviewedFact} */
function isReviewedFact(value) {
  return (
    isPlainObject(value) &&
    hasExactKeys(value, ['id', 'fact', 'type', 'confidence', 'verbatim', 'human_review']) &&
    typeof value.id === 'number' &&
    Number.isFinite(value.id) &&
    typeof value.fact === 'string' &&
    isFactType(value.type) &&
    isConfidence(value.confidence) &&
    (typeof value.verbatim === 'string' || value.verbatim === null) &&
    isCompleteHumanReview(value.human_review)
  );
}
/** @param {unknown} value @returns {value is HumanReview} */
function isCompleteHumanReview(value) {
  return (
    isPlainObject(value) &&
    hasExactKeys(value, ['status', 'notes', 'corrected_fact']) &&
    isReviewStatus(value.status) &&
    typeof value.notes === 'string' &&
    (typeof value.corrected_fact === 'string' || value.corrected_fact === null)
  );
}
/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/** @param {Record<string, unknown>} value @param {string[]} keys @returns {boolean} */
function hasExactKeys(value, keys) {
  const valueKeys = Object.keys(value);
  return valueKeys.length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}
/** @param {unknown} value @returns {value is import('./contracts.js').ReviewStatus} */
function isReviewStatus(value) {
  return (
    typeof value === 'string' && /** @type {readonly string[]} */ (REVIEW_STATUSES).includes(value)
  );
}
/** @param {unknown} value @returns {value is import('./contracts.js').FactType} */
function isFactType(value) {
  return typeof value === 'string' && /** @type {readonly string[]} */ (FACT_TYPES).includes(value);
}
/** @param {unknown} value @returns {value is import('./contracts.js').Confidence} */
function isConfidence(value) {
  return (
    typeof value === 'string' &&
    /** @type {readonly string[]} */ (CONFIDENCE_LEVELS).includes(value)
  );
}
