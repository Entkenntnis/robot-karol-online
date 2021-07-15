import clsx from 'clsx'
import Head from 'next/head'
import { Updater, useImmer } from 'use-immer'

import 'react-reflex/styles.css'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'
import { KarolWorld } from './View'
import { createContext, useContext } from 'react'
import { Player } from './Player'
import { EditArea } from './EditArea'

export interface AppState {
  name: string
  world: KarolWorld
}

const AppStateContext =
  createContext<{ appState: AppState; setAppState: Updater<AppState> } | null>(
    null
  )

export function useAppState() {
  const val = useContext(AppStateContext)
  if (val) {
    return val
  }
  throw new Error('Bad usage of app state')
}

export function App() {
  const [appState, setAppState] = useImmer<AppState>({
    name: 'neues Projekt',
    world: {
      height: 6,
      width: 5,
      length: 10,
      karol: {
        x: 0,
        y: 0,
        dir: 'south',
      },
      bricks: [
        [6, 0, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
      marks: [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
      ],
    },
  })

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
      <AppStateContext.Provider value={{ appState, setAppState }}>
        <div className="w-full h-full  min-w-[900px] flex flex-col">
          <div className="bg-green-500 h-12 flex justify-between items-center">
            <div>LOGO</div>
            <div>Robot Karol Web</div>
            <div>[Projektname]</div>
            <div>Projekt laden</div>
            <div>Projekt speichern</div>
            <div>Neue Welt</div>
            <div>Github</div>
          </div>
          <ReflexContainer orientation="vertical" windowResizeAware>
            <ReflexElement className="" minSize={520}>
              <div className="flex">
                <EditArea />
              </div>
            </ReflexElement>

            <ReflexSplitter style={{ width: 3 }} />

            <ReflexElement
              className="flex items-center justify-around"
              minSize={350}
            >
              <Player />
            </ReflexElement>
          </ReflexContainer>
          <div className="bg-yellow-500 h-10 flex justify-between items-center">
            <div>Sprunghöhe: [Dropdown Menu]</div>
            <div>PosX</div>
            <div>PosY</div>
            <div>Blickrichtung</div>
          </div>
        </div>
      </AppStateContext.Provider>
    </>
  )
}
