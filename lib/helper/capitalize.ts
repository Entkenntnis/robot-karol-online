export function capitalize(str: string) {
  if (str.length < 2) {
    return str.toUpperCase()
  }
  return str.charAt(0).toUpperCase() + str.slice(1)
}
