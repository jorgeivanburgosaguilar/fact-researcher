import { describe, expect, it } from 'vitest';
import {
  filterReviewedFacts,
  getReviewProgress,
  isReviewedFactsDocument,
  normalizeHumanReview,
  normalizeReviewedDocument,
  updateHumanReviewAtIndex
} from './review.js';
/** @type {import('./contracts.js').FactsDocument} */
const source = {
  facts: [
    { id: 7, fact: 'First duplicate', type: 'quote', confidence: 'high', verbatim: null },
    { id: 7, fact: 'Second duplicate', type: 'numeric', confidence: 'low', verbatim: '42' },
    { id: 9, fact: 'Third fact', type: 'event', confidence: 'medium', verbatim: null }
  ]
};
describe('review state', () => {
  it('normalizes partial reviews without mutating facts', () => {
    const reviewed = normalizeReviewedDocument(
      /** @type {{ facts: Array<import('./contracts.js').Fact & { human_review?: unknown }> }} */ ({
        facts: [
          {
            ...source.facts[0],
            human_review: { status: 'verified', notes: /** @type {unknown} */ (12) }
          }
        ]
      })
    );
    expect(reviewed.facts[0].human_review).toEqual({
      status: 'verified',
      notes: '',
      corrected_fact: null
    });
    expect(source.facts[0]).not.toHaveProperty('human_review');
  });
  it('updates only the selected array index when IDs repeat', () => {
    const document = normalizeReviewedDocument(source);
    const updated = updateHumanReviewAtIndex(document, 1, {
      status: 'rejected',
      notes: 'The number has no source.',
      corrected_fact: '41'
    });
    expect(updated).not.toBe(document);
    expect(updated.facts[0]).toBe(document.facts[0]);
    expect(updated.facts[1].human_review).toEqual({
      status: 'rejected',
      notes: 'The number has no source.',
      corrected_fact: '41'
    });
  });
  it('returns the original document for an unavailable index', () => {
    const document = normalizeReviewedDocument(source);
    expect(updateHumanReviewAtIndex(document, 5, { status: 'verified' })).toBe(document);
  });
  it('calculates completion and filters facts in original order', () => {
    let document = normalizeReviewedDocument(source);
    document = updateHumanReviewAtIndex(document, 0, { status: 'verified' });
    document = updateHumanReviewAtIndex(document, 1, { status: 'rejected' });
    expect(getReviewProgress(document)).toEqual({
      total: 3,
      pending: 1,
      verified: 1,
      rejected: 1,
      completed: 2,
      percent: 67
    });
    expect(filterReviewedFacts(document, { status: 'rejected' }).map((fact) => fact.fact)).toEqual([
      'Second duplicate'
    ]);
    expect(filterReviewedFacts(document, { query: 'duplicate' }).map((fact) => fact.id)).toEqual([
      7, 7
    ]);
  });
  it('recognizes only complete, schema-safe reviewed documents', () => {
    const document = normalizeReviewedDocument(source);
    expect(isReviewedFactsDocument(document)).toBe(true);
    expect(isReviewedFactsDocument({ facts: [{ ...document.facts[0], unexpected: true }] })).toBe(
      false
    );
    expect(normalizeHumanReview({ status: 'unknown', notes: null })).toEqual({
      status: 'pending',
      notes: '',
      corrected_fact: null
    });
  });
});
