import { useProject } from '../lib/model'
import { View } from './View'

export function Player() {
  const { project, controller } = useProject()

  return (
    <div
      onKeyDown={(e) => {
        if (e.code == 'ArrowLeft') {
          controller.left()
          e.preventDefault()
        }
        if (e.code == 'ArrowRight') {
          controller.right()
          e.preventDefault()
        }
        if (e.code == 'ArrowUp') {
          controller.forward()
          e.preventDefault()
        }
        if (e.code == 'ArrowDown') {
          controller.back()
          e.preventDefault()
        }
        if (e.code == 'KeyM') {
          controller.mark()
          e.preventDefault()
        }
        if (e.code == 'KeyH') {
          controller.brick()
          e.preventDefault()
        }
        if (e.code == 'KeyQ') {
          controller.block(project.world)
          controller.block(project.world)
          e.preventDefault()
        }
        if (e.code == 'KeyA') {
          controller.unbrick()
          e.preventDefault()
        }
      }}
      tabIndex={1}
      className="focus:border-green-200 border-white border-2 mb-32 mt-12 w-max h-max mx-auto"
    >
      <View world={project.world} />
    </div>
  )
}
