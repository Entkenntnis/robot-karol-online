import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { closeModal } from '../../lib/commands/modal'
import { setUserName } from '../../lib/commands/mode'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { navigate } from '../../lib/commands/router'

export function NameModal() {
  const core = useCore()
  const [name, setName] = useState('')
  return (
    <div className="bg-black/20 fixed inset-0 flex justify-center items-center z-[150]">
      <div
        className="h-[280px] w-[500px] bg-white z-[200] rounded-xl relative mb-[30vh] sm:mb-[10vh]"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <button
          className="absolute top-3 right-3 h-8 w-8 flex justify-center items-center rounded-full bg-gray-200 hover:bg-gray-300"
          onClick={() => {
            closeModal(core)
            navigate(core, '')
          }}
        >
          <FaIcon icon={faTimes} />
        </button>
        <div>
          <p className="ml-4 font-bold text-lg mt-6 mb-4 text-center">
            {core.strings.nameModal.title}
          </p>
          <p className="text-center mt-6">{core.strings.nameModal.invite}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (name.trim()) {
                submit()
              }
            }}
          >
            <p className="text-center">
              <input
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
                className="mt-4 text-3xl border-blue-500 border-2 rounded text-center"
                maxLength={30}
              />
            </p>
            <p className="text-center mt-3 text-sm text-gray-500 italic">
              <button
                type="button"
                className="underline"
                onClick={() => {
                  const letters = 'abcdefghijklmnopqrstuvwxyz0123456789'
                  let n = ''
                  while (n.length < 6) {
                    n += letters[Math.floor(Math.random() * letters.length)]
                  }
                  setName(n)
                }}
              >
                {core.strings.nameModal.random}
              </button>
            </p>
            <p className="text-center mb-5 px-4 sm:mt-8 mt-3">
              <button
                type="submit"
                className="px-2 py-0.5 bg-green-200 hover:bg-green-300 rounded disabled:bg-gray-200 disabled:text-gray-700"
                disabled={!name.trim()}
              >
                {core.strings.nameModal.start}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )

  function submit() {
    setUserName(core, name.trim())
    closeModal(core)
  }
}
