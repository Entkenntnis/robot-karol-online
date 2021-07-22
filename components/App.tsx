import Head from 'next/head'
import { useImmer } from 'use-immer'

import 'react-reflex/styles.css'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'
import { createContext, useContext, useMemo } from 'react'
import { Player } from './Player'
import { EditArea } from './EditArea'
import { ProjectProvider, useProjectContext } from '../lib/model'

export function App() {
  const projectContext = useProjectContext()

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
      <ProjectProvider value={projectContext}>
        <div className="w-full h-full  min-w-[900px] flex flex-col">
          <div className="bg-green-500 h-12 flex justify-between items-center flex-shrink-0">
            <div>LOGO</div>
            <div>Robot Karol Web</div>
            <div>[Projektname]</div>
            <div>Projekt laden</div>
            <div>Projekt speichern</div>
            <div>Neue Welt</div>
            <div>Github</div>
          </div>
          <div className="overflow-hidden flex-grow">
            <ReflexContainer
              orientation="vertical"
              windowResizeAware
              className="h-full"
            >
              <ReflexElement className="flex h-full" minSize={520}>
                <EditArea />
              </ReflexElement>

              <ReflexSplitter style={{ width: 3 }} />

              <ReflexElement className="flex flex-col" minSize={350}>
                <div className="flex-grow overflow-auto flex flex-col justify-center h-full">
                  <div className="min-h-0 w-full">
                    <Player />
                  </div>
                </div>
                <div className="flex-shrink-0">LEFT UP RIGHT H A M Q L</div>
              </ReflexElement>
            </ReflexContainer>
          </div>
          <div className="bg-yellow-500 h-10 flex justify-between items-center flex-shrink-0">
            <div>Sprunghöhe: [Dropdown Menu]</div>
            <div>PosX</div>
            <div>PosY</div>
            <div>Blickrichtung</div>
          </div>
        </div>
      </ProjectProvider>
    </>
  )
}
