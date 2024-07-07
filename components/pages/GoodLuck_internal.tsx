import { useState } from 'react'
import { useCore } from '../../lib/state/core'
import { View } from '../helper/View'
import { deserializeWorld } from '../../lib/commands/json'
import { FaIcon } from '../helper/FaIcon'
import {
  faCaretSquareLeft,
  faCaretSquareRight,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'

const data: any[] = []

export function GoodLuck() {
  const core = useCore()

  const [favorites, setFavorites] = useState(data.map((x) => x.publicId))

  return (
    <div className="pt-10">
      <h1 className="text-center text-5xl ">Lasse dich inspirieren 💫⚡💡</h1>
      <p className="text-center mt-8 max-w-[600px] mx-auto text-lg">
        Schaue dir an, was andere Karol-NutzerInnen geteilt haben.
        <br />
        Du findest hier eine zufällige Auswahl an freigegebenen Aufgaben.
        <br />
        Die Inhalte sind lizenzfrei verwendbar.
      </p>
      <p className="text-gray-700 mt-5 text-center italic">
        Unangemessener Inhalt entdeckt? Schicke mir den 4-stelligen Code per
        E-Mail an{' '}
        <a href="mailto:karol@arrrg.de" className="link">
          karol@arrrg.de
        </a>{' '}
        und ich werde den Inhalt überprüfen/entfernen.
      </p>
      <div className="flex flex-wrap flex-row mt-6 bg-gray-50 mb-12">
        {data.map((d, i: number) => (
          <RandomElement
            key={i}
            id={i}
            isFav={favorites.includes(d.publicId)}
            setFav={(state: boolean) => {
              if (state) {
                if (!favorites.includes(d.publicId))
                  setFavorites((x) => [...x, d.publicId])
              } else {
                setFavorites((x) => x.filter((f) => f != d.publicId))
              }
            }}
          />
        ))}
      </div>
      <div className="w-full h-96 break-words">{JSON.stringify(favorites)}</div>
    </div>
  )
}

function RandomElement({
  id,
  isFav,
  setFav,
}: {
  id: number
  isFav: boolean
  setFav: (state: boolean) => void
}) {
  const core = useCore()
  const [selected, setSelected] = useState(0)

  const quest = JSON.parse(data[id].content)
  const text = data[id].publicId

  if (!quest) {
    return <div>wird geladen</div>
  }

  // console.log(data[id], quest)

  // return null

  const noTitle = quest.title == 'Titel der Aufgabe'
  const noDesc =
    quest.description == 'Beschreibe, um was es bei der Aufgabe geht ...'

  return (
    <div
      className={clsx(
        'card bg-white w-96 shadow-xl m-6',
        isFav ? 'bg-white' : 'bg-white opacity-20'
      )}
    >
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
            {!quest.tasks[selected].title.includes('Neuer Auftrag') && (
              <small className="absolute left-3 top-3">
                {quest.tasks[selected].title}
              </small>
            )}
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
        <div className="absolute right-4 bottom-0">
          {quest.editOptions === 'python-only' && (
            <span className="badge">Python</span>
          )}
          {quest.editOptions === 'java-only' && (
            <span className="badge">Java</span>
          )}
          {quest.lng === 'en' && <span className="badge">EN</span>}
        </div>
      </figure>

      <small className="absolute right-2 bottom-2">{data[id].createdAt}</small>
      <div className="card-body">
        <h2 className={clsx('card-title', noTitle && 'italic text-gray-300')}>
          {noTitle ? 'ohne Titel' : quest.title}
        </h2>
        <p
          className={clsx(
            noDesc && 'italic text-gray-300',
            'max-h-[140px] overflow-y-auto'
          )}
        >
          {noDesc ? 'keine Beschreibung' : quest.description}
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
          <button
            className="btn"
            onClick={() => {
              setFav(!isFav)
            }}
          >
            {isFav ? 'ausblenden' : 'einblenden'}
          </button>
        </div>
      </div>
    </div>
  )
}
