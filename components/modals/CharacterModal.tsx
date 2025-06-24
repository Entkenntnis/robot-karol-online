import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { closeModal } from '../../lib/commands/modal'
import {
  amongay,
  karolDefaultImage,
  karolOldDefaultImage,
} from '../../lib/data/images'
import { useCore } from '../../lib/state/core'
import { setRobotImage } from '../../lib/storage/storage'
import { View } from '../helper/View'

export function CharacterModal() {
  const core = useCore()
  return (
    <div className="bg-black/20 fixed inset-0 flex justify-center items-center z-[150]">
      <div
        className="sm:w-[500px] w-full mx-3 bg-gradient-to-br from-yellow-50 to-yellow-100 z-[200] rounded-xl relative mb-[30vh] sm:mb-[10vh] border-2 border-yellow-300 shadow-lg overflow-hidden p-4"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className="py-3">
          <h2 className="text-yellow-800 font-bold">Wähle deine Figur:</h2>
          <div className="flex justify-around my-10">
            <View
              onClick={() => {
                submit(karolDefaultImage)
                submitAnalyzeEvent(core, 'ev_click_character_karol')
              }}
              robotImageDataUrl={karolDefaultImage}
              world={{
                dimX: 1,
                dimY: 1,
                karol: [
                  {
                    x: 0,
                    y: 0,
                    dir: 'east',
                  },
                ],
                blocks: [[false]],
                marks: [[false]],
                bricks: [[0]],
                height: 1,
              }}
              hideWorld
              className="border-2 border-gray-800 rounded px-3 pb-2 bg-white hover:border-yellow-500 cursor-pointer hover:bg-yellow-200"
            />
            <View
              onClick={() => {
                submit(amongay)
                submitAnalyzeEvent(core, 'ev_click_character_amongay')
              }}
              robotImageDataUrl={amongay}
              world={{
                dimX: 1,
                dimY: 1,
                karol: [
                  {
                    x: 0,
                    y: 0,
                    dir: 'east',
                  },
                ],
                blocks: [[false]],
                marks: [[false]],
                bricks: [[0]],
                height: 1,
              }}
              hideWorld
              className="amongay border-2 border-gray-800 rounded px-3 pb-2 bg-white hover:border-yellow-500 cursor-pointer hover:bg-yellow-200"
            />
            <View
              onClick={() => {
                submit(karolOldDefaultImage)
                submitAnalyzeEvent(core, 'ev_click_character_emma')
              }}
              robotImageDataUrl={karolOldDefaultImage}
              world={{
                dimX: 1,
                dimY: 1,
                karol: [
                  {
                    x: 0,
                    y: 0,
                    dir: 'east',
                  },
                ],
                blocks: [[false]],
                marks: [[false]],
                bricks: [[0]],
                height: 1,
              }}
              hideWorld
              className="border-2 border-gray-800 rounded px-3 pb-2 bg-white hover:border-yellow-500 cursor-pointer hover:bg-yellow-200"
            />
          </div>
          <p className="text-sm italic text-center mt-4">
            In der Figuren-Galerie findest du viele weitere Figuren.
          </p>
        </div>
      </div>
    </div>
  )

  function submit(image: string) {
    core.mutateWs((ws) => {
      ws.ui.tourModePage = 1
      ws.robotImageDataUrl = image
    })
    setRobotImage(image)
    closeModal(core)
  }
}
