import { describe, expect, it } from 'vitest';
import { getReviewedFilename, serializeReviewedDocument } from './export.js';

const document = {
  facts: [
    {
      id: 1,
      fact: 'A claim',
      type: 'quote',
      confidence: 'high',
      verbatim: null,
      human_review: { status: 'verified', notes: 'Supported.', corrected_fact: null }
    },
    {
      id: 2,
      fact: 'Another claim',
      type: 'numeric',
      confidence: 'low',
      verbatim: '12'
    }
  ]
};

describe('reviewed JSON export', () => {
  it('uses the source base name and replaces its extension', () => {
    expect(getReviewedFilename('result.json')).toBe('result-reviewed.json');
    expect(getReviewedFilename('research.final.JSON')).toBe('research.final-reviewed.json');
    expect(getReviewedFilename('facts')).toBe('facts-reviewed.json');
  });

  it('serializes a stable, readable document with every human review', () => {
    const serialized = serializeReviewedDocument(/** @type {any} */ (document));
    expect(serialized).toBe(serializeReviewedDocument(/** @type {any} */ (document)));
    expect(serialized).toMatchSnapshot();
    expect(JSON.parse(serialized).facts[1].human_review).toEqual({
      status: 'pending',
      notes: '',
      corrected_fact: null
    });
  });
});
