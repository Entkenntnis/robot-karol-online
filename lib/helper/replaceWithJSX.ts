export function replaceWithJSX(
  input: (string | React.ReactElement)[],
  regex: RegExp,
  fn: (str: string, i: number) => React.ReactElement
) {
  return input.flatMap((str) => {
    if (typeof str == 'string') {
      const result = str.split(regex) as (string | React.ReactElement)[]
      for (let i = 1; i < result.length; i += 2) {
        result[i] = fn(result[i] as string, i)
      }
      return result
    } else {
      return [str]
    }
  })
}
