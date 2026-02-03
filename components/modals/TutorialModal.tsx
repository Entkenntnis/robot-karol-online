import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import clsx from 'clsx'

export function TutorialModal() {
  const core = useCore()
  const [page, setPage] = useState(0)

  const isEnd =
    (core.ws.settings.lng === 'en' && page === 1) ||
    (core.ws.settings.lng === 'de' && page === 2)
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
          {page == 0 && core.ws.settings.lng == 'de' && (
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
          {page == 1 && core.ws.settings.lng == 'de' && (
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
          {page == 2 && core.ws.settings.lng == 'de' && (
            <div className="h-[450px] flex justify-between">
              <p className="text-lg mx-4 mt-4">
                Schalte weitere Aufgaben auf der Karte frei!
              </p>
              <img
                src="/tutorial/path.jpg"
                alt="Beispiel für weitere Aufgaben"
                className="mr-4 mb-6"
              />
            </div>
          )}
          {page == 0 && core.ws.settings.lng == 'en' && (
            <div className="h-[350px]">
              <p className="ml-6 text-lg">
                Build the world with Karol as shown.
              </p>
              <img
                src="/tutorial/step1.png"
                alt="Karol takes two steps and places a brick"
                className="my-10"
              />
              <p className="ml-6 text-lg">
                With <strong>step</strong>, Karol moves one field forward. With{' '}
                <strong>set down</strong>, Karol places a brick on the field in
                front.
              </p>
            </div>
          )}
          {page == 1 && core.ws.settings.lng == 'en' && (
            <div className="h-[450px] flex justify-between">
              <p className="text-lg mx-4 mt-4">
                <strong>Drag commands</strong> from the block menu onto the
                workspace and <strong>connect</strong> them to form a program.
                <br />
                <br />
                Click Start. The commands will be executed from top to bottom.
              </p>
              <img
                src="/tutorial/first_steps.gif"
                alt="Drag commands from the menu to the workspace and run the program"
                className="mr-4 mb-6"
              />
            </div>
          )}

          <div className="mx-8 flex justify-between items-baseline">
            <button
              className={clsx(
                'text-gray-700 hover:text-black hover:underline',
                'invisible',
              )}
              onClick={() => {
                setPage((val) => val - 1)
              }}
            >
              ---
            </button>
            <button
              className="px-2 py-0.5 rounded bg-blue-200 hover:bg-blue-300"
              onClick={() => {
                if (isEnd) {
                  closeModal(core)
                } else {
                  setPage((val) => val + 1)
                }
              }}
            >
              {isEnd ? core.strings.ide.done : core.strings.ide.continue}
            </button>
          </div>
        </div>
        <p className="text-center mb-5 px-4 mt-8"></p>
      </div>
    </div>
  )
}
