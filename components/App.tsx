import { useCore } from '../lib/state/core'
import { Quest } from './pages/Quest'
import { Overview } from './pages/Overview'
import { Editor } from './pages/Editor'
import { Highscore } from './pages/Highscore'
import { Imported } from './pages/Imported'
import { Shared } from './pages/Shared'
import { ErrorModal } from './modals/ErrorModal'
import { ImpressumModal } from './modals/ImpressumModal'
import { LightboxModal } from './modals/LightboxModal'
import { NameModal } from './modals/NameModal'
import { PrivacyModal } from './modals/PrivacyModal'
import { RemixModal } from './modals/RemixModal'
import { ResizeWorldModal } from './modals/ResizeWorldModal'
import { ShareModal } from './modals/ShareModal'
import { Analyze } from './pages/Analyze'
import { Demo } from './pages/Demo'
import { SuccessModal } from './modals/SuccessModal'
import { AppearanceModal } from './modals/AppearanceModal'
import { TutorialModal } from './modals/TutorialModal'
import ErrorBoundary from './ErrorBoundary'
import { Inspiration } from './pages/Inspiration'
import { SyncModal } from './modals/SyncModal'
import { SurveyModal } from './modals/SurveyModal'
import { InspirationOld } from './pages/InspirationOld'
import { PyodideWorker } from './ide/PyodideWorker'
import { useEffect, useRef } from 'react'
import { hydrateFromHash } from '../lib/commands/router'
import { LoadingScreen } from './helper/LoadingScreen'
import { submitAnalyzeEvent } from '../lib/commands/analyze'
import { setLockToKarolCode } from '../lib/storage/storage'
import { Karolmania } from './pages/Karolmania'

export function App() {
  const core = useCore()

  useEffect(() => {
    function onHashChange() {
      console.log('Hash change')
      hydrateFromHash(core)
    }

    window.addEventListener('hashchange', onHashChange)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [core])

  // ok, not good, but prevent react double rendering to call hydrate twice
  const currentlyHydrating = useRef<boolean>(false)

  useEffect(() => {
    async function hydrate() {
      currentlyHydrating.current = true
      await hydrateFromHash(core)
      currentlyHydrating.current = false
    }

    // take care of search parameters here

    const parameterList = new URLSearchParams(window.location.search)

    const code = parameterList.get('code')
    if (code) {
      setLockToKarolCode()
      window.open('/', '_self')
      return
    }

    const id = parameterList.get('id')

    if (id) {
      if (id == 'Z9xO1rVGj') {
        submitAnalyzeEvent(core, 'ev_show_playgroundLegacyLink')
        window.open('/#SPIELWIESE', '_self')
        return
      }
      window.open('/#LEGACY:' + id, '_self')
      return
    }

    if (!currentlyHydrating.current) hydrate()
  }, [core])

  return (
    <ErrorBoundary>
      {renderPage()}
      {renderModal()}
      {core.ws.settings.mode == 'code' &&
        core.ws.settings.language == 'python-pro' && <PyodideWorker />}
    </ErrorBoundary>
  )

  function renderPage() {
    if (core.ws.page == 'editor') {
      return <Editor />
    } else if (core.ws.page == 'highscore') {
      return <Highscore />
    } else if (core.ws.page == 'imported') {
      return <Imported />
    } else if (core.ws.page == 'init') {
      return <LoadingScreen />
    } else if (core.ws.page == 'overview') {
      return <Overview />
    } else if (core.ws.page == 'quest') {
      return <Quest />
    } else if (core.ws.page == 'shared') {
      return <Shared />
    } else if (core.ws.page == 'analyze') {
      return <Analyze />
    } else if (core.ws.page == 'demo') {
      return <Demo />
    } else if (core.ws.page == 'inspiration') {
      return <Inspiration />
    } else if (core.ws.page == 'inspiration-old') {
      return <InspirationOld />
    } else if (core.ws.page == 'karolmania') {
      return <Karolmania />
    } else {
      return null
    }
  }

  function renderModal() {
    if (core.ws.modal == 'error') {
      return <ErrorModal />
    } else if (core.ws.modal == 'impressum') {
      return <ImpressumModal />
    } else if (core.ws.modal == 'lightbox') {
      return <LightboxModal />
    } else if (core.ws.modal == 'name') {
      return <NameModal />
    } else if (core.ws.modal == 'privacy') {
      return <PrivacyModal />
    } else if (core.ws.modal == 'remix') {
      return <RemixModal />
    } else if (core.ws.modal == 'resize') {
      return <ResizeWorldModal />
    } else if (core.ws.modal == 'share') {
      return <ShareModal />
    } else if (core.ws.modal == 'success') {
      return <SuccessModal />
    } else if (core.ws.modal == 'appearance') {
      return <AppearanceModal />
    } else if (core.ws.modal == 'tutorial') {
      return <TutorialModal />
    } else if (core.ws.modal == 'sync') {
      return <SyncModal />
    } else if (core.ws.modal == 'survey') {
      return <SurveyModal />
    } else {
      return null
    }
  }
}
