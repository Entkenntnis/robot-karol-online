import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { closeModal } from '../../lib/commands/modal'
import { finishQuest } from '../../lib/commands/quest'
import { useCore } from '../../lib/state/core'
import confetti from 'canvas-confetti'
import { positiveText, positiveTextEn } from '../../lib/helper/positiveText'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from '../helper/FaIcon'
import { saveCodeToFile } from '../../lib/commands/save'

var count = 200
var defaults = {
  origin: { y: 0.7 },
  zIndex: 170,
}

function fire(particleRatio: number, opts: any) {
  confetti(
    Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio),
    })
  )
}

function realisticLook() {
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  })
  fire(0.2, {
    spread: 60,
  })
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  })
}

export function SuccessModal() {
  const core = useCore()
  const [positive] = useState(
    core.ws.settings.lng == 'de' ? positiveText() : positiveTextEn()
  )

  const [hasFeedback, setHasFeedback] = useState(false)

  const [rate, setRate] = useState(0)

  const [firstPaint, setFirstPaint] = useState(true)
  // closeModal(core)
  // switchToPage(core, 'overview')

  useEffect(() => {
    setTimeout(() => {
      realisticLook()
    }, 444)
    setTimeout(() => {
      setFirstPaint(false)
    }, 50)
  }, [])

  return (
    <>
      <div
        className={clsx(
          'bg-black/20 fixed inset-0 z-[150] transition-opacity duration-700 ease-out',
          firstPaint ? 'opacity-0' : 'opacity-100'
        )}
      ></div>
      <div
        className={clsx(
          'fixed inset-0 flex justify-center items-center z-[200] transition-opacity duration-700 ease-out',
          firstPaint ? 'opacity-0' : 'opacity-100'
        )}
      >
        <div
          className="w-[500px] bg-white z-[200] rounded-xl relative flex items-center justify-between flex-col"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <h1 className="mt-10 text-4xl mb-8">{positive}</h1>
          {
            /* (
            <>
              <div className="mb-2">Wie gut hat dir die Aufgabe gefallen?</div>
              <Rating
                className="[&_svg]:inline"
                readonly={hasFeedback}
                onClick={(rate) => {
                  setRate(rate)
                }}
                initialValue={rate}
              />
              <div className="h-16 mt-2">
                {hasFeedback ? (
                  <small>Danke für dein Feedback &#10084;</small>
                ) : (
                  <small>
                    {rate > 0 ? (
                      <button
                        className="underline text-blue-600 hover:text-blue-700"
                        onClick={() => {
                          submit_event(
                            `rate_quest_${core.ws.quest.id}_${rate}`,
                            core
                          )
                          setHasFeedback(true)
                        }}
                      >
                        Abschicken
                      </button>
                    ) : (
                      <>&nbsp;</>
                    )}
                  </small>
                )}
              </div>
            </>
          ) :*/ <div className="h-12"></div>
          }
          <div className={clsx('px-12 flex w-full mb-12', 'justify-between')}>
            {core.ws.page !== 'shared' ? (
              <>
                <button
                  className="underline text-gray-700 hover:text-black"
                  onClick={() => {
                    finishQuest(core, true)
                    closeModal(core)
                  }}
                >
                  {core.strings.ide.stay}
                </button>
                <button
                  onClick={() => {
                    finishQuest(core)
                    closeModal(core)
                  }}
                  className={clsx(
                    'px-4 py-2 rounded hover:bg-green-300 inline-block',
                    'bg-green-200 text-lg'
                  )}
                >
                  {core.strings.ide.exit}
                </button>
              </>
            ) : (
              <>
                <span></span>
                <button
                  onClick={() => {
                    finishQuest(core, true)
                    closeModal(core)
                  }}
                  className={clsx(
                    'px-4 py-2 rounded hover:bg-green-300 inline-block',
                    'bg-green-200 text-lg'
                  )}
                >
                  OK
                </button>
                <span></span>
              </>
            )}
          </div>
          {core.ws.quest.id < 0 && (
            <div className="mb-6">
              <button
                className="text-gray-700 hover:text-black hover:bg-gray-100 px-2 py-0.5 rounded"
                onClick={() => {
                  saveCodeToFile(core)
                }}
              >
                <FaIcon icon={faDownload} className="mr-1" /> Programmcode
                speichern
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
