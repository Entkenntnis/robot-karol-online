import { useCore } from '../lib/state/core'
import { Quest } from './pages/Quest'
import { Overview } from './pages/Overview'
import { Editor } from './pages/Editor'
import { Highscore } from './pages/Highscore'
import { Imported } from './pages/Imported'
import { Init } from './pages/Init'
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
import { GoodLuckModal } from './modals/GoodLuckModal'
import ErrorBoundary from './ErrorBoundary'
import { GoodLuck } from './pages/GoodLuck_internal'
import { Inspiration } from './pages/Inspiration'

export function App() {
  const core = useCore()

  return (
    <ErrorBoundary>
      {renderPage()}
      {renderModal()}
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
      return <Init />
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
    } else if (core.ws.page == 'goodluck_internal') {
      return <GoodLuck />
    } else if (core.ws.page == 'inspiration') {
      return <Inspiration />
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
    } else if (core.ws.modal == 'goodluck') {
      return <GoodLuckModal />
    } else {
      return null
    }
  }
}
