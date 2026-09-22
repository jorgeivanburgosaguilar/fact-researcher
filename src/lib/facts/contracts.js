// @ts-nocheck
/** @typedef {'quote' | 'numeric' | 'event' | 'entity' | 'definition' | 'causal' | 'other'} FactType */
/** @typedef {'high' | 'medium' | 'low'} Confidence */
/** @typedef {'pending' | 'verified'} VerificationStatus */
/** @typedef {{ line: number | null, column: number | null }} FactPosition */
/** @typedef {{ [key: string]: unknown, id: number, fact: string, type: FactType, confidence: Confidence, verbatim: string | null, position: FactPosition, notes: string, verification_status: VerificationStatus }} Fact */
/** @typedef {{ total: number, verbatim: number, inferred: number, failed_citations: number, unlocated: number }} ResultSummary */
/** @typedef {{ [key: string]: unknown, summary: ResultSummary, verbatim_facts: Fact[], inferred_facts: Fact[] }} ResultDocument */

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
export const VERIFICATION_STATUSES = /** @type {const} */ (['pending', 'verified']);
export const DEFAULT_FACT_ENRICHMENT = /** @type {const} */ ({
  notes: '',
  verification_status: 'pending'
});

/** @param {Fact[]} verbatimFacts @param {Fact[]} inferredFacts @param {Pick<ResultSummary, 'failed_citations' | 'unlocated'>} special */
export function createSummary(verbatimFacts, inferredFacts, special) {
  return {
    total: verbatimFacts.length + inferredFacts.length,
    verbatim: verbatimFacts.length,
    inferred: inferredFacts.length,
    failed_citations: special.failed_citations,
    unlocated: special.unlocated
  };
}
