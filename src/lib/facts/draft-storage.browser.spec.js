import { afterEach, describe, expect, it } from 'vitest';
import {
  DRAFT_STORAGE_KEY,
  clearReviewDraft,
  loadReviewDraft,
  saveReviewDraft
} from './draft-storage.js';
import { normalizeReviewedDocument } from './review.js';
const draft = {
  originalFilename: 'claims.json',
  document: normalizeReviewedDocument({
    facts: [{ id: 1, fact: 'A claim', type: 'quote', confidence: 'high', verbatim: null }]
  })
};
afterEach(() => localStorage.removeItem(DRAFT_STORAGE_KEY));
describe('review draft storage', () => {
  it('saves, restores, and clears a complete draft', () => {
    expect(saveReviewDraft(draft)).toEqual({ ok: true });
    expect(loadReviewDraft()).toEqual({ ok: true, draft });
    expect(clearReviewDraft()).toEqual({ ok: true });
    expect(loadReviewDraft()).toEqual({ ok: true, draft: null });
  });
  it('does not restore malformed saved data', () => {
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ originalFilename: 'claims.json', document: { facts: [] }, extra: true })
    );
    expect(loadReviewDraft()).toEqual({
      ok: false,
      draft: null,
      message: 'The saved draft is invalid and was not restored.'
    });
  });
  it('reports unavailable storage without throwing', () => {
    const unavailable = /** @type {Storage | null} */ (null);
    expect(saveReviewDraft(draft, unavailable)).toEqual({
      ok: false,
      message: 'Local draft storage is unavailable.'
    });
  });
});
