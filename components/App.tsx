import Head from 'next/head'

import { useEffect } from 'react'
import { Player } from './Player'
import { EditArea } from './EditArea'
import { CoreProvider, useCreateCore } from '../lib/core'
import { Research } from './Research'
import { Workspace } from './Workspace'
import clsx from 'clsx'

export function App() {
  const core = useCreateCore()

  useEffect(() => {
    const address = window.location.search

    // Returns a URLSearchParams object instance
    const parameterList = new URLSearchParams(address)

    const file = parameterList.get('project')

    if (file) {
      console.log(file)
      try {
        ;(async () => {
          const res = await fetch(file)
          const text = await res.text()
          //core.deserialize(text)
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
          <div className="h-8 flex justify-between items-center flex-shrink-0 bg-gray-200 hidden">
            <div className="h-full flex items-center">
              <h1 className="pl-4 hover:underline bg-red-700 text-white h-full pt-1 pr-4">
                <a
                  href="https://github.com/Entkenntnis/robot-karol-web"
                  target="_blank"
                  rel="noreferrer"
                >
                  Robot Karol Web
                </a>
              </h1>
              {core.state.ui.filename && (
                <div className="ml-2">
                  Datei: <strong>{core.state.ui.filename}</strong>
                </div>
              )}
            </div>
            <div>
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
                      //console.log(files[0].name)
                      //core.deserialize(fr.result?.toString(), files[0].name)
                    }
                  }
                }}
              />
              {/*<button
                className="mx-3 px-2 bg-green-300 rounded-2xl hover:bg-green-400 transition-colors"
                onClick={() => {
                  document.getElementById('load_project')?.click()
                }}
              >
                Projekt laden
              </button>
              <button
                className="mx-3 px-2 bg-blue-300 rounded-2xl hover:bg-blue-400 transition-colors"
                onClick={() => {
                  const filename = 'robot_karol.json'
                  const contentType = 'application/json;charset=utf-8;'
                  var a = document.createElement('a')
                  a.download = filename
                  a.href =
                    'data:' +
                    contentType +
                    ',' +
                    encodeURIComponent(JSON.stringify(core.serialize()))
                  a.target = '_blank'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                }}
              >
                Projekt speichern
              </button>*/}
            </div>
          </div>
          {!core.state.showResearchCenter && (
            <button
              className={clsx(
                'absolute right-1 top-1 rounded z-10',
                'px-2 py-0.5 bg-blue-300 hover:bg-blue-400'
              )}
              onClick={() => {
                core.state.showResearchCenter
                  ? core.hideResearchCenter()
                  : core.showResearchCenter()
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
