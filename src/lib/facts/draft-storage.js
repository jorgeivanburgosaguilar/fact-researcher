// @ts-nocheck
import { validateResultDocument } from './import-validation.js';
export const DRAFT_STORAGE_KEY = 'fact-researcher.result-draft.v2';
/** @param {unknown} value */
export function isReviewDraft(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const draft = /** @type {any} */ (value);
  if (
    typeof draft.originalFilename !== 'string' ||
    !draft.originalFilename.trim() ||
    !draft.document
  )
    return false;
  try {
    validateResultDocument(draft.document);
    return true;
  } catch {
    return false;
  }
}
export function saveReviewDraft(draft, storage = getLocalStorage()) {
  if (!isReviewDraft(draft))
    return { ok: false, message: 'El borrador está incompleto y no se guardó.' };
  if (!storage) return unavailable();
  try {
    storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    return { ok: true };
  } catch {
    return { ok: false, message: 'El navegador no pudo guardar el borrador local.' };
  }
}
export function loadReviewDraft(storage = getLocalStorage()) {
  if (!storage)
    return { ok: false, draft: null, message: 'El almacenamiento local no está disponible.' };
  try {
    const serialized = storage.getItem(DRAFT_STORAGE_KEY);
    if (!serialized) return { ok: true, draft: null };
    const draft = JSON.parse(serialized);
    return isReviewDraft(draft)
      ? { ok: true, draft }
      : { ok: false, draft: null, message: 'El borrador guardado no es válido.' };
  } catch {
    return { ok: false, draft: null, message: 'No se pudo leer el borrador guardado.' };
  }
}
export function clearReviewDraft(storage = getLocalStorage()) {
  if (!storage) return unavailable();
  try {
    storage.removeItem(DRAFT_STORAGE_KEY);
    return { ok: true };
  } catch {
    return { ok: false, message: 'El navegador no pudo eliminar el borrador local.' };
  }
}
function getLocalStorage() {
  return typeof localStorage === 'undefined' ? null : localStorage;
}
function unavailable() {
  return { ok: false, message: 'El almacenamiento local no está disponible.' };
}
