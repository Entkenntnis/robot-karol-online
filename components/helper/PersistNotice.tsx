// AI-generated

import { useEffect, useRef, useState } from 'react'
import { FaIcon } from './FaIcon'
import { faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons'
import { isPersisted } from '../../lib/storage/storage'
import { setPersist } from '../../lib/commands/mode'
import { useCore } from '../../lib/state/core'

export function PersistNotice() {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const core = useCore()

  // On mount, respect session dismissal and animate in
  useEffect(() => {
    if (isPersisted()) {
      // already persisted, no need to show notice
      return
    }

    const dismissed =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('persistNoticeDismissed') === 'true'
    if (dismissed) return

    setMounted(true)
    setTimeout(() => {
      setPersist(core, true)
    }, 1000)
    // allow next paint to apply transition
    const id = window.setTimeout(() => setVisible(true), 10)

    // auto-dismiss after 20s
    closeTimer.current = window.setTimeout(() => handleClose(), 20000)

    return () => {
      window.clearTimeout(id)
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleClose() {
    // animate out
    setVisible(false)
    // keep in DOM for the duration of the transition
    window.setTimeout(() => {
      try {
        sessionStorage.setItem('persistNoticeDismissed', 'true')
      } catch {}
      setMounted(false)
    }, 1000)
  }

  if (!mounted) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center p-4 sm:p-6 pointer-events-none">
      <div
        role="status"
        aria-live="polite"
        className={[
          'pointer-events-auto max-w-xl w-full sm:w-auto',
          'relative rounded-xl bg-white/95 text-gray-900 shadow-md border border-gray-200',
          'transition-all duration-1000 ease-out',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        ].join(' ')}
      >
        <div className="flex items-start gap-3 px-4 py-3">
          <div className="shrink-0 mt-0.5" aria-hidden>
            <FaIcon icon={faInfoCircle} className="text-gray-500 text-[20px]" />
          </div>
          <div className="text-sm leading-5 pr-8">
            Wir speichern deinen Fortschritt automatisch auf diesem Gerät.
            <br />
            Verwalte deine Daten unter Selbst-Lern-Pfad &gt; Profil.
          </div>
          <button
            type="button"
            aria-label="Hinweis schließen"
            onClick={handleClose}
            className="absolute right-2 top-2 inline-flex items-center justify-center rounded-full h-7 w-7 bg-gray-200 hover:bg-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400/40 transition-colors"
          >
            <FaIcon icon={faTimes} className="text-[16px]" />
          </button>
        </div>
      </div>
    </div>
  )
}
