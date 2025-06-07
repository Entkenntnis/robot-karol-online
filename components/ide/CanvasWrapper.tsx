import clsx from 'clsx'
import { sliderToDelay } from '../../lib/helper/speedSlider'
import { useCore } from '../../lib/state/core'
import { View } from '../helper/View'
import { View2D } from '../helper/View2D'
import { World } from '../../lib/state/types'
import { CanvasObjects } from '../../lib/state/canvas-objects'

export interface CanvasWrapperProps {
  preview?: { world: World }
}

export function CanvasWrapper({ preview }: CanvasWrapperProps) {
  const core = useCore()
  const co = CanvasObjects.useState((s) => s)
  return core.ws.ui.show2D ? (
    <View2D
      world={core.ws.world}
      preview={preview}
      className={clsx(
        'p-6',
        core.ws.ui.karolCrashMessage && 'border-4 border-red-300'
      )}
      canvas={core.ws.canvas}
    />
  ) : (
    <View
      world={core.ws.world}
      preview={preview}
      className={clsx(
        'p-6',
        core.ws.ui.karolCrashMessage && 'border-4 border-red-300'
      )}
      robotImageDataUrl={core.ws.robotImageDataUrl}
      animationDuration={
        core.ws.canvas.manualControl
          ? undefined
          : Math.min(200, sliderToDelay(core.ws.ui.speedSliderValue))
      }
      activeRobot={core.ws.__activeRobot}
      canvas={core.ws.canvas}
      co={co}
    />
  )
}
