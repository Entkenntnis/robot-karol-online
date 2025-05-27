import { useState, useEffect, useRef } from 'react'

interface AnimateInViewProps {
  children: React.ReactNode
  dontFade?: boolean
  dontRenderHidden?: boolean
}

export function AnimateInView({
  children,
  dontFade = false,
  dontRenderHidden = false,
}: AnimateInViewProps) {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    if (ref.current) observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  if (dontFade) return children

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${
        isInView ? 'animate-fadeInUp' : 'opacity-0 translate-y-1'
      }`}
    >
      {dontRenderHidden ? null : children}
    </div>
  )
}
