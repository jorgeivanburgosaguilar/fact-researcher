import { isReviewedFactsDocument } from './review.js';

/** @typedef {import('./contracts.js').ReviewedFactsDocument} ReviewedFactsDocument */

export const DRAFT_STORAGE_KEY = 'fact-researcher.review-draft.v1';

/**
 * @typedef {{ document: ReviewedFactsDocument, originalFilename: string }} ReviewDraft
 */

/**
 * @typedef {{ ok: true, draft: ReviewDraft | null } | { ok: false, draft: null, message: string }} LoadDraftResult
 */

/**
 * @typedef {{ ok: true } | { ok: false, message: string }} StorageResult
 */

/**
 * Validates the entire local draft envelope before it can be restored.
 *
 * @param {unknown} value
 * @returns {value is ReviewDraft}
 */
export function isReviewDraft(value) {
  return (
    isPlainObject(value) &&
    hasExactKeys(value, ['document', 'originalFilename']) &&
    typeof value.originalFilename === 'string' &&
    value.originalFilename.trim().length > 0 &&
    isReviewedFactsDocument(value.document)
  );
}

/**
 * Saves a review draft. Storage failures are reported to the caller but never throw or block work.
 *
 * @param {ReviewDraft} draft
 * @param {Storage} [storage]
 * @returns {StorageResult}
 */
export function saveReviewDraft(draft, storage = getLocalStorage()) {
  if (!isReviewDraft(draft)) {
    return { ok: false, message: 'The review draft is incomplete and was not saved.' };
  }

  if (!storage) return unavailableResult();

  try {
    storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    return { ok: true };
  } catch {
    return { ok: false, message: 'Your browser could not save the local draft.' };
  }
}

/**
 * Reads a previously saved draft. Corrupt or incompatible data is not restored.
 *
 * @param {Storage} [storage]
 * @returns {LoadDraftResult}
 */
export function loadReviewDraft(storage = getLocalStorage()) {
  if (!storage) return { ok: false, draft: null, message: 'Local draft storage is unavailable.' };

  try {
    const serialized = storage.getItem(DRAFT_STORAGE_KEY);
    if (serialized === null) return { ok: true, draft: null };

    const draft = JSON.parse(serialized);
    if (!isReviewDraft(draft)) {
      return {
        ok: false,
        draft: null,
        message: 'The saved draft is invalid and was not restored.'
      };
    }

    return { ok: true, draft };
  } catch {
    return { ok: false, draft: null, message: 'The saved draft could not be read.' };
  }
}

/**
 * Removes the local draft without affecting the review currently held in memory.
 *
 * @param {Storage} [storage]
 * @returns {StorageResult}
 */
export function clearReviewDraft(storage = getLocalStorage()) {
  if (!storage) return unavailableResult();

  try {
    storage.removeItem(DRAFT_STORAGE_KEY);
    return { ok: true };
  } catch {
    return { ok: false, message: 'Your browser could not clear the local draft.' };
  }
}

/** @returns {Storage | undefined} */
function getLocalStorage() {
  return typeof localStorage === 'undefined' ? undefined : localStorage;
}

/** @returns {{ ok: false, message: string }} */
function unavailableResult() {
  return { ok: false, message: 'Local draft storage is unavailable.' };
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
