import { replaceWithJSX } from './replaceWithJSX'

export function processMiniMarkdown(input: string) {
  const key = { val: 1 }
  return replaceWithJSX(
    replaceWithJSX([input], /(^\s*(?:$\s*)*$)/gm, (_, i) => (
      <div className="h-3" key={key.val++}></div>
    )),
    /`(.+?)`/,
    (str, i) => (
      <span key={key.val++} className="font-[hack] font-bold">
        {str}
      </span>
    )
  )
}
