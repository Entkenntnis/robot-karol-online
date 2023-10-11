import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import clsx from 'clsx'

export function TutorialModal() {
  const core = useCore()
  const [page, setPage] = useState(0)
  return (
    <div className="bg-black/20 fixed inset-0 flex justify-center items-center z-[350]">
      <div
        className="max-h-[90%] w-[900px] bg-white z-[400] rounded-xl relative overflow-auto"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <button
          className="absolute top-3 right-3 h-8 w-8 flex justify-center items-center rounded-full bg-gray-200 hover:bg-gray-300"
          onClick={() => {
            closeModal(core)
          }}
        >
          <FaIcon icon={faTimes} />
        </button>
        <div>
          <p className="font-bold text-xl mt-6 mb-8 text-center">Tutorial</p>
          {page == 0 && (
            <div className="h-[350px]">
              <p className="ml-6 text-lg">
                Baue mit Karol die Welt wie gezeigt.
              </p>
              <img
                src="/tutorial/step1.png"
                alt="Karol geht zwei Schritte und legt einen Ziegel"
                className="my-10"
              />
              <p className="ml-6 text-lg">
                Mit <strong>Schritt</strong> geht Karol ein Feld nach vorne. Mit{' '}
                <strong>Hinlegen</strong> legt Karol auf das Feld vor sich einen
                Ziegel.
              </p>
            </div>
          )}
          {page == 1 && (
            <div className="h-[450px] flex justify-between">
              <p className="text-lg mx-4 mt-4">
                <strong>Ziehe Befehle</strong> aus dem Block-Menü auf die
                Arbeitsfläche und <strong>verbinde</strong> sie zu einem
                Programm.
                <br />
                <br />
                Klicke auf Start. Die Befehle werden von oben nach unten
                ausgeführt.
              </p>
              <img
                src="/tutorial/first_steps.gif"
                alt="Ziehe Befehle vom Menü auf die Arbeitsfläche und führe das Programm aus"
                className="mr-4 mb-6"
              />
            </div>
          )}
          {page == 2 && (
            <div className="h-[350px]">
              <p className="text-lg mx-4 mt-4">
                Löse die erste Aufgabe mit diesen Befehlen.
              </p>
              <p className="text-lg mx-4 mt-4">
                <strong>Schritt</strong>: Karol geht einen Schritt nach vorne
              </p>
              <p className="text-lg mx-4 mt-4">
                <strong>Hinlegen</strong>: Karol legt auf das Feld vor sich
                einen Ziegel.
              </p>
            </div>
          )}
          <div className="mx-8 flex justify-between items-baseline">
            <button
              className={clsx(
                'text-gray-700 hover:text-black hover:underline',
                'invisible'
              )}
              onClick={() => {
                setPage((val) => val - 1)
              }}
            >
              zurück
            </button>
            <button
              className="px-2 py-0.5 rounded bg-blue-200 hover:bg-blue-300"
              onClick={() => {
                if (page == 1) {
                  closeModal(core)
                } else {
                  setPage((val) => val + 1)
                }
              }}
            >
              {page == 1 ? 'Fertig' : 'Weiter'}
            </button>
          </div>
        </div>
        <p className="text-center mb-5 px-4 mt-8"></p>
      </div>
    </div>
  )
}
