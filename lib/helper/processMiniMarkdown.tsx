import { compiler } from 'markdown-to-jsx'
import { showModal } from '../commands/modal'
import { openImage } from '../commands/mode'
import { Core, useCore } from '../state/core'

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
  return (
    <div
      className="[&_p]:my-3 [&_ul]:list-disc [&_ul]:list-inside [&_a]:text-blue-500 hover:[&_a]:underline [&_a]:hover:text-blue-600 [&_code]:font-[hack] [&_code]:font-bold
      	[&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_blockquote]:my-3 [&_ul]:my-3 [&_ol]:my-3] [&_ol]:list-inside [&_ol]:list-decimal"
    >
      {compiler(input, {
        disableAutoLink: true,
        wrapper: null,
        overrides: {
          a: {
            props: {
              target: '_blank',
              rel: 'noreferrer',
            },
          },
          ImageButton: {
            component: ImageButton,
          },
        },
      })}
    </div>
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
