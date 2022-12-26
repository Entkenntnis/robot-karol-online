import {
  faExternalLinkSquare,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons'
import link from 'next/link'
import { useState } from 'react'

import { setShareModal } from '../lib/commands/editor'
import { share } from '../lib/commands/share'
import { useCore } from '../lib/state/core'
import { FaIcon } from './FaIcon'

export function ShareModal() {
  const core = useCore()

  const [pending, setPending] = useState(false)
  const [id, setId] = useState('')

  const link = `${window.location.protocol}//${window.location.host}/#${id}`

  return (
    <div
      className="bg-black/20 absolute inset-0 flex justify-center items-center z-[150]"
      onClick={() => {
        setShareModal(core, false)
      }}
    >
      <div
        className="h-[350px] w-[520px] bg-white z-[200] rounded-xl relative flex justify-between flex-col"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <h1 className="m-3 mt-8 text-xl font-bold">Teilen</h1>
        <p className="m-3 -mt-6">
          Gib deine Aufgabe frei und mache sie online verfügbar. Dazu werden die
          Daten auf dem Server gespeichert. Durch die Freigabe stimmst du zu,
          dass die Aufgabe unter{' '}
          <a
            href="https://creativecommons.org/publicdomain/zero/1.0/"
            target="_blank"
            rel="noreferrer"
            className="underline text-blue-600 hover:text-blue-700"
          >
            Public Domain (CC0)
          </a>{' '}
          gestellt wird und weiterverwendet werden darf.
        </p>
        {id ? (
          <div className="px-3 mb-5">
            <input
              className="border w-full border-yellow-300 outline-none border-2"
              value={link}
              readOnly
            />
            <button
              className="px-2 py-0.5 rounded mt-7 bg-green-300"
              onClick={() => {
                window.open(link, '_blank')
              }}
            >
              Link in neuem Tab öffnen <FaIcon icon={faExternalLinkSquare} />
            </button>
          </div>
        ) : (
          <p>
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
                  <FaIcon icon={faSpinner} className="animate-spin" /> wird
                  geladen ...
                </>
              ) : (
                `Link erstellen`
              )}
            </button>
          </p>
        )}
        <p className="text-center mb-3 mt-3">
          <button
            className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() => {
              setShareModal(core, false)
            }}
          >
            Schließen
          </button>
        </p>
      </div>
    </div>
  )
}
