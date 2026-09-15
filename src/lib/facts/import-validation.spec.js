import { describe, expect, it } from 'vitest';
import {
  FactsImportError,
  parseFactsJson,
  readFactsFile,
  validateFactsDocument
} from './import-validation.js';

const validDocument = {
  facts: [
    {
      id: 1,
      fact: 'The original claim',
      type: 'quote',
      confidence: 'high',
      verbatim: null
    }
  ]
};

/**
 * @param {unknown} value
 * @param {string} path
 * @returns {void}
 */
function expectValidationError(value, path) {
  expect(() => validateFactsDocument(value)).toThrow(FactsImportError);
  expect(() => validateFactsDocument(value)).toThrow(path);
}

describe('validateFactsDocument', () => {
  it('accepts every allowed enum value and makes a fresh document', () => {
    const source = {
      facts: [
        ...['quote', 'numeric', 'event', 'entity', 'definition', 'causal', 'other'].map(
          (type, index) => ({
            id: index + 1,
            fact: `Fact ${index + 1}`,
            type,
            confidence: ['high', 'medium', 'low'][index % 3],
            verbatim: index % 2 === 0 ? null : 'Source wording'
          })
        )
      ]
    };

    const validated = validateFactsDocument(source);

    expect(validated).toEqual(source);
    expect(validated).not.toBe(source);
    expect(validated.facts[0]).not.toBe(source.facts[0]);
  });

  it('allows repeated identifiers because the source schema does not require uniqueness', () => {
    const source = structuredClone(validDocument);
    source.facts.push({ ...source.facts[0] });

    expect(validateFactsDocument(source).facts).toHaveLength(2);
  });

  it('rejects malformed roots and root fields outside the closed schema', () => {
    expectValidationError(null, 'root');
    expectValidationError([], 'root');
    expectValidationError({ facts: [], source: 'extra' }, 'root.source');
    expectValidationError({}, 'root.facts');
    expectValidationError({ facts: {} }, 'facts');
  });

  it('rejects non-objects, missing fields, and unexpected fields in facts', () => {
    expectValidationError({ facts: [null] }, 'facts[0]');
    expectValidationError({ facts: [[]] }, 'facts[0]');
    expectValidationError({ facts: [{ id: 1 }] }, 'facts[0].fact');
    expectValidationError(
      { facts: [{ ...validDocument.facts[0], extra: true }] },
      'facts[0].extra'
    );
  });

  it('reports the exact path for each invalid field type or enum', () => {
    expectValidationError(
      { facts: [{ ...validDocument.facts[0], id: Number.NaN }] },
      'facts[0].id'
    );
    expectValidationError({ facts: [{ ...validDocument.facts[0], fact: 1 }] }, 'facts[0].fact');
    expectValidationError(
      { facts: [{ ...validDocument.facts[0], type: 'opinion' }] },
      'facts[0].type'
    );
    expectValidationError(
      { facts: [{ ...validDocument.facts[0], confidence: 'certain' }] },
      'facts[0].confidence'
    );
    expectValidationError(
      { facts: [{ ...validDocument.facts[0], verbatim: false }] },
      'facts[0].verbatim'
    );
  });

  it('identifies the offending fact index', () => {
    const source = structuredClone(validDocument);
    source.facts.push({ ...source.facts[0], confidence: 'certain' });

    expectValidationError(source, 'facts[1].confidence');
  });
});

describe('parseFactsJson', () => {
  it('parses valid JSON using the same strict schema', () => {
    expect(parseFactsJson(JSON.stringify(validDocument))).toEqual(validDocument);
  });

  it('returns an actionable error for malformed JSON', () => {
    expect(() => parseFactsJson('{')).toThrow('root: el archivo no contiene JSON válido.');
  });
});

describe('readFactsFile', () => {
  it('reads and validates text from a local File-compatible object', async () => {
    const document = await readFactsFile({ text: async () => JSON.stringify(validDocument) });

    expect(document).toEqual(validDocument);
  });
});
