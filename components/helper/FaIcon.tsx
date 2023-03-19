import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { CSSProperties } from 'react'

interface FaIconProps {
  icon: IconDefinition
  className?: string
  style?: CSSProperties
}

export function FaIcon({ icon, className, style }: FaIconProps) {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        viewBox={`0 0 ${icon.icon[0]} ${icon.icon[1]}`}
        aria-hidden
        focusable={false}
        className={clsx('fa-icon', className)}
        style={style}
      >
        <path
          fill="currentColor"
          d={Array.isArray(icon.icon[4]) ? icon.icon[4][0] : icon.icon[4]}
        ></path>
      </svg>
      <style jsx global>{`
        .fa-icon {
          display: inline-block;
          overflow: visible;
          height: 1em;
          vertical-align: -0.125em;
        }
      `}</style>
    </>
  )
}
