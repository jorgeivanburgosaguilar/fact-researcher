import { describe, expect, it } from 'vitest';
import {
  DRAFT_STORAGE_KEY,
  clearReviewDraft,
  loadReviewDraft,
  saveReviewDraft
} from './draft-storage.js';

const document = {
  summary: { total: 1, verbatim: 1, inferred: 0, failed_citations: 0, unlocated: 0 },
  verbatim_facts: [
    {
      id: 1,
      fact: 'Fact textual',
      type: 'quote',
      confidence: 'high',
      verbatim: 'Cita textual',
      position: { line: 2, column: 1 },
      notes: '',
      verification_status: 'pending'
    }
  ],
  inferred_facts: []
};
const draft = { originalFilename: 'result.json', document };

class MemoryStorage {
  /** @type {Map<string, string>} */
  #values;
  #throwing;

  /** @param {Iterable<readonly [string, string]>} [entries] @param {boolean} [throwing] */
  constructor(entries = [], throwing = false) {
    this.#values = new Map(entries);
    this.#throwing = throwing;
  }

  get length() {
    return this.#values.size;
  }

  clear() {
    this.#values.clear();
  }

  /** @param {string} key */
  getItem(key) {
    this.#failWhenBlocked();
    return this.#values.get(key) ?? null;
  }

  /** @param {number} index */
  key(index) {
    return [...this.#values.keys()][index] ?? null;
  }

  /** @param {string} key */
  removeItem(key) {
    this.#failWhenBlocked();
    this.#values.delete(key);
  }

  /** @param {string} key @param {string} value */
  setItem(key, value) {
    this.#failWhenBlocked();
    this.#values.set(key, value);
  }

  #failWhenBlocked() {
    if (this.#throwing) throw new Error('blocked');
  }
}

/** @param {Iterable<readonly [string, string]>} [entries] @param {boolean} [throwing] */
function createStorage(entries = [], throwing = false) {
  return new MemoryStorage(entries, throwing);
}

describe('draft storage', () => {
  it('guarda, restaura y elimina un borrador', () => {
    const storage = createStorage();

    expect(saveReviewDraft(draft, storage)).toEqual({ ok: true });
    expect(loadReviewDraft(storage)).toEqual({ ok: true, draft });
    expect(clearReviewDraft(storage)).toEqual({ ok: true });
    expect(loadReviewDraft(storage)).toEqual({ ok: true, draft: null });
  });

  it('rechaza contenido corrupto o con una estructura inválida', () => {
    const corrupt = createStorage([[DRAFT_STORAGE_KEY, '{']]);
    const invalid = createStorage([[DRAFT_STORAGE_KEY, JSON.stringify({ originalFilename: '' })]]);

    expect(loadReviewDraft(corrupt)).toMatchObject({ ok: false, draft: null });
    expect(loadReviewDraft(invalid)).toMatchObject({ ok: false, draft: null });
  });

  it('informa cuando el almacenamiento no está disponible o lanza errores', () => {
    const throwingStorage = createStorage([], true);

    expect(saveReviewDraft(draft, null)).toMatchObject({ ok: false });
    expect(loadReviewDraft(null)).toMatchObject({ ok: false, draft: null });
    expect(clearReviewDraft(null)).toMatchObject({ ok: false });
    expect(saveReviewDraft(draft, throwingStorage)).toMatchObject({ ok: false });
    expect(loadReviewDraft(throwingStorage)).toMatchObject({ ok: false, draft: null });
    expect(clearReviewDraft(throwingStorage)).toMatchObject({ ok: false });
  });
});
