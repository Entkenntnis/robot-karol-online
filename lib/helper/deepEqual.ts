/**
 * Deep equality for plain objects (handles nested objects/arrays if ever needed),
 * but for flat objects like ExperimentEvent it's just a strict property-by-property compare.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true

  if (
    typeof a !== 'object' ||
    a === null ||
    typeof b !== 'object' ||
    b === null
  ) {
    return false
  }

  const aObj = a as Record<string, unknown>
  const bObj = b as Record<string, unknown>

  const aKeys = Object.keys(aObj)
  const bKeys = Object.keys(bObj)

  if (aKeys.length !== bKeys.length) return false

  return aKeys.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(bObj, key) &&
      deepEqual(aObj[key], bObj[key]),
  )
}
