// @ts-nocheck
import {
  CONFIDENCE_LEVELS,
  DEFAULT_FACT_ENRICHMENT,
  FACT_TYPES,
  VERIFICATION_STATUSES,
  createSummary
} from './contracts.js';
/** @typedef {import('./contracts.js').ResultDocument} ResultDocument */
/** @typedef {import('./contracts.js').Fact} Fact */
export class FactsImportError extends Error {
  constructor(path, message) {
    super(`${path}: ${message}`);
    this.name = 'FactsImportError';
    this.path = path;
  }
}
/** @param {unknown} value @param {string} path */
function requireObject(value, path) {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    throw new FactsImportError(path, 'debe ser un objeto.');
  return /** @type {Record<string, unknown>} */ (value);
}
/** @param {Record<string, unknown>} value @param {string} key @param {string} path */
function requireNumber(value, key, path) {
  if (typeof value[key] !== 'number' || !Number.isFinite(value[key]))
    throw new FactsImportError(`${path}.${key}`, 'debe ser un número finito.');
  return /** @type {number} */ (value[key]);
}
/** @param {Record<string, unknown>} value @param {string} key @param {string} path */
function requireNullableNumber(value, key, path) {
  if (value[key] === null) return null;
  return requireNumber(value, key, path);
}
/** @param {unknown} value @param {string} path @returns {Fact} */
function validateFact(value, path) {
  const fact = requireObject(value, path);
  for (const key of ['id', 'fact', 'type', 'confidence', 'verbatim', 'position'])
    if (!Object.hasOwn(fact, key)) throw new FactsImportError(`${path}.${key}`, 'es obligatorio.');
  const id = requireNumber(fact, 'id', path);
  if (typeof fact.fact !== 'string') throw new FactsImportError(`${path}.fact`, 'debe ser texto.');
  if (!FACT_TYPES.includes(/** @type {any} */ (fact.type)))
    throw new FactsImportError(`${path}.type`, `debe ser uno de: ${FACT_TYPES.join(', ')}.`);
  if (!CONFIDENCE_LEVELS.includes(/** @type {any} */ (fact.confidence)))
    throw new FactsImportError(
      `${path}.confidence`,
      `debe ser uno de: ${CONFIDENCE_LEVELS.join(', ')}.`
    );
  if (fact.verbatim !== null && typeof fact.verbatim !== 'string')
    throw new FactsImportError(`${path}.verbatim`, 'debe ser texto o null.');
  const position = requireObject(fact.position, `${path}.position`);
  if (fact.notes !== undefined && typeof fact.notes !== 'string')
    throw new FactsImportError(`${path}.notes`, 'debe ser texto.');
  if (
    fact.verification_status !== undefined &&
    ![...VERIFICATION_STATUSES, 'not_verified'].includes(
      /** @type {any} */ (fact.verification_status)
    )
  )
    throw new FactsImportError(
      `${path}.verification_status`,
      `debe ser uno de: ${VERIFICATION_STATUSES.join(', ')}.`
    );
  return {
    ...fact,
    id,
    fact: fact.fact,
    type: /** @type {any} */ (fact.type),
    confidence: /** @type {any} */ (fact.confidence),
    verbatim: /** @type {string | null} */ (fact.verbatim),
    position: {
      ...position,
      line: requireNullableNumber(position, 'line', `${path}.position`),
      column: requireNullableNumber(position, 'column', `${path}.position`)
    },
    notes: typeof fact.notes === 'string' ? fact.notes : DEFAULT_FACT_ENRICHMENT.notes,
    verification_status:
      fact.verification_status === undefined || fact.verification_status === 'not_verified'
        ? DEFAULT_FACT_ENRICHMENT.verification_status
        : /** @type {any} */ (fact.verification_status)
  };
}
/** @param {unknown} value @returns {ResultDocument} */
export function validateResultDocument(value) {
  const root = requireObject(value, 'root');
  for (const key of ['summary', 'verbatim_facts', 'inferred_facts'])
    if (!Object.hasOwn(root, key)) throw new FactsImportError(`root.${key}`, 'es obligatorio.');
  if (!Array.isArray(root.verbatim_facts))
    throw new FactsImportError('verbatim_facts', 'debe ser un arreglo.');
  if (!Array.isArray(root.inferred_facts))
    throw new FactsImportError('inferred_facts', 'debe ser un arreglo.');
  const summary = requireObject(root.summary, 'summary');
  const special = {
    failed_citations: requireNumber(summary, 'failed_citations', 'summary'),
    unlocated: requireNumber(summary, 'unlocated', 'summary')
  };
  const verbatim_facts = root.verbatim_facts.map((fact, index) =>
    validateFact(fact, `verbatim_facts[${index}]`)
  );
  const inferred_facts = root.inferred_facts.map((fact, index) =>
    validateFact(fact, `inferred_facts[${index}]`)
  );
  return {
    ...root,
    summary: createSummary(verbatim_facts, inferred_facts, special),
    verbatim_facts,
    inferred_facts
  };
}
/** @param {string} text @returns {ResultDocument} */
export function parseResultJson(text) {
  try {
    return validateResultDocument(JSON.parse(text));
  } catch (error) {
    if (error instanceof FactsImportError) throw error;
    throw new FactsImportError('root', 'el archivo no contiene JSON válido.');
  }
}
/** @param {{ text: () => Promise<string> }} file */
export async function readResultFile(file) {
  return parseResultJson(await file.text());
}
export const validateFactsDocument = validateResultDocument;
export const parseFactsJson = parseResultJson;
export const readFactsFile = readResultFile;
