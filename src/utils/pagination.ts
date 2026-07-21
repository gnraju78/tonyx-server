export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
  readonly skip: number;
}

export interface RawQuery {
  readonly page?: unknown;
  readonly limit?: unknown;
  readonly sort?: unknown;
  readonly [key: string]: unknown;
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;

export function getPaginationParams(query: RawQuery): PaginationParams {
  const page = Math.max(toPositiveInt(query.page) ?? 1, 1);
  const limit = Math.min(toPositiveInt(query.limit) ?? DEFAULT_LIMIT, MAX_LIMIT);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function getSortParams(sortQuery: unknown): Record<string, 1 | -1> {
  if (typeof sortQuery !== 'string' || sortQuery.length === 0) {
    return {};
  }

  return sortQuery.split(',').reduce<Record<string, 1 | -1>>((acc, rawField) => {
    const isDescending = rawField.startsWith('-');
    const fieldName = isDescending ? rawField.slice(1) : rawField;

    if (fieldName.length > 0) {
      acc[fieldName] = isDescending ? -1 : 1;
    }

    return acc;
  }, {});
}

/**
 * Builds a Mongo filter from only an explicit allowlist of scalar fields.
 * Query-string params are never spread directly into a filter — Express's
 * default `qs` parser turns `field[$gt]=x` into `{ field: { $gt: 'x' } }`,
 * which is a NoSQL operator-injection vector if passed straight through.
 * Only string/number/boolean values for allowlisted keys are accepted.
 */
export function pickFilterFields<T extends Record<string, unknown>>(
  query: RawQuery,
  allowedFields: ReadonlyArray<keyof T & string>
): Partial<T> {
  const filter: Partial<T> = {};

  for (const field of allowedFields) {
    const value = query[field];
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      (filter as Record<string, unknown>)[field] = value;
    }
  }

  return filter;
}

function toPositiveInt(value: unknown): number | null {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
