// @ts-nocheck
import { normalizeResultDocument } from './review.js';
export const REVIEWED_JSON_MIME_TYPE = 'application/json;charset=utf-8';
export function getReviewedFilename(originalFilename) {
  const filename = originalFilename.trim() || 'result.json';
  const extensionIndex = filename.lastIndexOf('.');
  return `${extensionIndex > 0 ? filename.slice(0, extensionIndex) : filename}-enriched.json`;
}
/** @param {import('./contracts.js').ResultDocument} document */
export function serializeReviewedDocument(document) {
  return `${JSON.stringify(normalizeResultDocument(document), null, 2)}\n`;
}
export function downloadReviewedDocument(document, originalFilename, browser = {}) {
  const BlobConstructor = browser.Blob ?? Blob;
  const urlApi = browser.URL ?? URL;
  const domDocument = browser.document ?? window.document;
  const filename = getReviewedFilename(originalFilename);
  const objectUrl = urlApi.createObjectURL(
    new BlobConstructor([serializeReviewedDocument(document)], { type: REVIEWED_JSON_MIME_TYPE })
  );
  const anchor = domDocument.createElement('a');
  try {
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
  } finally {
    anchor.remove();
    urlApi.revokeObjectURL(objectUrl);
  }
  return filename;
}
