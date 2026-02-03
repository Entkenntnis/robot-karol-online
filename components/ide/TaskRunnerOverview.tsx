import {
  faCheck,
  faCircle,
  faExclamationTriangle,
  faPersonWalking,
  faStop,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import { createRef, useEffect } from 'react'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'

export function TaskRunnerOverview() {
  const core = useCore()

  const currentIndex = core.ws.quest.lastStartedTask!

  const currentTask = createRef<HTMLDivElement>()

  useEffect(() => {
    if (currentTask.current)
      currentTask.current.scrollIntoView({ block: 'center' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  return (
    <div className="h-[42px] bg-gray-100 flex-row flex items-center gap-2">
      {core.ws.quest.tasks.map((_, index) => {
        return (
          <div
            key={index}
            ref={index == currentIndex ? currentTask : undefined}
          >
            <span className="w-9 inline-block">
              {(() => {
                if (
                  index < currentIndex ||
                  index === core.ws.quest.thisTaskIsAlreadyCompleted
                ) {
                  return <FaIcon icon={faCheck} className="text-green-500" />
                }
                if (index == currentIndex) {
                  if (core.ws.ui.state == 'running') {
                    return <FaIcon icon={faPersonWalking} />
                  }
                  if (core.ws.ui.karolCrashMessage) {
                    return (
                      <FaIcon
                        icon={faExclamationTriangle}
                        className="text-red-600"
                      />
                    )
                  }
                  if (core.ws.ui.isManualAbort) {
                    return <FaIcon icon={faStop} />
                  }
                  if (core.ws.ui.isEndOfRun) {
                    if (core.ws.quest.progress) {
                      return (
                        <FaIcon icon={faCheck} className="text-green-500" />
                      )
                    } else {
                      return <FaIcon icon={faTimes} className="text-red-500" />
                    }
                  }
                }
                return <FaIcon icon={faCircle} className="text-gray-300" />
              })()}
            </span>
          </div>
        )
      })}
    </div>
  )
}
