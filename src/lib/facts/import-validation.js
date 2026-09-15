import { CONFIDENCE_LEVELS, FACT_TYPES } from './contracts.js';

/** @typedef {import('./contracts.js').Confidence} Confidence */
/** @typedef {import('./contracts.js').Fact} Fact */
/** @typedef {import('./contracts.js').FactType} FactType */
/** @typedef {import('./contracts.js').FactsDocument} FactsDocument */

const ROOT_KEYS = ['facts'];
const FACT_KEYS = ['id', 'fact', 'type', 'confidence', 'verbatim'];

/**
 * An error that identifies the precise field that prevents an import.
 */
export class FactsImportError extends Error {
  /**
   * @param {string} path
   * @param {string} message
   */
  constructor(path, message) {
    super(`${path}: ${message}`);
    this.name = 'FactsImportError';
    this.path = path;
  }
}

/**
 * @param {unknown} value
 * @param {string} path
 * @returns {Record<string, unknown>}
 */
function requireObject(value, path) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new FactsImportError(path, 'debe ser un objeto.');
  }

  return /** @type {Record<string, unknown>} */ (value);
}

/**
 * Ensures an object contains precisely the keys defined by its schema.
 *
 * @param {Record<string, unknown>} object
 * @param {string[]} allowedKeys
 * @param {string} path
 * @returns {void}
 */
function requireExactKeys(object, allowedKeys, path) {
  for (const key of Object.keys(object)) {
    if (!allowedKeys.includes(key)) {
      throw new FactsImportError(`${path}.${key}`, 'no es un campo permitido.');
    }
  }

  for (const key of allowedKeys) {
    if (!Object.hasOwn(object, key)) {
      throw new FactsImportError(`${path}.${key}`, 'es obligatorio.');
    }
  }
}

/**
 * Validates an imported facts document without changing the source data.
 *
 * The input schema is deliberately closed: the root accepts only `facts`, and
 * every fact accepts only the five fields described by {@link Fact}.
 *
 * @param {unknown} value
 * @returns {FactsDocument}
 * @throws {FactsImportError} When the value does not match the import schema.
 */
export function validateFactsDocument(value) {
  const root = requireObject(value, 'root');
  requireExactKeys(root, ROOT_KEYS, 'root');

  if (!Array.isArray(root.facts)) {
    throw new FactsImportError('facts', 'debe ser un arreglo.');
  }

  /** @type {Fact[]} */
  const facts = [];

  for (const [index, value] of root.facts.entries()) {
    const path = `facts[${index}]`;
    const fact = requireObject(value, path);
    requireExactKeys(fact, FACT_KEYS, path);

    if (typeof fact.id !== 'number' || !Number.isFinite(fact.id)) {
      throw new FactsImportError(`${path}.id`, 'debe ser un número finito.');
    }

    if (typeof fact.fact !== 'string') {
      throw new FactsImportError(`${path}.fact`, 'debe ser texto.');
    }

    if (!FACT_TYPES.includes(/** @type {FactType} */ (fact.type))) {
      throw new FactsImportError(`${path}.type`, `debe ser uno de: ${FACT_TYPES.join(', ')}.`);
    }

    if (!CONFIDENCE_LEVELS.includes(/** @type {Confidence} */ (fact.confidence))) {
      throw new FactsImportError(
        `${path}.confidence`,
        `debe ser uno de: ${CONFIDENCE_LEVELS.join(', ')}.`
      );
    }

    if (fact.verbatim !== null && typeof fact.verbatim !== 'string') {
      throw new FactsImportError(`${path}.verbatim`, 'debe ser texto o null.');
    }

    facts.push({
      id: fact.id,
      fact: fact.fact,
      type: /** @type {FactType} */ (fact.type),
      confidence: /** @type {Confidence} */ (fact.confidence),
      verbatim: /** @type {string | null} */ (fact.verbatim)
    });
  }

  return { facts };
}

/**
 * Parses JSON text and validates it against the strict import schema.
 *
 * @param {string} text
 * @returns {FactsDocument}
 * @throws {FactsImportError} When JSON is malformed or has an invalid shape.
 */
export function parseFactsJson(text) {
  let value;

  try {
    value = JSON.parse(text);
  } catch {
    throw new FactsImportError('root', 'el archivo no contiene JSON válido.');
  }

  return validateFactsDocument(value);
}

/**
 * Reads, parses, and validates a local file. The caller retains ownership of
 * displaying the file name and any import error; this helper never uses a network.
 *
 * @param {{ text: () => Promise<string> }} file
 * @returns {Promise<FactsDocument>}
 */
export async function readFactsFile(file) {
  return parseFactsJson(await file.text());
}
