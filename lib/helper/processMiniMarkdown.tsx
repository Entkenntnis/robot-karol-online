import { replaceWithJSX } from './replaceWithJSX'

export function processMiniMarkdown(input: string) {
  const key = { val: 1 }
  return replaceWithJSX(
    replaceWithJSX(
      replaceWithJSX([input], /(^\s*(?:$\s*)*$)/gm, () => (
        <div className="h-3" key={key.val++}></div>
      )),
      /`(.+?)`/,
      (str) => (
        <span key={key.val++} className="font-[hack] font-bold">
          {str}
        </span>
      )
    ),
    /(https:\/\/de\.serlo\.org\/[\d]+)/gm,
    (str) => (
      <a
        href={str}
        target="_blank"
        key={key.val++}
        rel="noreferrer"
        className="text-blue-500 hover:underline hover:text-blue-600"
      >
        {str}
      </a>
    )
  )
}
