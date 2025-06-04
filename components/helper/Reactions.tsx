import { useState, useRef, useEffect } from 'react'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from './FaIcon'
import { io } from 'socket.io-client'
import { getUserId } from '../../lib/storage/storage'
import clsx from 'clsx'
import { backend } from '../../backend'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { useCore } from '../../lib/state/core'

export function Reactions() {
  const [hearts, setHearts] = useState<
    Array<{
      id: string
      x: number
      y: number
      velocityX: number
      velocityY: number
      ts: number
    }>
  >([])
  const heartsRef = useRef(hearts)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const animationFrameRef = useRef<number>(0)
  const [numberOnline, setNumberOnline] = useState(0)

  const socket = useRef<ReturnType<typeof io> | null>(null)

  const core = useCore()

  // Inside your component
  useEffect(() => {
    socket.current = io(
      backend.host.includes('localhost')
        ? backend.host
        : 'https://karol.arrrg.de',
      {
        auth: { userId: getUserId() },
        path: backend.host.includes('localhost') ? '' : '/backend/socket.io',
      }
    )

    socket.current.on('updateOnlineCount', (count: number) => {
      setNumberOnline(count)
    })
    socket.current.on('spawnHeart', () => {
      spawnHeart()
    })

    // Add ping interval
    const pingInterval = setInterval(() => {
      socket.current?.emit('ping')
    }, 60000) // 60 seconds

    return () => {
      clearInterval(pingInterval) // Cleanup interval
      socket.current?.disconnect()
    }
  }, [])

  // Sync heartsRef with state
  useEffect(() => {
    heartsRef.current = hearts
  }, [hearts])

  const spawnHeart = () => {
    if (!containerRef.current || !buttonRef.current) return

    // Calculate button center position relative to container
    const containerRect = containerRef.current.getBoundingClientRect()
    const buttonRect = buttonRef.current.getBoundingClientRect()
    const x = buttonRect.left - containerRect.left + buttonRect.width / 2
    const y = buttonRect.top - containerRect.top + buttonRect.height / 2

    // Calculate initial velocity with random variation
    const targetX = 0
    const targetY = 0
    const dx = targetX - x
    const dy = targetY - y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance === 0) return

    const speed = 3
    const baseVelX = (dx / distance) * speed
    const baseVelY = (dy / distance) * speed
    const angleVariation = Math.PI / 6
    const randomAngle = (Math.random() - 0.5) * angleVariation

    const velocityX =
      baseVelX * Math.cos(randomAngle) - baseVelY * Math.sin(randomAngle)
    const velocityY =
      baseVelX * Math.sin(randomAngle) + baseVelY * Math.cos(randomAngle)

    // Add new heart to state
    setHearts((prev) => [
      ...(prev.length < 50 ? prev : prev.slice(1)), // Limit to 50 hearts
      {
        id: Date.now() + '-' + Math.random(),
        x,
        y,
        velocityX,
        velocityY,
        ts: Date.now(),
      },
    ])
  }

  // Animation loop
  const animate = () => {
    const currentHearts = heartsRef.current.map((heart) => ({ ...heart }))
    const newHearts = currentHearts
      .map((heart) => {
        const newX = heart.x + heart.velocityX
        const newY = heart.y + heart.velocityY

        return {
          ...heart,
          x: newX,
          y: newY,
          shouldRemove:
            newX < 100 ||
            newY < 100 ||
            newX > 300 ||
            newY > 300 ||
            Date.now() - heart.ts > 2000, // Remove if outside bounds or too old
        }
      })
      .filter((heart) => !heart.shouldRemove)

    if (newHearts.length !== currentHearts.length) {
      setHearts(newHearts)
    } else {
      const hasChanged = newHearts.some(
        (h, i) => h.x !== currentHearts[i].x || h.y !== currentHearts[i].y
      )
      if (hasChanged) setHearts(newHearts)
    }

    heartsRef.current = newHearts
    animationFrameRef.current = requestAnimationFrame(animate)
  }

  // Start/stop animation loop
  useEffect(() => {
    if (hearts.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hearts.length])

  return (
    <div
      ref={containerRef}
      className="h-[300px] w-[300px] relative pointer-events-none"
    >
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute transition-none"
          style={{
            left: `${heart.x}px`,
            top: `${heart.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <FaIcon
            icon={faHeart}
            className="text-red-500 text-lg animate-pulse"
          />
        </div>
      ))}

      <div className="absolute bottom-3 right-3">
        <button
          ref={buttonRef}
          onClick={() => {
            submitAnalyzeEvent(core, 'ev_click_landing_spawnHeart')
            socket.current?.emit('spawnHeart')
          }}
          className="mx-auto w-11 h-11 border-red-400 border-2 rounded-full flex items-center justify-center bg-red-50 hover:bg-red-100 transition-colors pointer-events-auto"
        >
          <FaIcon icon={faHeart} className="text-red-500 text-lg" />
        </button>
        <p
          className={clsx(
            'text-sm text-gray-600',
            numberOnline == 0 && 'invisible'
          )}
        >
          {numberOnline} online
        </p>
      </div>
    </div>
  )
}
