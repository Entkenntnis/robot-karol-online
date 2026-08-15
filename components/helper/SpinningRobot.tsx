import { robotGalleryPreview } from '../../lib/data/images'
import { View } from './View'

export function SpinningRobot() {
  return (
    <View
      robotImageDataUrl={robotGalleryPreview}
      world={{
        dimX: 1,
        dimY: 1,
        karol: {
          x: 0,
          y: 0,
          dir: 'east',
        },
        blocks: [[false]],
        marks: [[false]],
        bricks: [[0]],
        height: 1,
      }}
      hideWorld
      className={`inline-block h-8 mr-1.5 -mt-2 transition-opacity ease-in-out duration-1000`}
    />
  )
}
