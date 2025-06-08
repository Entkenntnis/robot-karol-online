import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { closeModal } from '../../lib/commands/modal'
import { getProgram } from '../../lib/commands/save'
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
        closeModal(core)
      }}
    >
      <div
        className="h-[300px] w-[420px] bg-white z-[400] rounded-xl relative flex justify-between flex-col items-center"
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
              <h2 className="text-xl font-bold mt-8 mb-3 text-blue-700">
                Frage oder Feedback?
              </h2>
              <p className="text-base text-gray-700 mb-4 max-w-[340px] text-center">
                Sag uns kurz, was unklar ist!
              </p>
              <form
                className="w-full flex flex-col items-center"
                onSubmit={(e) => {
                  e.preventDefault()
                  let q = (e.currentTarget[0] as any).value
                  let ev = ''
                  if (core.ws.quest.id > 0) {
                    const { program, language } = getProgram(core)
                    if (program) {
                      q = `${q} (Sprache: ${language}, Programm: ${program})`
                    }
                    ev = `ev_question_${core.ws.quest.id}_${JSON.stringify(
                      q.length < 900 ? q : q.slice(0, 900)
                    )}`
                  } else {
                    ev = `ev_questionPyEx_${
                      core.ws.ui.sharedQuestId
                    }_${JSON.stringify(q.length < 900 ? q : q.slice(0, 900))}`
                  }

                  submitAnalyzeEvent(core, ev)
                  setSubmitted(true)
                }}
              >
                <textarea
                  className="w-[90%] max-w-[340px] min-h-[90px] border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none text-base"
                  maxLength={200}
                  placeholder="Deine Frage oder Feedback (max. 200 Zeichen) ..."
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Absenden
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mt-12 mb-4 text-blue-700 text-center">
                Danke für deine Rückmeldung!
              </h2>
              <p className="text-base text-gray-700 mb-6 max-w-[340px] text-center">
                Wir haben deine Nachricht erhalten und nutzen sie, um Robot
                Karol Online zu verbessern.
              </p>
              <button
                className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
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
