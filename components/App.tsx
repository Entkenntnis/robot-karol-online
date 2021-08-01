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
          <div className="bg-yellow-400 h-8 flex justify-between items-center flex-shrink-0">
            <div>
              <h1 className="font-bold ml-4">Robot Karol Web</h1>
            </div>
            <div>
              <a
                href="https://github.com/Entkenntnis/robot-karol-web"
                className="hover:underline mr-4"
                target="_blank"
                rel="noreferrer"
              >
                Homepage
              </a>
            </div>
          </div>
          <div className="overflow-hidden flex-grow">
            <ReflexContainer
              orientation="vertical"
              windowResizeAware
              className="h-full"
            >
              <ReflexElement className="flex h-full" minSize={400}>
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
