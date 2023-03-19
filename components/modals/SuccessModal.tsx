import { faCircleCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { closeModal } from '../../lib/commands/modal'
import { setUserName } from '../../lib/commands/mode'
import { switchToPage } from '../../lib/commands/page'
import { finishQuest } from '../../lib/commands/quest'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import confetti from 'canvas-confetti'
import { positiveText } from '../../lib/helper/positiveText'

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
  const [positive] = useState(positiveText())

  // closeModal(core)
  // switchToPage(core, 'overview')

  useEffect(() => {
    realisticLook()
  }, [])

  return (
    <>
      <div className="bg-black/20 fixed inset-0 z-[150]"></div>
      <div className="fixed inset-0 flex justify-center items-center z-[200]">
        <div
          className="h-[280px] w-[500px] bg-white z-[200] rounded-xl relative flex items-center justify-between flex-col"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <h1 className="mt-12 text-4xl">{positive}</h1>
          <button
            onClick={() => {
              finishQuest(core)
              closeModal(core)
            }}
            className={clsx(
              'px-2 py-0.5 rounded hover:bg-green-300',
              'bg-green-200 mx-auto mb-16'
            )}
          >
            weiter
          </button>
        </div>
      </div>
    </>
  )
}
