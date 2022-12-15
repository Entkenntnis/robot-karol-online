import Head from 'next/head'
import { useEffect } from 'react'
import clsx from 'clsx'

import { useCore } from '../lib/state/core'
import { Menu } from './Menu'
import { Workspace } from './Workspace'
import { openMenu } from '../lib/commands/menu'
import { deserialize } from '../lib/commands/json'
import { submit_event } from '../lib/stats/submit'
import { loadProject } from '../lib/commands/load'
import { Ping } from './Ping'
import { FileInput } from './FileInput'
import { Quest } from './Quest'

export function App() {
  const core = useCore()

  useEffect(() => {
    submit_event('visit', core)
    void loadProject(core)
  }, [core])

  return (
    <>
      <Head>
        <title>{getTitle()}</title>
      </Head>
      <div className="w-full h-full min-w-[900px] relative overflow-hidden">
        <Quest />
      </div>
    </>
  )

  function getTitle() {
    if (core.state.projectTitle) {
      return `${core.state.projectTitle} - Robot Karol Quest`
    } else {
      return 'Robot Karol Quest'
    }
  }
}
