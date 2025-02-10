import { useState } from 'react'
import { FaIcon } from '../helper/FaIcon'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'

const TAGS = [
  // Benötigtes Wissen
  {
    category: 'Benötigtes Wissen',
    internal: 'zaehlschleife',
    display: 'Zählschleife',
  },
  {
    category: 'Benötigtes Wissen',
    internal: 'bedingte_schleife',
    display: 'bedingte Schleife',
  },
  {
    category: 'Benötigtes Wissen',
    internal: 'bedingte_anweisung',
    display: 'bedingte Anweisung',
  },
  {
    category: 'Benötigtes Wissen',
    internal: 'eigene_anweisung',
    display: 'eigene Anweisungen',
  },

  // Themen ausschließen
  {
    category: 'Themen ausschließen',
    internal: 'not:zaehlschleife',
    display: 'ohne Zählschleife',
  },
  {
    category: 'Themen ausschließen',
    internal: 'not:bedingte_schleife',
    display: 'ohne bedingte Schleife',
  },
  {
    category: 'Themen ausschließen',
    internal: 'not:bedingte_anweisung',
    display: 'ohne bedingte Anweisung',
  },
  {
    category: 'Themen ausschließen',
    internal: 'not:eigene_anweisung',
    display: 'ohne eigene Anweisungen',
  },

  // Schwierigkeitsgrad
  {
    category: 'Schwierigkeitsgrad',
    internal: 'leicht',
    display: 'leicht',
  },
  {
    category: 'Schwierigkeitsgrad',
    internal: 'mittel',
    display: 'mittel',
  },
  {
    category: 'Schwierigkeitsgrad',
    internal: 'schwer',
    display: 'schwer',
  },

  // Besonderheiten
  {
    category: 'Besonderheiten',
    internal: 'multiple_worlds',
    display: 'mehrere Welten',
  },

  // Eingabeeinschränkungen
  {
    category: 'Eingabeeinschränkungen',
    internal: 'no_restrictions',
    display: 'keine',
  },
  {
    category: 'Eingabeeinschränkungen',
    internal: 'code',
    display: 'nur Robot Karol Code',
  },
  {
    category: 'Eingabeeinschränkungen',
    internal: 'python',
    display: 'nur Python',
  },
  { category: 'Eingabeeinschränkungen', internal: 'java', display: 'nur Java' },

  // Sprache
  { category: 'Sprache', internal: 'deutsch', display: 'Deutsch' },
  { category: 'Sprache', internal: 'englisch', display: 'Englisch' },
]

const ENTRIES = [
  {
    id: 1,
    title: 'Einfache Sequenz-Übung',
    tags: ['zaehlschleife', 'leicht', 'code', 'python', 'deutsch'],
  },
  {
    id: 2,
    title: 'Bedingte Schleifen-Übung',
    tags: ['bedingte_schleife', 'mittel', 'code', 'java', 'englisch'],
  },
  {
    id: 3,
    title: 'Bedingte Anweisung in Python',
    tags: ['bedingte_anweisung', 'leicht', 'code', 'python', 'deutsch'],
  },
  {
    id: 4,
    title: 'Eigene Anweisung mit Story-Elementen',
    tags: ['eigene_anweisung', 'story', 'mittel', 'code', 'englisch'],
  },
  {
    id: 5,
    title: 'Schwere Sequenz-Übung in Java',
    tags: ['zaehlschleife', 'schwer', 'code', 'java', 'deutsch'],
  },
  {
    id: 6,
    title: 'Multiple Worlds Challenge',
    tags: [
      'multiple_worlds',
      'bedingte_schleife',
      'mittel',
      'code',
      'python',
      'englisch',
    ],
  },
  {
    id: 7,
    title: 'Humorvolle Bedingte Anweisungen',
    tags: ['humor', 'bedingte_anweisung', 'leicht', 'code', 'java', 'deutsch'],
  },
  {
    id: 8,
    title: 'No Restrictions Code Challenge',
    tags: [
      'no_restrictions',
      'eigene_anweisung',
      'schwer',
      'code',
      'python',
      'englisch',
    ],
  },
  {
    id: 9,
    title: 'Sequenz mit Bedingter Schleife',
    tags: [
      'zaehlschleife',
      'bedingte_schleife',
      'mittel',
      'code',
      'java',
      'deutsch',
    ],
  },
  {
    id: 10,
    title: 'Einfache Bedingte Anweisungsübung',
    tags: ['bedingte_anweisung', 'leicht', 'code', 'python', 'englisch'],
  },
  {
    id: 11,
    title: 'Story-basierte Sequenz-Übung',
    tags: ['story', 'zaehlschleife', 'mittel', 'code', 'java', 'deutsch'],
  },
  {
    id: 12,
    title: 'Humorvolle Eigene Anweisung',
    tags: ['humor', 'eigene_anweisung', 'leicht', 'code', 'python', 'englisch'],
  },
  {
    id: 13,
    title: 'Schwere Bedingte Schleifen-Herausforderung',
    tags: ['bedingte_schleife', 'schwer', 'code', 'java', 'deutsch'],
  },
  {
    id: 14,
    title: 'Multiple Worlds und Bedingte Anweisungen',
    tags: [
      'multiple_worlds',
      'bedingte_anweisung',
      'mittel',
      'code',
      'python',
      'englisch',
    ],
  },
  {
    id: 15,
    title: 'No Restrictions Sequenz-Übung',
    tags: [
      'no_restrictions',
      'zaehlschleife',
      'leicht',
      'code',
      'java',
      'deutsch',
    ],
  },
  {
    id: 16,
    title: 'Kombinierte Bedingte Schleife und Anweisung',
    tags: [
      'bedingte_schleife',
      'bedingte_anweisung',
      'mittel',
      'code',
      'python',
      'englisch',
    ],
  },
  {
    id: 17,
    title: 'Storytelling mit Eigenen Anweisungen',
    tags: ['story', 'eigene_anweisung', 'mittel', 'code', 'java', 'deutsch'],
  },
  {
    id: 18,
    title: 'Humor und Code: Eine Sequenz-Übung',
    tags: ['humor', 'zaehlschleife', 'leicht', 'code', 'python', 'englisch'],
  },
  {
    id: 19,
    title: 'Schwere Eigene Anweisungs-Herausforderung',
    tags: ['eigene_anweisung', 'schwer', 'code', 'java', 'deutsch'],
  },
  {
    id: 20,
    title: 'Multiple Worlds und No Restrictions',
    tags: [
      'multiple_worlds',
      'no_restrictions',
      'mittel',
      'code',
      'python',
      'englisch',
    ],
  },
  {
    id: 21,
    title: 'Einführung in die Zählschleife',
    tags: ['zaehlschleife', 'leicht', 'code', 'java', 'deutsch'],
  },
  {
    id: 22,
    title: 'Bedingte Schleifen in Aktion',
    tags: ['bedingte_schleife', 'mittel', 'code', 'python', 'englisch'],
  },
  {
    id: 23,
    title: 'Bedingte Anweisung: Ein tiefer Einblick',
    tags: ['bedingte_anweisung', 'schwer', 'code', 'java', 'deutsch'],
  },
  {
    id: 24,
    title: 'Eigene Anweisung mit Variablen',
    tags: ['eigene_anweisung', 'mittel', 'code', 'python', 'englisch'],
  },
  {
    id: 25,
    title: 'Humorvoller Code: Sequenz und Schleife',
    tags: ['humor', 'zaehlschleife', 'leicht', 'code', 'java', 'deutsch'],
  },
  {
    id: 26,
    title: 'Storytelling durch Bedingte Anweisungen',
    tags: [
      'story',
      'bedingte_anweisung',
      'mittel',
      'code',
      'python',
      'englisch',
    ],
  },
  {
    id: 27,
    title: 'No Restrictions: Eigene Schleifen kreieren',
    tags: [
      'no_restrictions',
      'eigene_anweisung',
      'schwer',
      'code',
      'java',
      'deutsch',
    ],
  },
  {
    id: 28,
    title: 'Multiple Worlds: Sequenzen und Bedingungen',
    tags: [
      'multiple_worlds',
      'zaehlschleife',
      'bedingte_anweisung',
      'mittel',
      'code',
      'python',
      'englisch',
    ],
  },
  {
    id: 29,
    title: 'Kreative Schleifen-Übung mit Storytelling',
    tags: ['zaehlschleife', 'story', 'leicht', 'code', 'java', 'deutsch'],
  },
  {
    id: 30,
    title: 'Finale Herausforderung: Alle Konzepte vereint',
    tags: [
      'bedingte_schleife',
      'bedingte_anweisung',
      'eigene_anweisung',
      'multiple_worlds',
      'no_restrictions',
      'schwer',
      'code',
      'python',
      'englisch',
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

  /**
   * Prüft, ob ein Eintrag anhand der übergebenen Tags passt.
   * Dabei werden negative Tags, also solche die mit "not:" beginnen, korrekt verarbeitet.
   *
   * @param entry Der zu prüfende Eintrag.
   * @param tags Die Liste der aktiven Tags.
   * @returns true, falls der Eintrag zu den Tags passt, andernfalls false.
   */
  const matchesTags = (
    entry: { title: string; tags: string[] },
    tags: string[]
  ) => {
    return tags.every((tag) => {
      if (tag.startsWith('not:')) {
        const actualTag = tag.slice(4)
        return !entry.tags.includes(actualTag)
      }
      return entry.tags.includes(tag)
    })
  }

  // Filter: Einträge müssen den Suchbegriff enthalten und alle selektierten Tags (positiv/negativ) berücksichtigen.
  const filteredEntries = ENTRIES.filter((entry) => {
    const matchesSearch = entry.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    return matchesSearch && matchesTags(entry, selectedTags)
  })

  /**
   * Berechnet die Anzahl der Einträge, die beim Anwenden des Filters für den Tag
   * (zusammen mit den aktuell ausgewählten Tags) übrig bleiben.
   *
   * Falls der Tag noch nicht ausgewählt ist, wird er als zusätzlicher Filter hinzugefügt.
   *
   * @param tag Der interne Tag-Name
   */
  const getTagCount = (tag: string) => {
    // Wenn der Tag bereits ausgewählt ist, nehmen wir die bestehenden Tags als Filter.
    // Andernfalls simulieren wir, dass der Tag hinzugefügt wird.
    const activeTags = selectedTags.includes(tag)
      ? selectedTags
      : [...selectedTags, tag]

    return ENTRIES.filter((entry) => {
      const matchesSearch = entry.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      return matchesSearch && matchesTags(entry, activeTags)
    }).length
  }

  // Funktion zum Zurücksetzen aller Filter
  const resetFilters = () => {
    setSelectedTags([])
  }

  return (
    <div className="flex min-h-screen">
      {/* Linke Navbar mit Tags */}
      <aside className="w-[270px] bg-gray-100 p-4 border-r border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl">Filter</h2>
          <button
            onClick={resetFilters}
            className={clsx(
              'text-sm text-blue-500 hover:underline',
              selectedTags.length === 0 && 'hidden'
            )}
          >
            Filter zurücksetzen
          </button>
        </div>
        {Object.entries(tagsByCategory).map(([category, tags]) => {
          // Nur Tags anzeigen, die einen Count > 0 haben oder bereits ausgewählt sind
          const visibleTags = tags.filter(
            ({ internal }) =>
              getTagCount(internal) > 0 || selectedTags.includes(internal)
          )

          // Kategorie ausblenden, wenn keine sichtbaren Tags vorhanden sind
          if (visibleTags.length === 0) return null

          return (
            <div key={category} className="mb-6">
              <h3 className="font-bold mb-2">{category}</h3>
              {visibleTags.map(({ internal, display }) => (
                <div key={internal} className="flex items-center mb-1">
                  <input
                    id={internal}
                    type="checkbox"
                    checked={selectedTags.includes(internal)}
                    onChange={() => toggleTag(internal)}
                    className="mr-2"
                  />
                  <label htmlFor={internal}>
                    {display}{' '}
                    <span className="text-sm text-gray-600">
                      {getTagCount(internal)}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )
        })}
      </aside>

      {/* Hauptbereich: Suchleiste und Eintragsliste */}
      <main className="flex-1 p-4 h-full">
        <h1 className="text-3xl font-bold mt-4 mb-8">
          Aufgaben-Galerie 💫⚡💡
        </h1>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Freitextsuche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pr-8 border border-gray-300 rounded"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              <FaIcon icon={faTimes} />
            </button>
          )}
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
