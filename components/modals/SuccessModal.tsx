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
import { def } from '../../lib/codemirror/pythonParser/parser.terms'

async function shapeFromImage(imageData: {
  x?: number
  y?: number
  width?: number
  height?: number
  src: string
  scalar: number
}) {
  const { src, scalar = 1 } = imageData
  const scale = 1 / scalar

  const img = new Image()
  img.src = src

  await new Promise((res) => img.addEventListener('load', res))

  const size = 10 * scalar

  const sx = imageData.x ?? 0
  const sy = imageData.y ?? 0
  const sWidth = imageData.width ?? img.naturalWidth
  const sHeight = imageData.height ?? img.naturalHeight

  const x = 0
  const y = 0
  const width = size
  const height = (size * sHeight) / sWidth

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, width, height)

  return {
    type: 'bitmap',
    bitmap: canvas.transferToImageBitmap(),
    // copied from `shapeFromText`
    matrix: [scale, 0, 0, scale, (-width * scale) / 2, (-height * scale) / 2],
  }
}

var count = 200
var defaults: any = {
  origin: { y: 0.7 },
  zIndex: 170,
}

async function initShapes() {
  const shapeZiegel = await shapeFromImage({
    src: 'data:image/png;base64,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',
    scalar: 1,
  })
  const shapeMarke = await shapeFromImage({
    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAfCAYAAACYn/8/AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAjUlEQVRYhe3WOwrDUAxE0Tsm+9+y3LgwJomfZdAHdHvBKVSMzIyObdkAbwOPbuDRDTy6gUc38OgGHl1b+OfNsaS0TeyGS0qZ8hKYmVyvko0Gx49XQMNDeBU0PIBXQsMivBoaFuAV0XADr4qGP/DKaPgBr46GL/AOaLjAu6DhBO+EhgPeDQ0gIG2aetEAO3ZYXD0u46/jAAAAAElFTkSuQmCC',
    scalar: 1,
  })
  const hatShape = await shapeFromImage({
    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAQCAYAAAAFzx/vAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAuElEQVQ4y92UwQoCIRCG/xG7FIXLtnQPOnQJfAVfwAftYXykbSawTNhA3Tz0wyge9Jt/hB/OOdyuF0zHEYMxOOx3OE0jNnoL7z1Yc1ostBTxMvBDUobrTER3JLLWpkeEEJ473yNUSIDvA9GcA5ZUC34BS2A5uASqWmBx5HK/CNiqEqhqcVcjvdZD31ymf6zX7H5pUtJIhKoeY0zdK3RWN2B0qWS2MTX+ymFMpOZoK83cD+AvnOU5+wBSu4Npm+U5hAAAAABJRU5ErkJggg==',
    scalar: 1,
  })
  defaults.shapes = [shapeZiegel, shapeMarke, hatShape]
}

if (typeof window !== 'undefined') {
  initShapes()
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
          <h1 className="mt-10 text-4xl mb-4">
            {core.ws.page !== 'shared' ? (
              <>🎉 {positive}</>
            ) : (
              <>🎉{positive.replace('!', '')}</>
            )}
          </h1>
          <div className="text-sm text-gray-600">
            Aufgabe gelöst in{' '}
            {core.ws.vm.functionEvaluation == 1
              ? 'einem Schritt'
              : `${core.ws.vm.functionEvaluation} Schritten`}
          </div>
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
            {core.ws.page !== 'shared' && core.ws.page !== 'editor' ? (
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
                  Yay!
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
