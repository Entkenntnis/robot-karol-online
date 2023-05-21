import { useEffect, useState } from 'react'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'
import { View } from '../helper/View'
import { Heading } from '../../lib/state/types'

export function AppearanceModal() {
  // const [selected, setSelected] = useState(-1)
  // const [code, setCode] = useState('')

  const [count, setCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => prevCount + 1)
    }, 750)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const core = useCore()
  return (
    <div
      className="bg-black/20 fixed inset-0 flex justify-center items-center z-[150]"
      onClick={() => {
        closeModal(core)
      }}
    >
      <div
        className="min-h-[400px] w-[600px] bg-white z-[200] rounded-xl relative flex justify-between flex-col px-3"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <h2 className="text-center font-bold text-xl mt-3">
          Passe das Aussehen von Karol an
        </h2>
        <div />
        <div className="flex justify-start">
          <div className="w-[200px] h-[200px] flex justify-center items-center">
            <View
              appearance={core.ws.appearance}
              world={{
                dimX: 1,
                dimY: 1,
                karol: {
                  x: 0,
                  y: 0,
                  dir: ['east', 'north', 'west', 'south'][count % 4] as Heading,
                },
                blocks: [[false]],
                marks: [[false]],
                bricks: [[0]],
                height: 1,
              }}
            />
          </div>
          <div className="[&>p]:mb-8 [&_select]:w-[200px] [&_select]:p-1">
            <p>
              Kappe:{' '}
              <select>
                <option>schwarz</option>
              </select>
            </p>
            <p>
              Shirt:{' '}
              <select>
                <option>rot</option>
              </select>
            </p>
            <p>
              Hose:{' '}
              <select>
                <option>blau</option>
              </select>
            </p>
            <p>
              Hautton:{' '}
              <select>
                <option>gelb</option>
              </select>
            </p>
          </div>
        </div>
        <p className="text-center mb-5">
          <button
            className="px-2 py-0.5 bg-green-200 hover:bg-green-300 rounded"
            onClick={() => {
              closeModal(core)
            }}
          >
            Schließen
          </button>
        </p>
      </div>
    </div>
  )
}
