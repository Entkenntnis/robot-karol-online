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

export function PlaygroundShareModal() {
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
        className="h-[570px] w-[650px] bg-white z-[200] rounded-xl relative flex justify-start flex-col"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <h1 className="m-3 mt-4 text-xl font-bold">Spielwiese teilen</h1>
        <div className="px-4 py-3 flex flex-col gap-4">
          <label className="block">
            Titel:
            <input
              className="w-full border border-gray-300 rounded p-1 mt-1"
              value={core.ws.quest.title}
              onChange={(e) => {
                core.mutateWs((ws) => {
                  ws.quest.title = e.target.value
                })

                core.mutateWs((ws) => {
                  ws.quest.tasks[0].title = core.ws.quest.title
                })
              }}
            />
          </label>

          <label className="block">
            Beschreibung:
            <textarea
              className="w-full border border-gray-300 rounded p-1 mt-1 resize-none"
              rows={3}
              value={core.ws.quest.description}
              onChange={(e) => {
                core.mutateWs((ws) => {
                  ws.quest.description = e.target.value
                })
              }}
            />
          </label>
        </div>
        <p className="px-4 italic text-gray-600 text-sm mb-5">
          Mit einem Klick lädst du dein Werk auf unseren Server – und es wird im
          Internet für alle zugänglich. Gleichzeitig erklärst du dich damit
          einverstanden, dass dein Inhalt in die Public Domain (CC0) übergeht.
          Das heißt: Jede Person darf damit machen, was sie will – sei es
          kopieren, umbauen oder sogar als Inspiration für sein nächstes
          Meisterwerk nutzen. Du behältst den Urheberstatus, aber der Zauber der
          Kreativität ist jetzt entfesselt! Du kannst alternativ dein Werk als{' '}
          <span>
            <button
              className="underline"
              onClick={() => {
                // offer download
                const blob = new Blob([JSON.stringify(serializeQuest(core))], {
                  type: 'application/json',
                })
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
              JSON herunterladen
            </button>
          </span>{' '}
          und selber hosten.
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
          <p className="flex justify-between mb-12">
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
