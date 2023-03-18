import Head from 'next/head'

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

export function App() {
  const core = useCore()

  return (
    <>
      <Head>
        <title>
          {core.ws.page == 'editor' ? 'Editor ' : 'Robot Karol Online'}
        </title>
        <meta
          name="description"
          content="Der zeitlose Klassiker für den spielerischen Einstieg in die Programmierung."
        />
      </Head>
      {renderPage()}
      {renderModal()}
    </>
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
    } else {
      return null
    }
  }
}
