import { useCore } from '../lib/state/core'
import { Quest } from './pages/Quest'
import { Overview } from './pages/Overview'
import { Editor } from './pages/Editor'
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
import { Demo } from './pages/Demo'
import { SuccessModal } from './modals/SuccessModal'
import { AppearanceModal } from './modals/AppearanceModal'
import { TutorialModal } from './modals/TutorialModal'
import ErrorBoundary from './ErrorBoundary'
import { Inspiration } from './pages/Inspiration'
import { SyncModal } from './modals/SyncModal'
import { SurveyModal } from './modals/SurveyModal'
import { PyodideWorker } from './ide/PyodideWorker'
import { useEffect, useRef } from 'react'
import { hydrate, navigate } from '../lib/commands/router'
import { LoadingScreen } from './helper/LoadingScreen'
import { Karolmania } from './pages/Karolmania'
import { KarolmaniaGame } from './pages/KarolmaniaGame'
import { ExplanationModal } from './modals/ExplanationModal'
import { CharacterModal } from './modals/CharacterModal'
import { ChatGuide } from './modals/ChatGuide'
import { PythonListing } from './modals/PythonListing'
import { PythonPath } from './pages/PythonPath'
import { Flightdeck } from './pages/Flightdeck'
import { Spielwiese } from './pages/Spielwiese'

export function App() {
  const core = useCore()

  useEffect(() => {
    function rehydrate() {
      hydrate(core)
    }

    // @ts-ignore TESTING
    window.nav = function (url) {
      navigate(core, url)
    }

    window.addEventListener('popstate', rehydrate)
    return () => {
      window.removeEventListener('popstate', rehydrate)
    }
  }, [core])

  // ok, not good, but prevents react double rendering to call hydrate twice
  const currentlyHydrating = useRef<boolean>(false)

  useEffect(() => {
    async function hydrate_debounced() {
      currentlyHydrating.current = true
      await hydrate(core)
      currentlyHydrating.current = false
    }

    if (!currentlyHydrating.current) hydrate_debounced()
  }, [core])

  return (
    <ErrorBoundary>
      {renderPage()}
      {renderModal()}
      {core.ws.settings.mode == 'code' &&
        core.ws.settings.language == 'python' && <PyodideWorker />}
    </ErrorBoundary>
  )

  function renderPage() {
    if (core.ws.page == 'editor') {
      return <Editor />
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
    } else if (core.ws.page == 'demo') {
      return <Demo />
    } else if (core.ws.page == 'inspiration') {
      return <Inspiration />
    } else if (core.ws.page == 'karolmania') {
      return <Karolmania />
    } else if (core.ws.page == 'karolmania-game') {
      return <KarolmaniaGame />
    } else if (core.ws.page == 'python-path') {
      return <PythonPath />
    } else if (core.ws.page == 'flightdeck') {
      return <Flightdeck />
    } else if (core.ws.page == 'spielwiese') {
      return <Spielwiese />
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
    } else if (core.ws.modal == 'explanation') {
      return <ExplanationModal />
    } else if (core.ws.modal == 'character') {
      return <CharacterModal />
    } else if (core.ws.modal == 'chat-guide') {
      return <ChatGuide />
    } else if (core.ws.modal == 'python-listing') {
      return <PythonListing />
    } else {
      return null
    }
  }
}
