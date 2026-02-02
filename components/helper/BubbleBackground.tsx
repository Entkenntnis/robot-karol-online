import { useMemo } from 'react'
import clsx from 'clsx'

interface BubbleBackgroundProps {
  bubbleCount?: number
  className?: string
}

export function BubbleBackground({
  bubbleCount = 37,
  className = '',
}: BubbleBackgroundProps) {
  // Memoize background bubbles to prevent regeneration on re-render
  const backgroundBubbles = useMemo(() => {
    return Array.from({ length: bubbleCount }).map((_, i) => ({
      id: i,
      size: Math.random() * 150 + 20,
      left: Math.random() * 100,
      top: Math.random() * 100 + 50,
      delay: Math.random() * 8,
      duration: Math.random() * 8 + 5,
    }))
  }, [bubbleCount]) // Only regenerate if bubbleCount changes

  return (
    <div
      className={clsx(
        'absolute inset-0 overflow-hidden pointer-events-none',
        className,
      )}
    >
      {backgroundBubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full bg-white/10 animate-bubble"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            top: `${bubble.top}%`,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
