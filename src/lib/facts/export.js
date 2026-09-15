import { normalizeReviewedDocument } from './review.js';

/** @typedef {import('./contracts.js').ReviewedFactsDocument} ReviewedFactsDocument */

export const REVIEWED_JSON_MIME_TYPE = 'application/json;charset=utf-8';

/**
 * Returns the download filename for a reviewed source document.
 *
 * @param {string} originalFilename
 * @returns {string}
 */
export function getReviewedFilename(originalFilename) {
  const filename = originalFilename.trim() || 'documento.json';
  const extensionIndex = filename.lastIndexOf('.');
  const base = extensionIndex > 0 ? filename.slice(0, extensionIndex) : filename;
  return `${base}-reviewed.json`;
}

/**
 * Serializes a reviewed document with a stable, readable key order. Normalizing
 * here guarantees every exported fact carries a complete human review.
 *
 * @param {ReviewedFactsDocument} document
 * @returns {string}
 */
export function serializeReviewedDocument(document) {
  const normalized = normalizeReviewedDocument(document);
  const stableDocument = {
    facts: normalized.facts.map((fact) => ({
      id: fact.id,
      fact: fact.fact,
      type: fact.type,
      confidence: fact.confidence,
      verbatim: fact.verbatim,
      human_review: {
        status: fact.human_review.status,
        notes: fact.human_review.notes,
        corrected_fact: fact.human_review.corrected_fact
      }
    }))
  };
  return `${JSON.stringify(stableDocument, null, 2)}\n`;
}

/**
 * Creates and immediately downloads a local JSON file. The object URL is always
 * revoked, including when the browser rejects the click.
 *
 * @param {ReviewedFactsDocument} document
 * @param {string} originalFilename
 * @param {{ Blob?: typeof Blob, URL?: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'>, document?: Pick<Document, 'createElement' | 'body'> }} [browser]
 * @returns {string} The downloaded filename.
 */
export function downloadReviewedDocument(document, originalFilename, browser = {}) {
  const BlobConstructor = browser.Blob ?? Blob;
  const urlApi = browser.URL ?? URL;
  const domDocument = browser.document ?? window.document;
  const filename = getReviewedFilename(originalFilename);
  const blob = new BlobConstructor([serializeReviewedDocument(document)], {
    type: REVIEWED_JSON_MIME_TYPE
  });
  const objectUrl = urlApi.createObjectURL(blob);
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
