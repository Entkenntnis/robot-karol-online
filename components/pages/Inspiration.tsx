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
  QuestSerialFormat,
} from '../../lib/state/types'
import { useCore } from '../../lib/state/core'
import RenderIfVisible from 'react-render-if-visible'
import { View } from '../helper/View'
import { deserializeWorld } from '../../lib/commands/json'

export function Inspiration() {
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
          let quest: QuestSerialFormat
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
    entry.score -= entry.tags.length * -0.4
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
                  <input
                    id={internal}
                    type="checkbox"
                    checked={selectedTags.includes(internal)}
                    onChange={() => toggleTag(internal)}
                    disabled={loading} // disable checkboxes while loading
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

      {/* Main Content: Search and Entries */}
      <main className="flex-1 p-4 h-full overflow-x-hidden">
        <h1 className="text-3xl font-bold mt-4 mb-2">
          Aufgaben-Galerie 💫⚡💡
        </h1>
        <p className="mb-6">Stand: 5. Juli 2024</p>
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
    <div className="p-4 mb-3 border rounded hover:shadow w-80 flex flex-col">
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
      <figure className="h-[200px] relative mx-auto">
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
              {tag}{' '}
            </span>
          ))}
        </p>
      )}
      <div className="card-actions justify-center mt-2">
        <button
          className="btn btn-sm my-3"
          onClick={() => {
            window.open('/#' + entry.id, '_blank')
          }}
        >
          #{entry.id} öffnen
        </button>
      </div>
    </div>
  )
}

const tagsById: { [key: string]: string[] } = {
  // –– Zeilen mit mindestens einem TRUE in den tag‑Spalten ––
  SWBS: [], // Obwohl hier NICHT LÖSBAR TRUE ist, wird diese Spalte nicht berücksichtigt.
  T3W3: ['leicht'],
  M2VP: ['bedingte_schleife', 'bedingte_anweisung', 'schwer'],
  '3XJW': ['zaehlschleife', 'mittel'],
  D7H6: [],
  S32H: [
    'bedingte_schleife',
    'bedingte_anweisung',
    'eigene_anweisung',
    'schwer',
  ],
  SGUK: ['zaehlschleife', 'mittel'],
  XQYM: ['mittel'],
  XE2C: ['zaehlschleife', 'mittel'],
  M48T: ['bedingte_schleife', 'bedingte_anweisung', 'schwer'],
  SQ4H: ['zaehlschleife', 'leicht'],
  SFBB: ['zaehlschleife', 'leicht'],
  X27A: ['bedingte_schleife', 'mittel'],
  N8GD: ['leicht'],
  '5ASX': ['zaehlschleife', 'bedingte_schleife', 'mittel'],
  RXC3: ['bedingte_schleife', 'mittel'],
  HJTD: ['zaehlschleife', 'bedingte_schleife', 'mittel'],
  EHWY: ['zaehlschleife', 'mittel'],
  '8WCK': ['leicht'],
  '8NDP': ['leicht'],
  '4S45': [
    'bedingte_schleife',
    'bedingte_anweisung',
    'eigene_anweisung',
    'schwer',
  ],

  // –– Alle weiteren IDs (ab K4B8) enthalten in den tag-Spalten nur FALSE bzw. leere Felder ––
  K4B8: [],
  '34P9': [],
  JN58: [],
  '5C2D': [],
  BM8A: [],
  SQW6: [],
  XV95: [],
  '76AC': [],
  MFPJ: [],
  G7XU: [],
  '3V7Y': [],
  XBDF: [],
  K6ZZ: [],
  CBYK: [],
  YEU5: [],
  '5UT2': [],
  X3J6: [],
  DFYD: [],
  YBYM: [],
  AU7X: [],
  QCPT: [],
  KGYC: [],
  '8EYY': [],
  HX5C: [],
  GR35: [],
  QM76: [],
  DUX9: [],
  '69HB': [],
  KKE9: [],
  QJRA: [],
  HWT3: [],
  '8KHU': [],
  MQ3X: [],
  '3YET': [],
  '99ZA': [],
  ZZDV: [],
  '2JVU': [],
  SPCK: [],
  GET6: [],
  PM8B: [],
  EXAE: [],
  '2HKC': [],
  Z3F6: [],
  CJNU: [],
  Y4TK: [],
  K2EB: [],
  BVBY: [],
  BHWM: [],
  FAFP: [],
  '66ZS': [],
  '3ZA6': [],
  TQWG: [],
  BWYJ: [],
  JNHA: [],
  UN5Q: [],
  V6JX: [],
  MXP8: [],
  J5TJ: [],
  ZRU6: [],
  HKXT: [],
  WA2Q: [],
  '3VYJ': [],
  R7QK: [],
  KF6M: [],
  '9QC7': [],
  '9BYU': [],
  P2HY: [],
  Z6EG: [],
  QZNH: [],
  '27TN': [],
  R298: [],
  '7G8Z': [],
  GM6Z: [],
  EKAG: [],
  VE4P: [],
  AKF9: [],
  JQGV: [],
  '7PX6': [],
  V92X: [],
  '3GGJ': [],
  '2SUQ': [],
  '9QEM': [],
  '2QX6': [],
  H99V: [],
  '5DVD': [],
  NFN6: [],
  DRAC: [],
  Z8CZ: [],
  N9YJ: [],
  DTPQ: [],
  JNTB: [],
  XMWF: [],
  ZMFA: [],
  V4CW: [],
  N84U: [],
  '74EW': [],
  DVC4: [],
  V4KP: [],
  ANAC: [],
  '7E9F': [],
  NAU9: [],
  CC85: [],
  BFZ5: [],
  AABR: [],
  '7WZU': [],
  '8Q6X': [],
  WC5D: [],
  VTKW: [],
  '35HW': [],
  MJZT: [],
  GRG8: [],
  '8VHD': [],
  QGB9: [],
  '7GNC': [],
  UGNP: [],
  '5V5Q': [],
  X6PH: [],
  RA8Z: [],
  MD7K: [],
  T4TK: [],
  J7S3: [],
  NDZ4: [],
  P6PK: [],
  DUZJ: [],
  JFT6: [],
  HHYR: [],
  RFPQ: [],
  '988S': [],
  X5XX: [],
  '3X9F': [],
  NPGE: [],
  NK6P: [],
  UXV2: [],
  T6DF: [],
  WZRW: [],
  '28C7': [],
  KHAE: [],
  X9XB: [],
  T7SV: [],
  ZTD2: [],
  A8PN: [],
  GS25: [],
  '8B3R': [],
  T3VB: [],
  CTUD: [],
  RSS3: [],
  ETN6: [],
  '5EKR': [],
  J9GN: [],
  TYXG: [],
  '847T': [],
  '2K6P': [],
  MMKX: [],
  X68V: [],
  K26W: [],
  JX3A: [],
  F3BV: [],
  ENWC: [],
  '3V7J': [],
  CBUB: [],
  '958D': [],
  QQ3K: [],
  PAT9: [],
  UHH7: [],
  E7JR: [],
  YJF6: [],
  NJ8Q: [],
  WYYM: [],
  AYWQ: [],
  A24M: [],
  YD8J: [],
  '5UMD': [],
  '836J': [],
  GB8K: [],
  EVN3: [],
  UJHC: [],
  X935: [],
  A9A5: [],
  W6TD: [],
  '9ZE4': [],
  '4GA5': [],
  UTUE: [],
  M32K: [],
  GCN4: [],
  N7T5: [],
  HYEQ: [],
  G9ZQ: [],
  MKR7: [],
  G66K: [],
  '4R3W': [],
  AUZS: [],
  FAA8: [],
  V74R: [],
  CQ45: [],
  CMDS: [],
  C6AU: [],
  AA97: [],
  VX5Y: [],
  HY4T: [],
  '5K52': [],
  S36V: [],
  NZNC: [],
  BQJ5: [],
  '5G5J': [],
  ZYQ6: [],
  JEDH: [],
  D9SZ: [],
  EYYT: [],
  UVQZ: [],
  A3QP: [],
  T6RD: [],
  VMWA: [],
  UQKV: [],
  WCG3: [],
  TKNQ: [],
  '2QU7': [],
  YH8Z: [],
  RR69: [],
  B58S: [],
  '3VBW': [],
  VSCS: [],
  DUTV: [],
  '5PRW': [],
  DX4S: [],
  EP4V: [],
  MN5T: [],
  VAWB: [],
  PR65: [],
  '3A67': [],
  '9AR8': [],
  WEF3: [],
  RR5N: [],
  VJTV: [],
  '8EBN': [],
  '6DUP': [],
  J36A: [],
  HPDX: [],
  C9MY: [],
  WRSD: [],
  WRHJ: [],
  HUAK: [],
  JD84: [],
  MQP7: [],
  X4A7: [],
  MS92: [],
  FX3E: [],
  '3PQA': [],
  PZW2: [],
  '8EVA': [],
  CBA7: [],
  '5VKU': [],
  A4G3: [],
  Q669: [],
  MWRF: [],
  A95W: [],
  '5R78': [],
  '42YT': [],
  NRXP: [],
  TFJ8: [],
  WGFY: [],
  '87V3': [],
  UKXG: [],
  AN8N: [],
  CAYV: [],
  SDNZ: [],
  RP5P: [],
  KGU4: [],
  HNFP: [],
  Y7QY: [],
  T6GX: [],
  NCY5: [],
  NQMW: [],
  '6BH3': [],
  EPY5: [],
  KJ9N: [],
  NZ5N: [],
  HRAB: [],
  KHBZ: [],
  MUW7: [],
  BHTN: [],
  WENA: [],
  HBU4: [],
  SSTD: [],
  P5J2: [],
  '64AD': [],
  BKPU: [],
  RGR8: [],
  '8BZ7': [],
  J3M6: [],
  '5ABH': [],
  YNHV: [],
  AGMB: [],
  '4DEA': [],
  CNRF: [],
  '48QS': [],
  '2NC9': [],
  CHFA: [],
  PFT5: [],
  Y5VY: [],
  '746D': [],
  K74K: [],
  VN27: [],
  T6QS: [],
  '6D8D': [],
  D2SE: [],
  NXD2: [],
  SSVA: [],
  W84Z: [],
  T52Y: [],
  '6VJT': [],
  '8KNW': [],
  AYFY: [],
  '9WUA': [],
  '4EVB': [],
  DX9S: [],
  ETYZ: [],
  N6DV: [],
  TVV3: [],
  '8936': [],
  MK75: [],
  BG4J: [],
  H2P5: [],
  RSZY: [],
  R244: [],
  UV3B: [],
  SZBU: [],
  ERWZ: [],
  TEBV: [],
  TAPS: [],
  JT57: [],
  MH5D: [],
  '58YH': [],
  NYCX: [],
  '3TPT': [],
  Q9JS: [],
  GYCB: [],
  K88H: [],
  Q2PJ: [],
  ZGFW: [],
  '2QPY': [],
  DV8Y: [],
  BRA9: [],
  UP25: [],
  RFMX: [],
  '9ZRY': [],
  PUNU: [],
  MYS5: [],
  DV9V: [],
  '5YGG': [],
  '5U9M': [],
  '435P': [],
  CT4U: [],
  TVVW: [],
  D2GD: [],
  QU7A: [],
  A4Y6: [],
  T4WP: [],
  QP2P: [],
  '3EZB': [],
  WHTP: [],
  YX28: [],
  A5T2: [],
  ZNG5: [],
  F86U: [],
  '9S23': [],
  P2BU: [],
  PAQR: [],
  WVB4: [],
  MU7A: [],
  '7MN2': [],
  JW24: [],
  P6B7: [],
  XBM7: [],
  '737S': [],
  D4D8: [],
  JYVU: [],
  '7V9D': [],
  Y8CZ: [],
  JQJF: [],
  TGVE: [],
  CKSB: [],
  '6MNX': [],
  N2V6: [],
  YCEK: [],
  VPY8: [],
  P96J: [],
  DNB6: [],
  E7WC: [],
  C97Z: [],
  KD2Y: [],
  '58YY': [],
  A392: [],
  Z7MA: [],
  YBQA: [],
  RJZB: [],
  '458A': [],
  DX2G: [],
  TTTX: [],
  '6TTU': [],
  VXWS: [],
  '3N5X': [],
  M4PB: [],
  '4J38': [],
  BDBN: [],
  JX2G: [],
  '8Y8B': [],
  HTBE: [],
  XR8Q: [],
  GG2G: [],
  '93TE': [],
  R9C2: [],
  U2A7: [],
  C62H: [],
  '4WCE': [],
  E2M7: [],
  GYMV: [],
  M2GS: [],
  FMDX: [],
  DDQM: [],
  YZD3: [],
  '4TNT': [],
  YXBR: [],
  D6HZ: [],
  '4RTG': [],
  E33J: [],
  H9TP: [],
  UHPJ: [],
  '25EB': [],
  GB3X: [],
  Y88B: [],
  '52N4': [],
  YUX2: [],
  TEES: [],
  VH5Y: [],
  Q695: [],
  KQ3Q: [],
  WND3: [],
  B75G: [],
  ZKFD: [],
  TGYE: [],
  ND8S: [],
  G6X5: [],
  X8Y4: [],
  G6KH: [],
  JS8H: [],
  XXMZ: [],
  PPR4: [],
  UYCU: [],
  NDDM: [],
  DMEH: [],
  N74K: [],
  W98D: [],
  T3FB: [],
  V2FE: [],
  PG9S: [],
  BEGP: [],
  QP9T: [],
  '5U6S': [],
  SRS4: [],
  D3ZM: [],
  KNVB: [],
  '6GW6': [],
  '66PF': [],
  '9RZF': [],
  PB39: [],
  BZ2G: [],
  A5FV: [],
  '8CVW': [],
  DWXV: [],
  UDN3: [],
  TP85: [],
  AFR3: [],
  C5ZQ: [],
  UMK7: [],
  KGPB: [],
  T957: [],
  PH2J: [],
  CKY4: [],
  KTNT: [],
  A9CU: [],
  EJE5: [],
  MPPN: [],
  WMFD: [],
  G4QK: [],
  EGQH: [],
  Y3U6: [],
  '4WPG': [],
  P472: [],
  M9DM: [],
  WEK3: [],
  F7TC: [],
  '4JP4': [],
  '9NSG': [],
  FENZ: [],
  S45K: [],
  YN2Z: [],
  BMDA: [],
  ZGMF: [],
  ED3X: [],
  QPC3: [],
  BV8P: [],
  YU3S: [],
  YG6N: [],
  '3D77': [],
  CUCS: [],
  AW6H: [],
  '66E2': [],
  '4TXT': [],
  RPTQ: [],
  PVTF: [],
  '2BPN': [],
  RGXK: [],
  TAZT: [],
  KZHR: [],
  '84KK': [],
  PRWB: [],
  UDSS: [],
  PC62: [],
  YDQV: [],
  PEV8: [],
  '47K5': [],
  '7DK2': [],
  '858F': [],
  CTH4: [],
  CV8M: [],
  JBBX: [],
  '5UPG': [],
  N7FR: [],
  KZ76: [],
  XVM5: [],
  '2D3A': [],
  '5EKT': [],
  A5A2: [],
  CFQM: [],
  ZTE7: [],
  ZFT7: [],
  '4JYG': [],
  GUYX: [],
  QVFB: [],
  '5C7R': [],
  DB7W: [],
  A6H6: [],
  EF73: [],
  PZN3: [],
  EE8X: [],
  PTQQ: [],
  MVB8: [],
  DTQA: [],
  P4P5: [],
  '9N34': [],
  XMNP: [],
  N5A8: [],
  '8DHC': [],
  H9PM: [],
  ESN2: [],
  BB82: [],
  HZP8: [],
  '8WXR': [],
  Z9Y5: [],
  YBWK: [],
  '85B6': [],
  HNXE: [],
  KQXN: [],
  J6UR: [],
  V7F7: [],
  KNPX: [],
  T9SA: [],
  ZUQD: [],
  YFQC: [],
  '4NXQ': [],
  F3UC: [],
  FK5M: [],
  '2856': [],
  CY8Y: [],
  MKY5: [],
  '8WFR': [],
  '525W': [],
  E4TB: [],
  BP7A: [],
  '4ZKP': [],
  A7XP: [],
  BPHQ: [],
  EBYD: [],
  NY45: [],
  B7F7: [],
  '3AC2': [],
  VXTK: [],
  BTFR: [],
  '2FEG': [],
  '4BM3': [],
  VK58: [],
  BD6K: [],
  ZJ8T: [],
  W4G5: [],
  FXRS: [],
  JFMW: [],
  B2X7: [],
  HDYN: [],
  SFSN: [],
  UUS5: [],
  K6TS: [],
  MDFK: [],
  UMGU: [],
  FJTJ: [],
  QJGS: [],
  '232H': [],
  K7CG: [],
  XJC6: [],
  CQ9T: [],
  '3SU3': [],
  '3MYM': [],
  '43XJ': [],
  '88KX': [],
  HWKG: [],
  J9GT: [],
  YM7W: [],
  '7WXK': [],
  KXXW: [],
  '7WFD': [],
  '9DJN': [],
  E4KZ: [],
  '92PS': [],
  T3CP: [],
  '5NP7': [],
  E4EJ: [],
  RETE: [],
  N5VC: [],
  '5D68': [],
  AMC9: [],
  '26MM': [],
  U8NV: [],
  '2YKH': [],
  AU2W: [],
  Y4A9: [],
  '7GRJ': [],
  '3PP6': [],
  Q6BH: [],
  '9HYM': [],
  WC3J: [],
  SHHN: [],
  '6KX7': [],
  RVYA: [],
  '9N3G': [],
  DBXG: [],
  JXQA: [],
  '7RZT': [],
  MVYT: [],
  RX4N: [],
  '8TXS': [],
  Y6ER: [],
  GRAQ: [],
  XKHF: [],
  H6X3: [],
  U5U5: [],
  '3DQV': [],
  PUK7: [],
  '3SCH': [],
  '8SNU': [],
  T8MD: [],
  DFDC: [],
  R6KE: [],
  HB9N: [],
  '6XRW': [],
  JNMU: [],
  GKJJ: [],
  JDE5: [],
  DVVX: [],
}
