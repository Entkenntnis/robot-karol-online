import clsx from 'clsx'
import { FaIcon } from './FaIcon'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { View } from './View'
import { useCore } from '../../lib/state/core'
import { Heading } from '../../lib/state/types'

interface QuestIconProps {
  title: string
  x: number
  y: number
  solved: boolean
  dir?: Heading
  onClick: () => void
}

export function QuestIcon({
  title,
  x,
  y,
  solved,
  onClick,
  dir,
}: QuestIconProps) {
  const core = useCore()
  return (
    <div
      className={clsx(
        'flex items-center flex-col w-[64px] cursor-pointer group absolute pointer-events-none',
        solved && 'pt-5'
      )}
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={onClick}
      key={title}
    >
      <button className="text-lg bg-gray-100/70 px-1 py-0.5 rounded group-hover:bg-white/80 pointer-events-auto whitespace-nowrap -ml-2">
        {title}
      </button>
      {solved ? (
        <div className="w-16 pt-3 flex justify-center items-center">
          <div className="bg-green-100 rounded-full w-6 h-6 pointer-events-auto mr-3">
            <FaIcon icon={faCheck} className="ml-[5px] text-green-500" />
          </div>
        </div>
      ) : (
        <View
          appearance={core.ws.appearance}
          world={{
            dimX: 1,
            dimY: 1,
            karol: {
              x: 0,
              y: 0,
              dir: dir ?? 'east',
            },
            blocks: [[false]],
            marks: [[false]],
            bricks: [[0]],
            height: 1,
          }}
          hideWorld
          className="pointer-events-auto -mt-2"
        />
      )}
    </div>
  )
}
