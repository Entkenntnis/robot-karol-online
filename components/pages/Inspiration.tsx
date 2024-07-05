import { useEffect, useState } from 'react'
import { useCore } from '../../lib/state/core'
import { View } from '../helper/View'
import { deserializeWorld } from '../../lib/commands/json'
import { FaIcon } from '../helper/FaIcon'
import {
  faCaretSquareLeft,
  faCaretSquareRight,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'

import { QuestSerialFormat } from '../../lib/state/types'
import { submit_event } from '../../lib/helper/submit'

interface DataEntry {
  content: string
  publicId: string
  date: string
}

export function Inspiration() {
  const core = useCore()

  const [data, setData] = useState<DataEntry[] | null>(null)

  useEffect(() => {
    void (async () => {
      const res = await fetch('/data/inspirationData.json')
      const obj = await res.json()
      submit_event('show_inspiration', core)
      obj.reverse()
      setData(obj)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="pt-10">
      <h1 className="text-center text-5xl ">Lasse dich inspirieren 💫⚡💡</h1>
      <p className="text-center mt-8 max-w-[600px] mx-auto text-lg">
        Schaue dir an, was andere Karol-SpielerInnen erstellt haben.
        <br />
        <small className="italic mt-3 inline-block">
          Inhalte sind bisher nicht thematisch sortiert.
        </small>
      </p>
      <div className="flex flex-wrap flex-row mt-6 bg-gray-50 mb-12 justify-center">
        {data &&
          data.map((d) => {
            return <RandomElement key={d.publicId} data={d} />
          })}
      </div>
    </div>
  )
}

function RandomElement({ data }: { data: DataEntry }) {
  const core = useCore()
  const [selected, setSelected] = useState(0)

  const quest = JSON.parse(data.content) as QuestSerialFormat
  const text = data.publicId

  if (!quest) {
    return <div>wird geladen</div>
  }

  // console.log(data[id], quest)

  // return null

  const noTitle = quest.title == 'Titel der Aufgabe'
  const noDesc =
    quest.description == 'Beschreibe, um was es bei der Aufgabe geht ...'

  return (
    <div className={clsx('card bg-white w-96 shadow-xl m-6')}>
      {quest.tasks.length > 1 && (
        <div className="text-center mt-3">
          <button
            onClick={() => {
              if (selected == 0) {
                setSelected(quest.tasks.length - 1)
              } else {
                setSelected(selected - 1)
              }
            }}
          >
            <FaIcon icon={faCaretSquareLeft} className="mr-4" />
          </button>
          {selected + 1} / {quest.tasks.length}
          <button
            onClick={() => {
              if (selected + 1 === quest.tasks.length) {
                setSelected(0)
              } else {
                setSelected(selected + 1)
              }
            }}
          >
            <FaIcon icon={faCaretSquareRight} className="ml-4" />
          </button>
        </div>
      )}
      <figure className="h-[200px] relative">
        {quest.tasks.length > 0 && (
          <>
            <View
              className="max-w-[300px] max-h-[200px]"
              appearance={core.ws.appearance}
              world={deserializeWorld(quest.tasks[selected].start)}
              preview={{
                world: deserializeWorld(quest.tasks[selected].target),
              }}
            />
          </>
        )}
        {quest.editOptions === 'python-only' && (
          <div className="absolute right-4 bottom-0">
            <span className="badge">Python</span>
          </div>
        )}
        {quest.editOptions === 'java-only' && (
          <div className="absolute right-4 bottom-0">
            <span className="badge">Java</span>
          </div>
        )}
      </figure>
      <div className="card-body">
        <h2 className={clsx('card-title', noTitle && 'italic text-gray-300')}>
          {noTitle ? 'ohne Titel' : quest.title}
        </h2>
        <p className={clsx(noDesc && 'italic text-gray-300')}>
          {noDesc
            ? 'keine Beschreibung'
            : quest.description.length > 111
            ? quest.description.slice(0, 110) + ' …'
            : quest.description}
        </p>
        <div className="card-actions justify-center mt-2">
          <button
            className="btn text-lg"
            onClick={() => {
              window.open('/#' + text, '_blank')
            }}
          >
            #{text} öffnen
          </button>
        </div>
      </div>
    </div>
  )
}
