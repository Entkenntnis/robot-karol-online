import { showModal } from '../commands/modal'
import { openImage } from '../commands/mode'
import { Core, useCore } from '../state/core'
import { replaceWithJSX } from './replaceWithJSX'

export function renderDescription(core: Core) {
  return (
    <>
      {core.ws.quest.description == '[[tutorial]]' ? (
        <>
          <p>{core.strings.ide.welcome}</p>
          <div className="mt-6">
            <button
              className="px-4 py-2 rounded-lg bg-blue-200 hover:bg-blue-300 font-bold"
              onClick={() => {
                showModal(core, 'tutorial')
              }}
            >
              {core.strings.ide.tutorialButton}
            </button>
          </div>
        </>
      ) : (
        processMiniMarkdown(core.ws.quest.description)
      )}
    </>
  )
}

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
      /(https:\/\/de\.serlo\.org\/[\d]+|https:\/\/karol\.arrrg\.de\/[^ ]+|https:\/\/app\.lumi\.education\/run\/[\w]+)/gm,
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
      return <ImageButton text={title} src={url} key={url} />
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
    <span
      onClick={() => {
        openImage(core, src)
      }}
      className="text-blue-600 hover:text-blue-900 underline transition-colors cursor-pointer"
    >
      {text}
    </span>
  )
}
