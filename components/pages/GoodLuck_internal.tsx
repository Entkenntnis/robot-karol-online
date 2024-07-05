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

  const [favorites, setFavorites] = useState([
    'CZT4',
    'DVVX',
    'JDE5',
    'GKJJ',
    'JNMU',
    '6XRW',
    'HB9N',
    'R6KE',
    'DFDC',
    'T8MD',
    '8SNU',
    '3SCH',
    'PUK7',
    '3DQV',
    'U5U5',
    'H6X3',
    'XKHF',
    'GRAQ',
    'Y6ER',
    '8TXS',
    'RX4N',
    'MVYT',
    '7RZT',
    'JXQA',
    'DBXG',
    '9N3G',
    'RVYA',
    '6KX7',
    'SHHN',
    'WC3J',
    '9HYM',
    'Q6BH',
    '3PP6',
    '7GRJ',
    'Y4A9',
    'AU2W',
    '2YKH',
    'U8NV',
    '26MM',
    'AMC9',
    '5D68',
    'N5VC',
    'RETE',
    'E4EJ',
    '5NP7',
    'T3CP',
    '92PS',
    'E4KZ',
    '9DJN',
    '7WFD',
    'KXXW',
    '7WXK',
    'YM7W',
    'J9GT',
    'HWKG',
    '88KX',
    '43XJ',
    '3MYM',
    '3SU3',
    'CQ9T',
    'XJC6',
    'K7CG',
    '232H',
    'FJTJ',
    'UMGU',
    'MDFK',
    'K6TS',
    'UUS5',
    'SFSN',
    '6SJK',
    'HDYN',
    'B2X7',
    'JFMW',
    'FXRS',
    'W4G5',
    'ZJ8T',
    'BD6K',
    'VK58',
    '4BM3',
    '2FEG',
    'BTFR',
    'VXTK',
    '3AC2',
    'B7F7',
    'NY45',
    'EBYD',
    'BPHQ',
    'A7XP',
    '4ZKP',
    'E4TB',
    '525W',
    'REUY',
    '8WFR',
    '77C3',
    'MKY5',
    'CY8Y',
    '2856',
    'FK5M',
    'F3UC',
    '4NXQ',
    'YFQC',
    'ZUQD',
    'T9SA',
    'KNPX',
    'V7F7',
    'J6UR',
    'KQXN',
    '85B6',
    'YBWK',
    'Z9Y5',
    '8WXR',
    'HZP8',
    'BB82',
    'ESN2',
    'H9PM',
    '8DHC',
    'N5A8',
    'XMNP',
    '9N34',
    'P4P5',
    'DTQA',
    'MVB8',
    'PTQQ',
    'EE8X',
    'PZN3',
    'EF73',
    'JS9C',
    'A6H6',
    'DB7W',
    '5C7R',
    'QVFB',
    'GUYX',
    '4JYG',
    'ZFT7',
    'ZTE7',
    'CFQM',
    'A5A2',
    '5EKT',
    '2D3A',
    'XVM5',
    'KZ76',
    'N7FR',
    'VB8T',
    '5UPG',
    'JBBX',
    'CV8M',
    'CTH4',
    '858F',
    '7DK2',
    'KBJE',
    'SFW7',
    '47K5',
    'PEV8',
    'BP7A',
    'QJGS',
    'HNXE',
    '924T',
  ])

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
        {data.map((d, i) => (
          <RandomElement
            key={i}
            id={i}
            isFav={favorites.includes(d.publicId)}
            setFav={(state: boolean) => {
              if (state) {
                if (!favorites.includes(d.publicId))
                  setFavorites([...favorites, d.publicId])
              } else {
                setFavorites(favorites.filter((f) => f != d.publicId))
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

      <small className="absolute right-2 bottom-2">{data[id].createdAt}</small>
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
