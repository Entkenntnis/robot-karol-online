import { robotGalleryPreview } from '../../lib/data/images'
import { View } from './View'
import { useState, useEffect } from 'react'

// AI generated sloppy code, why is it soo convoluted?

export function SpinningRobot() {
  // Define the sequence of directions for the spin
  const directions = ['east', 'south', 'west', 'north'] as const

  // Use state to hold the current direction, starting with the first in the sequence
  const [currentDir, setCurrentDir] = useState<(typeof directions)[number]>(
    directions[0]
  )
  // Add a new state to control the opacity for the fade effect
  const [isFading, setIsFading] = useState(false)

  // Use an effect to set up a timer that updates the direction
  useEffect(() => {
    const intervalId = setInterval(() => {
      // 1. Start the fade-out
      setIsFading(true)

      // 2. After the fade-out animation duration, swap the image and fade back in.
      // The duration here (150ms) should match the Tailwind `duration-150` class.
      setTimeout(() => {
        // Update the direction to the next one in the sequence
        setCurrentDir((prevDir) => {
          const currentIndex = directions.indexOf(prevDir)
          // Use the modulo operator to loop back to the start of the array
          const nextIndex = (currentIndex + 1) % directions.length
          return directions[nextIndex]
        })
        // 3. Start the fade-in with the new image
        setIsFading(false)
      }, 900)
    }, 5000)

    // Clean up the interval when the component is unmounted to prevent memory leaks
    return () => clearInterval(intervalId)
  }, []) // The empty dependency array ensures this effect runs only once on mount

  return (
    <View
      robotImageDataUrl={robotGalleryPreview}
      world={{
        dimX: 1,
        dimY: 1,
        karol: [
          {
            x: 0,
            y: 0,
            // Use the state variable for the robot's direction
            dir: currentDir,
          },
        ],
        blocks: [[false]],
        marks: [[false]],
        bricks: [[0]],
        height: 1,
      }}
      hideWorld
      // Apply Tailwind classes for a smooth fade transition
      className={`inline-block h-8 mr-1.5 -mt-2 transition-opacity ease-in-out duration-1000 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    />
  )
}
