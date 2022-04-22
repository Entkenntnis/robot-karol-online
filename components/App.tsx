import Head from 'next/head'
import { useEffect } from 'react'
import clsx from 'clsx'

import { CoreProvider, useCreateCore } from '../lib/state/core'
import { Research } from './Research'
import { Workspace } from './Workspace'
import {
  hideResearchCenter,
  showResearchCenter,
} from '../lib/commands/researchCenter'
import { deserialize } from '../lib/commands/json'

export function App() {
  const core = useCreateCore()

  useEffect(() => {
    const address = window.location.search

    // Returns a URLSearchParams object instance
    const parameterList = new URLSearchParams(address)

    const file = parameterList.get('project')

    if (file && core.ws.type == 'free') {
      try {
        ;(async () => {
          const res = await fetch(file)
          const text = await res.text()
          deserialize(core, text)
        })()
      } catch (e) {}
    }
  }, [core])

  return (
    <>
      <Head>
        <title>Robot Karol Web</title>
      </Head>
      <style jsx global>
        {`
          body,
          html,
          #__next {
            height: 100%;
          }
        `}
      </style>
      <CoreProvider value={core}>
        <div className="w-full h-full  min-w-[900px] flex flex-col relative">
          <input
            type="file"
            id="load_project"
            multiple={false}
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const fr = new FileReader()

              const files = e.target.files

              if (files) {
                fr.readAsText(files[0])

                fr.onload = () => {
                  deserialize(core, fr.result?.toString())
                }
              }
            }}
          />
          {!core.state.showResearchCenter && (
            <button
              className={clsx(
                'absolute right-1 top-1 rounded z-10',
                'px-2 py-0.5 bg-blue-300 hover:bg-blue-400'
              )}
              onClick={() => {
                core.state.showResearchCenter
                  ? hideResearchCenter(core)
                  : showResearchCenter(core)
              }}
            >
              Forschungszentrum
            </button>
          )}
          {core.state.showResearchCenter ? <Research /> : <Workspace />}
        </div>
      </CoreProvider>
    </>
  )
}
