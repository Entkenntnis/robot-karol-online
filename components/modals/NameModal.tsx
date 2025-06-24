import { faDice, faTimes } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { closeModal, showModal } from '../../lib/commands/modal'
import { setUserName } from '../../lib/commands/mode'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { navigate } from '../../lib/commands/router'

export function NameModal() {
  const core = useCore()
  const [name, setName] = useState('')
  return (
    <div className="bg-black/20 fixed inset-0 flex justify-center items-center z-[150]">
      {' '}
      <div
        className="sm:w-[500px] w-full mx-3 bg-gradient-to-br from-yellow-50 to-yellow-100 z-[200] rounded-xl relative mb-[30vh] sm:mb-[10vh] border-2 border-yellow-300 shadow-lg overflow-hidden p-4"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <button
          className="absolute top-3 right-3 h-8 w-8 flex justify-center items-center rounded-full bg-yellow-200 hover:bg-yellow-300 transition-colors duration-200"
          onClick={() => {
            closeModal(core)
            navigate(core, '')
          }}
        >
          <FaIcon icon={faTimes} />
        </button>
        <div className="py-3">
          <p className="font-bold text-2xl mt-3 mb-4 text-center text-yellow-800">
            👋 {core.strings.nameModal.invite}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (name.trim()) {
                submit()
              }
            }}
            className="mt-4"
          >
            <div className="text-center flex items-center justify-around">
              <input
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
                className="mt-3 text-3xl border-yellow-400 border-2 rounded-lg text-center py-1 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400 bg-white/80 max-w-[70vw] placeholder:text-gray-200 placeholder:text-xl"
                maxLength={30}
                placeholder="Dein Name..."
              />
              <button
                type="button"
                className="underline hover:text-yellow-600 transition-colors mt-3"
                onClick={() => {
                  const letters = 'abcdefghijklmnopqrstuvwxyz0123456789'
                  let n = ''
                  while (n.length < 6) {
                    n += letters[Math.floor(Math.random() * letters.length)]
                  }
                  setName(n)
                }}
              >
                <FaIcon icon={faDice} className="text-3xl" />
              </button>
            </div>
            <div className="text-center mt-3 text-sm text-yellow-700 italic"></div>
            <div className="text-center mb-3 px-4 sm:mt-8 mt-5">
              <button
                type="submit"
                className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg disabled:bg-gray-200 disabled:text-gray-700 text-yellow-900 font-medium transform transition-all duration-200 hover:scale-105 shadow-md disabled:cursor-not-allowed"
                disabled={!name.trim()}
              >
                ✨ {core.strings.nameModal.start} ✨
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  function submit() {
    setUserName(core, name.trim())
    /*core.mutateWs((ws) => {
      ws.ui.tourModePage = 1
    })*/
    showModal(core, 'character')
  }
}
