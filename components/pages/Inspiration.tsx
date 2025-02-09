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
import RenderIfVisible from 'react-render-if-visible'

interface DataEntry {
  content: string
  publicId: string
  date: string
}

const TAGS = [
  // Aufwand
  {
    category: 'Aufwand',
    internal: 'gering',
    display: 'gering (bis zu 10 Zeilen Code)',
  },
  {
    category: 'Aufwand',
    internal: 'mittel',
    display: 'mittel (10 - 30 Zeilen Code)',
  },
  { category: 'Aufwand', internal: 'hoch', display: 'hoch (> 30 Zeilen Code)' },

  // Benötigtes Wissen
  { category: 'Benötigtes Wissen', internal: 'sequenz', display: 'Sequenz' },
  {
    category: 'Benötigtes Wissen',
    internal: 'zahlschleife',
    display: 'Zählschleife',
  },
  {
    category: 'Benötigtes Wissen',
    internal: 'bedingte_schleifen',
    display: 'bedingte Schleifen',
  },
  {
    category: 'Benötigtes Wissen',
    internal: 'bedingte_anweisungen',
    display: 'bedingte Anweisungen',
  },
  {
    category: 'Benötigtes Wissen',
    internal: 'strukturierter_code',
    display: 'strukturierter Code/eigene Anweisungen',
  },

  // Komplexität
  {
    category: 'Komplexität',
    internal: 'einfach',
    display: 'einfach (nur Sequenz, Zählschleife)',
  },
  {
    category: 'Komplexität',
    internal: 'mittel',
    display:
      'mittel (bedingte Schleifen, bedingte Anweisungen, aber nicht verschachtelt)',
  },
  {
    category: 'Komplexität',
    internal: 'hoch',
    display: 'hoch (verschachtelte Kontrollstrukturen)',
  },

  // Sonderkategorie
  {
    category: 'Sonderkategorie',
    internal: 'kreativ',
    display: 'kreativ (wenn Programm nicht lösbar, aber schön zum Ansehen)',
  },

  // Qualität der Aufgabe
  {
    category: 'Qualität der Aufgabe',
    internal: 'losbar_einzelwelt',
    display: 'lösbar, Einzelwelt',
  },
  {
    category: 'Qualität der Aufgabe',
    internal: 'losbar_mehrfachwelt',
    display: 'lösbar, Mehrfachwelt',
  },
  {
    category: 'Qualität der Aufgabe',
    internal: 'nicht_losbar',
    display: 'nicht lösbar',
  },

  // Sprache
  { category: 'Sprache', internal: 'deutsch', display: 'Deutsch' },
  { category: 'Sprache', internal: 'englisch', display: 'Englisch' },

  // Eingabeeinschränkungen
  {
    category: 'Eingabeeinschränkungen',
    internal: 'python',
    display: 'nur Python',
  },
  { category: 'Eingabeeinschränkungen', internal: 'code', display: 'nur Code' },
  { category: 'Eingabeeinschränkungen', internal: 'java', display: 'nur Java' },

  // Sondertag
  { category: 'Sondertag', internal: 'story', display: 'Story' },
]

const ENTRIES = [
  {
    id: 5,
    title: 'Einfache Sequenz-Übung',
    tags: [
      'gering',
      'sequenz',
      'einfach',
      'losbar_einzelwelt',
      'deutsch',
      'python',
    ],
  },
  {
    id: 6,
    title: 'Grundlagen der Zählschleifen',
    tags: [
      'gering',
      'zahlschleife',
      'einfach',
      'losbar_einzelwelt',
      'deutsch',
      'java',
    ],
  },
  {
    id: 7,
    title: 'Bedingte Anweisungen verstehen',
    tags: [
      'gering',
      'bedingte_anweisungen',
      'einfach',
      'losbar_einzelwelt',
      'englisch',
      'code',
    ],
  },
  {
    id: 8,
    title: 'Strukturierter Code für Einsteiger',
    tags: [
      'mittel',
      'strukturierter_code',
      'mittel',
      'losbar_mehrfachwelt',
      'deutsch',
      'python',
    ],
  },
  {
    id: 9,
    title: 'Herausforderung: Bedingte Schleifen',
    tags: [
      'hoch',
      'bedingte_schleifen',
      'hoch',
      'nicht_losbar',
      'englisch',
      'java',
    ],
  },
  {
    id: 10,
    title: 'Kreative Problemlösung',
    tags: [
      'gering',
      'sequenz',
      'einfach',
      'kreativ',
      'losbar_mehrfachwelt',
      'deutsch',
      'python',
    ],
  },
  {
    id: 11,
    title: 'Dynamische Zählschleifen',
    tags: [
      'mittel',
      'zahlschleife',
      'mittel',
      'losbar_einzelwelt',
      'englisch',
      'code',
    ],
  },
  {
    id: 12,
    title: 'Fortgeschrittene bedingte Schleifen',
    tags: [
      'hoch',
      'bedingte_schleifen',
      'hoch',
      'losbar_mehrfachwelt',
      'deutsch',
      'java',
    ],
  },
  {
    id: 13,
    title: 'Optimierung strukturierten Codes',
    tags: [
      'mittel',
      'strukturierter_code',
      'mittel',
      'losbar_mehrfachwelt',
      'englisch',
      'python',
    ],
  },
  {
    id: 14,
    title: 'Interaktive Story: Der verlorene Code',
    tags: [
      'gering',
      'sequenz',
      'einfach',
      'kreativ',
      'losbar_einzelwelt',
      'deutsch',
      'python',
      'story',
    ],
  },
  {
    id: 15,
    title: 'Praxisübung zu bedingten Anweisungen',
    tags: [
      'mittel',
      'bedingte_anweisungen',
      'mittel',
      'losbar_einzelwelt',
      'deutsch',
      'java',
    ],
  },
  {
    id: 16,
    title: 'Abenteuer mit Zählschleifen',
    tags: [
      'gering',
      'zahlschleife',
      'einfach',
      'losbar_einzelwelt',
      'englisch',
      'python',
    ],
  },
  {
    id: 17,
    title: 'Verschachtelte Bedingungen meistern',
    tags: [
      'hoch',
      'bedingte_anweisungen',
      'hoch',
      'nicht_losbar',
      'englisch',
      'java',
    ],
  },
  {
    id: 18,
    title: 'Effiziente Schleifenstrukturen',
    tags: [
      'mittel',
      'bedingte_schleifen',
      'mittel',
      'losbar_mehrfachwelt',
      'deutsch',
      'code',
    ],
  },
  {
    id: 19,
    title: 'Story-Modus: Der Algorithmus',
    tags: [
      'gering',
      'sequenz',
      'einfach',
      'kreativ',
      'losbar_einzelwelt',
      'englisch',
      'python',
      'story',
    ],
  },
  {
    id: 20,
    title: 'Komplexitätssteigerung im Code',
    tags: [
      'hoch',
      'strukturierter_code',
      'hoch',
      'nicht_losbar',
      'deutsch',
      'java',
    ],
  },
  {
    id: 21,
    title: 'Kreativer Ansatz zur bedingten Logik',
    tags: [
      'gering',
      'bedingte_anweisungen',
      'einfach',
      'kreativ',
      'losbar_einzelwelt',
      'deutsch',
      'python',
    ],
  },
  {
    id: 22,
    title: 'Experiment: Schleifen und Bedingungen',
    tags: [
      'mittel',
      'zahlschleife',
      'mittel',
      'losbar_mehrfachwelt',
      'englisch',
      'code',
    ],
  },
  {
    id: 23,
    title: 'Innovative Storytelling-Programmierung',
    tags: [
      'gering',
      'sequenz',
      'einfach',
      'kreativ',
      'losbar_einzelwelt',
      'englisch',
      'python',
      'story',
    ],
  },
  {
    id: 24,
    title: 'Fortgeschrittene Konzepte: Schleifen und Strukturen',
    tags: [
      'hoch',
      'strukturierter_code',
      'hoch',
      'nicht_losbar',
      'englisch',
      'java',
    ],
  },
]

export function Inspiration() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  // Gruppierung der Tags nach Kategorie
  const tagsByCategory = TAGS.reduce((acc, tag) => {
    acc[tag.category] = acc[tag.category] ? [...acc[tag.category], tag] : [tag]
    return acc
  }, {} as { [key: string]: { internal: string; display: string }[] })

  // Filter: Einträge müssen den Suchbegriff enthalten und alle selektierten Tags besitzen.
  const filteredEntries = ENTRIES.filter((entry) => {
    const matchesSearch = entry.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.every((tag) => entry.tags.includes(tag))
    return matchesSearch && matchesTags
  })

  return (
    <div className="flex min-h-screen">
      {/* Linke Navbar mit Tags */}
      <aside className="w-64 bg-gray-100 p-4 border-r border-gray-300">
        <h2 className="mb-3 text-2xl">Filter</h2>
        {Object.entries(tagsByCategory).map(([category, tags]) => (
          <div key={category} className="mb-6">
            <h3 className="font-bold mb-2">{category}</h3>
            {tags.map(({ internal, display }) => (
              <div key={internal} className="flex items-center mb-1">
                <input
                  id={internal}
                  type="checkbox"
                  checked={selectedTags.includes(internal)}
                  onChange={() => toggleTag(internal)}
                  className="mr-2"
                />
                <label htmlFor={internal}>{display}</label>
              </div>
            ))}
          </div>
        ))}
      </aside>

      {/* Hauptbereich: Suchleiste und Eintragsliste */}
      <main className="flex-1 p-4 h-full">
        <h1 className="text-3xl font-bold mt-4 mb-8">
          Aufgaben-Galerie 💫⚡💡
        </h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Freitextsuche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="overflow-x-scroll">
          {filteredEntries.length ? (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 mb-3 border rounded hover:shadow"
              >
                <h3 className="font-semibold">{entry.title}</h3>
                <p className="text-sm text-gray-600">
                  Tags: {entry.tags.join(', ')}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Keine Einträge gefunden.</p>
          )}
        </div>
      </main>
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
    <div className={clsx('card bg-white w-96 shadow-xl m-6 overflow-hidden')}>
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
          <RenderIfVisible stayRendered visibleOffset={2000}>
            <View
              className="max-w-[300px] max-h-[200px]"
              appearance={core.ws.appearance}
              world={deserializeWorld(quest.tasks[selected].start)}
              preview={{
                world: deserializeWorld(quest.tasks[selected].target),
              }}
            />
          </RenderIfVisible>
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
