import { describe, expect, it } from 'vitest';
import { createReviewedDocument } from './contracts.js';

describe('createReviewedDocument', () => {
  it('adds independent pending reviews without altering source facts', () => {
    /** @type {import('./contracts.js').FactsDocument} */
    const source = {
      facts: [
        {
          id: 1,
          fact: 'A source claim',
          type: 'quote',
          confidence: 'high',
          verbatim: null
        }
      ]
    };

    const reviewed = createReviewedDocument(source);

    expect(reviewed).toEqual({
      facts: [
        {
          ...source.facts[0],
          human_review: { status: 'pending', notes: '', corrected_fact: null }
        }
      ]
    });
    expect(source.facts[0]).not.toHaveProperty('human_review');
  });
});
