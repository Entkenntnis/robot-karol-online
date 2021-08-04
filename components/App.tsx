import Head from 'next/head'
import { useImmer } from 'use-immer'

import 'react-reflex/styles.css'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'
import { createContext, useContext, useMemo } from 'react'
import { Player } from './Player'
import { EditArea } from './EditArea'
import { CoreProvider, useCore, useCreateCore } from '../lib/core'

export function App() {
  const core = useCreateCore()

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
        <div className="w-full h-full  min-w-[900px] flex flex-col">
          <div className="h-8 flex justify-between items-center flex-shrink-0 bg-gray-200">
            <div className="h-full flex items-center">
              <h1 className="font-bold pl-4 hover:underline bg-yellow-400 h-full pt-1 pr-4">
                <a
                  href="https://github.com/Entkenntnis/robot-karol-web"
                  target="_blank"
                  rel="noreferrer"
                >
                  Robot Karol Web
                </a>
              </h1>
              {core.current.ui.filename && (
                <div className="ml-2">
                  Datei: <strong>{core.current.ui.filename}</strong>
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
                      console.log(files[0].name)
                      core.deserialize(fr.result?.toString(), files[0].name)
                    }
                  }
                }}
              />
              <button
                className="mx-3 px-2 bg-green-300 rounded-2xl"
                onClick={() => {
                  document.getElementById('load_project')?.click()
                }}
              >
                Projekt laden
              </button>
              <button
                className="mx-3 px-2 bg-blue-300 rounded-2xl"
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
              </button>
            </div>
          </div>
          <div className="overflow-hidden flex-grow">
            <ReflexContainer
              orientation="vertical"
              windowResizeAware
              className="h-full"
            >
              <ReflexElement className="h-full" minSize={400}>
                <EditArea />
              </ReflexElement>

              <ReflexSplitter style={{ width: 3 }} />

              <ReflexElement minSize={350}>
                <Player />
              </ReflexElement>
            </ReflexContainer>
          </div>
          <div className="bg-yellow-500 hidden justify-between items-center flex-shrink-0">
            <div>Sprunghöhe: [Dropdown Menu]</div>
            <div>PosX</div>
            <div>PosY</div>
            <div>Blickrichtung</div>
          </div>
        </div>
      </CoreProvider>
    </>
  )
}
