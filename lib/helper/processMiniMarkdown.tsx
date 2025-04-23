import { compiler } from 'markdown-to-jsx'
import { showModal } from '../commands/modal'
import { openImage } from '../commands/mode'
import { Core, useCore } from '../state/core'
import { CodeBox } from '../../components/helper/Cheatsheet'

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
        processMarkdown(core.ws.quest.description)
      )}
    </>
  )
}

export function processMarkdown(input: string) {
  return (
    <div className="[&_p]:my-3 [&_ul]:list-disc [&_ul]:list-inside [&_a]:text-blue-500 hover:[&_a]:underline [&_a]:hover:text-blue-600 [&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_blockquote]:my-3 [&_ul]:my-3 [&_ol]:my-3] [&_ol]:list-inside [&_ol]:list-decimal">
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
          code: Code,
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

function Code({
  className,
  children,
  ...props
}: {
  className?: string
  children: string
}) {
  if (!className) {
    return (
      <code className="font-[hack] font-bold" {...props}>
        {children}
      </code>
    )
  }
  return (
    <div
      className="my-3 py-2 bg-white rounded-lg border border-gray-200 "
      {...props}
    >
      <CodeBox
        doc={children.trim()}
        language={
          className == 'lang-py' || className == 'lang-python'
            ? 'python-pro'
            : 'robot karol'
        }
      />
    </div>
  )
}
