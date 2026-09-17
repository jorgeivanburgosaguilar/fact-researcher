import { describe, expect, it } from 'vitest';
import { parseResultJson } from './import-validation.js';
import { deleteFactAtIndex, updateFactAtIndex } from './review.js';
import { serializeReviewedDocument } from './export.js';
const source = {
  summary: { total: 99, verbatim: 99, inferred: 0, failed_citations: 2, unlocated: 3 },
  verbatim_facts: [
    {
      id: 1,
      fact: 'Texto',
      type: 'quote',
      confidence: 'high',
      verbatim: null,
      position: { line: 4, column: 2 }
    }
  ],
  inferred_facts: []
};
describe('result.json', () => {
  it('normaliza los campos enriquecidos y conserva posición', () => {
    const result = parseResultJson(JSON.stringify(source));
    expect(result.verbatim_facts[0]).toMatchObject({
      position: { line: 4, column: 2 },
      notes: '',
      verification_status: 'pending'
    });
    expect(result.summary).toEqual({
      total: 1,
      verbatim: 1,
      inferred: 0,
      failed_citations: 2,
      unlocated: 3
    });
  });
  it('rechaza JSON y estructura inválidos', () => {
    expect(() => parseResultJson('{')).toThrow('JSON válido');
    expect(() => parseResultJson(JSON.stringify({ facts: [] }))).toThrow('root.summary');
  });
  it('edita, elimina y recalcula los contadores sin perder especiales', () => {
    const result = parseResultJson(JSON.stringify(source));
    const edited = updateFactAtIndex(result, 'verbatim_facts', 0, {
      notes: 'Revisado',
      verification_status: 'verified'
    });
    expect(edited.verbatim_facts[0].notes).toBe('Revisado');
    const deleted = deleteFactAtIndex(edited, 'verbatim_facts', 0);
    expect(deleted.summary).toEqual({
      total: 0,
      verbatim: 0,
      inferred: 0,
      failed_citations: 2,
      unlocated: 3
    });
    expect(
      JSON.parse(serializeReviewedDocument(edited)).verbatim_facts[0].verification_status
    ).toBe('verified');
  });
});
