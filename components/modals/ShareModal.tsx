import {
  faExternalLinkSquare,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

import { serializeQuest } from '../../lib/commands/json'
import { closeModal } from '../../lib/commands/modal'
import { share } from '../../lib/commands/share'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { replaceWithJSX } from '../../lib/helper/replaceWithJSX'

export function ShareModal() {
  const core = useCore()

  const [pending, setPending] = useState(false)
  const [id, setId] = useState('')

  const link = `${window.location.protocol}//${window.location.host}/#${id}`

  return (
    <div
      className="bg-black/20 absolute inset-0 flex justify-center items-center z-[150]"
      onClick={() => {
        closeModal(core)
      }}
    >
      <div
        className="h-[350px] w-[520px] bg-white z-[200] rounded-xl relative flex justify-between flex-col"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <h1 className="m-3 mt-8 text-xl font-bold">
          {core.strings.editor.share}
        </h1>
        <p className="m-3 -mt-6">
          {replaceWithJSX(
            [core.strings.editor.shareDescription],
            /(\{\{CC0\}\})/,
            () => (
              <a
                href="https://creativecommons.org/publicdomain/zero/1.0/"
                target="_blank"
                rel="noreferrer"
                className="underline text-blue-600 hover:text-blue-700"
                key="1"
              >
                Public Domain (CC0)
              </a>
            )
          )}
        </p>
        {id ? (
          <div className="px-3 mb-5">
            <input
              className="w-full border-yellow-300 outline-none border-2"
              value={link}
              readOnly
            />
            <button
              className="px-2 py-0.5 rounded mt-7 bg-green-300"
              onClick={() => {
                window.open(link, '_blank')
              }}
            >
              {core.strings.editor.openInNewTab}{' '}
              <FaIcon icon={faExternalLinkSquare} />
            </button>
          </div>
        ) : (
          <p className="flex justify-between">
            <button
              className="px-2 py-0.5 bg-yellow-200 hover:bg-yellow-300 rounded ml-3 mb-6"
              onClick={async () => {
                setPending(true)
                try {
                  const id = await share(core)
                  setId(id)
                } catch (e) {
                  alert('Fehler: ' + e)
                }
              }}
              disabled={pending}
            >
              {pending ? (
                <>
                  <FaIcon icon={faSpinner} className="animate-spin" />{' '}
                  {core.strings.editor.loading}
                </>
              ) : (
                core.strings.editor.createLink
              )}
            </button>
            <span>
              <button
                className="mr-3 text-sm text-gray-700 underline"
                onClick={() => {
                  // offer download
                  const blob = new Blob(
                    [JSON.stringify(serializeQuest(core))],
                    { type: 'application/json' }
                  )
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  const title = core.ws.quest.title || 'quest'
                  // make sure to remove special characters
                  a.download = title.replace(/[^a-z0-9]/gi, '_') + '.json'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                {core.strings.editor.downloadJSON}
              </button>
            </span>
          </p>
        )}
        <p className="text-center mb-3 mt-3">
          <button
            className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() => {
              closeModal(core)
            }}
          >
            {core.strings.editor.close}
          </button>
        </p>
      </div>
    </div>
  )
}
