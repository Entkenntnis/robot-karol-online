import Head from 'next/head'
import { useEffect } from 'react'

import { useCore } from '../lib/state/core'
import { Quest } from './Quest'
import { Overview } from './Overview'
import { initClient } from '../lib/commands/init'

export function App() {
  const core = useCore()

  useEffect(() => {
    initClient(core)
  }, [core])

  return (
    <>
      <Head>
        <title>{core.ws.ui.isEditor ? 'Editor ' : 'Robot Karol Online'}</title>
        <meta
          name="description"
          content="Der zeitlose Klassiker für den spielerischen Einstieg in die Programmierung."
        />
      </Head>
      <div className="w-full h-full min-w-[900px] overflow-auto">
        {core.ws.ui.clientInitDone &&
          (core.ws.ui.showQuestOverview ? <Overview /> : <Quest />)}
      </div>
    </>
  )
}
