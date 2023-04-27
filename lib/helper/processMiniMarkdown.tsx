import { openImage } from '../commands/mode'
import { useCore } from '../state/core'
import { replaceWithJSX } from './replaceWithJSX'

export function processMiniMarkdown(input: string) {
  const key = { val: 1 }
  return replaceWithJSX(
    replaceWithJSX(
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
      /(https:\/\/de\.serlo\.org\/[\d]+|https:\/\/app\.lumi\.education\/run\/[\w]+)/gm,
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
    ),
    /%img\[(.+?)\]%/,
    (str) => {
      const [title, url] = str.split('|')
      return <ImageButton text={title} src={url} />
    }
  )
}

interface ImageButtonProps {
  text: string
  src: string
}

function ImageButton({ text, src }: ImageButtonProps) {
  const core = useCore()

  return (
    <button
      onClick={() => {
        openImage(core, src)
      }}
      className="text-blue-600 hover:text-blue-900 underline transition-colors"
    >
      {text}
    </button>
  )
}
