import { createSingleRobotWorld } from '../../lib/commands/robots'
import { robotGalleryPreview } from '../../lib/data/images'
import { View } from './View'

export function SpinningRobot() {
  return (
    <View
      robotImageDataUrl={robotGalleryPreview}
      world={createSingleRobotWorld('east')}
      hideWorld
      className={`inline-block h-8 mr-1.5 -mt-2 transition-opacity ease-in-out duration-1000`}
      externallyScaled
      lowQuality
    />
  )
}
