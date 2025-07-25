import { useEffect, useState } from 'react'
import { FaIcon } from '../helper/FaIcon'
import {
  faCaretSquareLeft,
  faCaretSquareRight,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { TAGS } from '../../lib/data/tags'
import {
  EntryType,
  InspirationData,
  QuestSerialFormat_MUST_STAY_COMPATIBLE,
} from '../../lib/state/types'
import { useCore } from '../../lib/state/core'
import { View } from '../helper/View'
import { deserializeWorld } from '../../lib/commands/json'
import { tagsById } from '../../lib/data/tagsById'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { navigate } from '../../lib/commands/router'
import RenderIfVisible from '../helper/RenderIfVisible'

const tagTitles: { [key: string]: string } = {}

TAGS.forEach((tag) => {
  tagTitles[tag.internal] = tag.display
})

export function Inspiration() {
  const core = useCore()
  const [entries, setEntries] = useState<EntryType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // Load data from /data/inspirationData.json on mount:
  useEffect(() => {
    fetch('/data/inspirationData.json')
      .then((response) => response.json())
      .then((data: InspirationData[]) => {
        const parsedEntries: EntryType[] = data.map((item) => {
          let quest: QuestSerialFormat_MUST_STAY_COMPATIBLE
          try {
            quest = JSON.parse(item.content)
          } catch (error) {
            console.error(
              'Error parsing quest content for publicId',
              item.publicId,
              error
            )
            // Fallback in case parsing fails:
            quest = {
              version: 'v1',
              title: 'Untitled',
              description: '',
              tasks: [],
            }
          }
          const tags: string[] = tagsById[item.publicId].slice(0) ?? []
          if (quest.lng == 'en') {
            tags.push('englisch')
          } else {
            tags.push('deutsch')
          }

          if (quest.editOptions == 'java-only') {
            tags.push('java')
          } else if (quest.editOptions == 'python-only') {
            tags.push('python')
          } else if (quest.editOptions == 'karol-only') {
            tags.push('code')
          } else {
            tags.push('no_restrictions')
          }

          if (quest.tasks.length > 1) {
            tags.push('multiple_worlds')
          }

          if (quest.program) {
            tags.push('with_code')
          }

          return {
            // Use publicId as the entry id:
            id: item.publicId,
            // Use the quest title:
            title: quest.title,
            // Leave tags empty for now (you can add logic later):
            tags,
            quest,
            score: 0,
            jitter: Math.random(),
          }
        })
        setEntries(parsedEntries)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading inspiration data:', error)
        setLoading(false)
      })
  }, [])

  // Toggles a tag in the selectedTags array
  const toggleTag = (tag: string) => {
    submitAnalyzeEvent(core, 'ev_click_inspiration_toggleTag_' + tag)
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  // Group tags by category (assuming TAGS is defined and each tag has `category`, `internal` and `display` properties)
  const tagsByCategory = TAGS.reduce((acc, tag) => {
    acc[tag.category] = acc[tag.category] ? [...acc[tag.category], tag] : [tag]
    return acc
  }, {} as { [key: string]: { internal: string; display: string }[] })

  /**
   * Checks whether an entry matches all selected tags.
   * Supports negative tags (prefixed with "not:").
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

  const matchesSearch = (entry: EntryType) => {
    return (
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.quest.tasks.some((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      entry.quest.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Filter entries by the search term and selected tags.
  const filteredEntries = entries.filter((entry) => {
    entry.score = entry.jitter
    if (entry.tags.includes('leicht')) {
      entry.score += 20
    } else if (entry.tags.includes('mittel')) {
      entry.score += 15
    } else if (entry.tags.includes('schwer')) {
      entry.score += 12
    }
    entry.score += entry.tags.length * -0.8
    return matchesTags(entry, selectedTags) && matchesSearch(entry)
  })

  // sort by score
  filteredEntries.sort((a, b) => b.score - a.score)

  /**
   * Returns the count of entries that would remain if a given tag were added (if not already selected)
   * or remains as is (if already selected).
   */
  const getTagCount = (tag: string) => {
    const activeTags = selectedTags.includes(tag)
      ? selectedTags
      : [...selectedTags, tag]

    return entries.filter((entry) => {
      return matchesTags(entry, activeTags) && matchesSearch(entry)
    }).length
  }

  // Reset all filters.
  const resetFilters = () => {
    setSelectedTags([])
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar with Filters */}
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
          // Only show tags that have a count > 0 or are already selected.
          const visibleTags = tags.filter(
            ({ internal }) =>
              getTagCount(internal) > 0 || selectedTags.includes(internal)
          )

          // Hide the category if there are no visible tags.
          if (visibleTags.length === 0) return null

          return (
            <div key={category} className="mb-6">
              <h3 className="font-bold mb-2">{category}</h3>
              {visibleTags.map(({ internal, display }) => (
                <div key={internal} className="flex items-center mb-1">
                  <label className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(internal)}
                      onChange={() => toggleTag(internal)}
                      disabled={loading} // disable checkboxes while loading
                      className="mr-2"
                    />
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

      {/* Main Content: Search and Entries */}
      <main className="flex-1 p-4 h-full overflow-x-hidden">
        <h1 className="text-3xl font-bold mt-4 mb-2">
          Aufgaben-Galerie 💫⚡💡
        </h1>
        <p className="mb-2">Stand: 5. Juli 2024</p>
        <p className="mb-4">
          <a
            href="/#"
            className="text-blue-500 hover:underline cursor-pointer"
            onClick={(e) => {
              navigate(core, '')
              e.preventDefault()
            }}
          >
            zurück
          </a>
        </p>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Freitextsuche..."
            value={searchTerm}
            onChange={(e) => {
              submitAnalyzeEvent(core, 'ev_type_inspiration_search')
              setSearchTerm(e.target.value)
            }}
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
        {loading ? (
          <p className="text-gray-500">Loading entries...</p>
        ) : (
          <div className="flex flex-wrap gap-8 justify-around w-full items-start">
            {filteredEntries.length ? (
              <>
                {filteredEntries.map((entry) => (
                  <Entry key={entry.id} entry={entry} />
                ))}
                <div className="p-4 mb-3 w-80 h-96"></div>
                <div className="p-4 mb-3 w-80 h-96"></div>
                <div className="p-4 mb-3 w-80 h-96"></div>
              </>
            ) : (
              <p className="text-gray-500">Keine Einträge gefunden.</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function Entry({ entry }: { entry: EntryType }) {
  const core = useCore()
  const quest = entry.quest

  const noDesc =
    quest.description == 'Beschreibe, um was es bei der Aufgabe geht ...'

  const tags = entry.tags.filter(
    (tag) => !['deutsch', 'no_restrictions', 'multiple_worlds'].includes(tag)
  )

  const [selected, setSelected] = useState(0)
  return (
    <div className="p-4 pt-2 mb-3 border rounded-xl w-80 flex flex-col overflow-hidden">
      {quest.tasks.length > 1 && (
        <div className="text-center">
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
      <figure className="h-[200px] relative mx-auto">
        {quest.tasks.length > 0 && (
          <RenderIfVisible stayRendered visibleOffset={2000}>
            <View
              className="max-w-[300px] max-h-[200px]"
              robotImageDataUrl={core.ws.robotImageDataUrl}
              world={deserializeWorld(quest.tasks[selected].start)}
              preview={{
                world: deserializeWorld(quest.tasks[selected].target),
              }}
            />
          </RenderIfVisible>
        )}
      </figure>
      <h3 className="font-semibold mt-4">{entry.title}</h3>
      <p className={clsx(noDesc && 'italic text-gray-300', 'mt-2')}>
        {noDesc
          ? 'keine Beschreibung'
          : quest.description.length > 111
          ? quest.description.slice(0, 110) + ' …'
          : quest.description}
      </p>
      {tags.length > 0 && (
        <p className="text-sm text-gray-600 mt-4">
          {tags.map((tag) => (
            <span
              className="px-2 py-0.5 rounded-full bg-gray-100 mr-2 mt-2 inline-block"
              key={tag}
            >
              {tagTitles[tag]}{' '}
            </span>
          ))}
        </p>
      )}
      <div className="flex justify-center mt-2">
        <button
          className="px-2 py-0.5 bg-pink-100 hover:bg-pink-200 rounded my-3"
          onClick={() => {
            submitAnalyzeEvent(core, 'ev_click_inspiration_openQuest')
            window.open(
              '/#' + entry.id,
              '__TAURI_INTERNALS__' in window ? '_self' : '_blank'
            )
          }}
        >
          #{entry.id} öffnen
        </button>
      </div>
    </div>
  )
}
