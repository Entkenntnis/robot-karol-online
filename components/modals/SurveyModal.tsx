import { submitEvent } from '../../lib/helper/submit'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

export function SurveyModal() {
  const core = useCore()
  const [submitted, setSubmitted] = useState(false)
  return (
    <div
      className="bg-black/20 fixed inset-0 flex justify-center items-center z-[350]"
      onClick={() => {
        // closeModal(core)
      }}
    >
      <div
        className="h-[400px] w-[600px] bg-white z-[400] rounded-xl relative flex justify-between flex-col items-center"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <button
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          title="Schließen"
          onClick={() => {
            closeModal(core)
          }}
        >
          <FaIcon icon={faTimes} />
        </button>
        <div className="w-full flex flex-col items-center justify-center flex-grow">
          {!submitted ? (
            <>
              <h2 className="text-xl font-bold mt-8 mb-3 text-emerald-800">
                Feedback zu Robot Karol Online
              </h2>
              <p className="text-base text-gray-700 mb-4 w-[480px] text-left">
                Wie können wir Robot Karol Online für dich besser gestalten?
              </p>
              <form
                className="w-full flex flex-col items-center"
                onSubmit={(e) => {
                  e.preventDefault()
                  let q = (e.currentTarget[0] as any).value
                  if (q.length > 1900) {
                    q = q.slice(0, 1900)
                  }
                  submitEvent('landing-feedback', q)
                  setSubmitted(true)
                }}
              >
                <textarea
                  className="w-[90%] max-w-[500px] min-h-[180px] border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-base"
                  maxLength={2000}
                  placeholder="Dein Feedback ..."
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  Absenden
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mt-12 mb-4 text-emerald-800 text-center">
                Danke für deine Rückmeldung!
              </h2>
              <p className="text-base text-gray-700 mb-6 max-w-[340px] text-center">
                Wir haben deine Nachricht erhalten und nutzen sie, um Robot
                Karol Online zu verbessern.
              </p>
              <button
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold shadow focus:outline-none focus:ring-2 focus:ring-emerald-300"
                onClick={() => closeModal(core)}
              >
                Schließen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
