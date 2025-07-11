import { compiler } from 'markdown-to-jsx'
import { showModal } from '../commands/modal'
import { openImage } from '../commands/mode'
import { useCore } from '../state/core'
import { CodeBox } from '../../components/helper/Cheatsheet'
import clsx from 'clsx'

export function processMarkdown(
  input: string,
  { useProse }: { useProse?: boolean } = {}
) {
  return (
    <div
      className={clsx(
        useProse
          ? 'prose prose-pre:bg-white prose-pre:text-black prose-pre:px-3 py-2'
          : '[&_p]:my-3 [&_ul]:list-disc [&_li]:ml-4 [&_a]:text-blue-500 hover:[&_a]:underline [&_a]:hover:text-blue-600 [&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_blockquote]:my-3 [&_ul]:my-3 [&_ol]:my-3 [&_ol]:list-decimal [&_h1]:font-bold [&_h1]:text-2xl [&_h2]:font-semibold [&_h2]:text-xl [&_h2]:text-gray-700 [&_h2]:mb-3 [&_h2]:mt-5 [&_h3]:font-bold [&_li]:my-1 [&_summary]:cursor-pointer [&_details]:my-2 [&_details>*]:ml-4 [&_summary]:ml-0 [&_details]:bg-yellow-200 [&_details]:rounded-lg [&_details]:px-2 [&_details]:-mx-2 [&_details]:py-1'
      )}
    >
      {compiler(input, {
        disableAutoLink: true,
        wrapper: null,
        forceBlock: true,
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
          Tutorial,
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
    <div className="bg-white rounded my-3" {...props}>
      <CodeBox
        key={children.trim()}
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

function Tutorial() {
  const core = useCore()
  return (
    <>
      <p>{core.strings.ide.welcome}</p>
      <div className="mt-6 mb-2">
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
  )
}
