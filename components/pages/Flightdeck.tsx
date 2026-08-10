import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { flightdeckAccessKey } from '../../lib/storage/storage'
import { backend } from '../../backend'
import { LoadingScreen } from '../helper/LoadingScreen'
import { experimentDefs } from '../../lib/data/experimentDefs'
import type { QuestSerialFormat_MUST_STAY_COMPATIBLE } from '../../lib/state/types'

type KarolSurveyData = {
  fun: string
  improve: string
  ts: number
}[]

type PythonSurveyData = {
  fun: string
  improve: string
  ts: number
}[]

type FeedbackData = {
  feedback: string
  ts: number
}[]

type SharesData = {
  title: string
  id: string
  ts: number
}[]

type ExperimentData = {
  id: number
  description: string
  startEvent: string
  endEvent: string
  cStart: number
  cEnd: number
  tStart: number
  tEnd: number
}[]

type ExperimentRates = {
  cRate: number
  tRate: number
  uplift: number
  lo: number
  hi: number
  p: number
}

// Standard normal CDF via erfc (Abramowitz & Stegun 7.1.26)
function erfc(x: number) {
  const z = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * z)
  const t2 = t * t
  const t3 = t2 * t
  const t4 = t3 * t
  const t5 = t4 * t
  const y =
    t *
    (0.254829592 * t -
      0.284496736 * t2 +
      1.421413741 * t3 -
      1.453152027 * t4 +
      1.061405429 * t5)
  const result = Math.exp(-z * z) * y
  return x >= 0 ? result : 2 - result
}

function normalCdf(x: number) {
  return 0.5 * erfc(-x / Math.SQRT2)
}

function computeRates(
  cStart: number,
  cEnd: number,
  tStart: number,
  tEnd: number,
): ExperimentRates | null {
  if (cStart == 0 || tStart == 0) return null
  const pC = cEnd / cStart
  const pT = tEnd / tStart
  if (pC == 0 || pT == 0) return null
  const rr = pT / pC
  const se = Math.sqrt((1 - pC) / (cStart * pC) + (1 - pT) / (tStart * pT))
  const z = Math.log(rr) / se
  return {
    cRate: pC,
    tRate: pT,
    uplift: rr - 1,
    lo: Math.exp(Math.log(rr) - 1.96 * se) - 1,
    hi: Math.exp(Math.log(rr) + 1.96 * se) - 1,
    p: 2 * (1 - normalCdf(Math.abs(z))),
  }
}

function formatPct(value: number) {
  return (value * 100).toFixed(1) + '%'
}

function formatP(value: number) {
  return value < 0.001 ? '<0.001' : value.toFixed(3)
}

function IncrementalList({
  items,
  step = 10,
}: {
  items: ReactNode[]
  step?: number
}) {
  const [visible, setVisible] = useState(step)
  const remaining = items.length - visible
  return (
    <>
      {items.slice(0, visible).map((item, i) => (
        <Fragment key={i}>{item}</Fragment>
      ))}
      {remaining > 0 && (
        <button
          className="ml-8 italic text-sm hover:underline text-gray-500"
          onClick={() => setVisible((v) => v + step)}
        >
          Mehr anzeigen
        </button>
      )}
    </>
  )
}

export function Flightdeck() {
  const [karolSurvey, setKarolSurvey] = useState<KarolSurveyData>([])
  const [pythonSurvey, setPythonSurvey] = useState<PythonSurveyData>([])
  const [feedback, setFeedback] = useState<FeedbackData>([])
  const [shares, setShares] = useState<SharesData>([])
  const [experiments, setExperiments] = useState<ExperimentData>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      let key = localStorage.getItem(flightdeckAccessKey)
      while (key === null) {
        key = prompt('Zugangscode für das Flightdeck:')
        if (key) {
          localStorage.setItem(flightdeckAccessKey, key)
        }
      }
      try {
        const resp1 = await fetch(
          backend.exportEndpoint + '/persistent_events',
          {
            headers: { Authorization: 'Bearer ' + key },
          },
        )
        const persistent_data = (await resp1.json()) as {
          id: number
          key: string
          value: string
          createdAt: string
        }[]
        const resp2 = await fetch(backend.exportEndpoint + '/shares', {
          headers: { Authorization: 'Bearer ' + key },
        })
        const shares = (await resp2.json()) as {
          id: number
          publicId: string
          content: string
          createdAt: string
        }[]
        const resp3 = await fetch(backend.exportEndpoint + '/experiments', {
          headers: { Authorization: 'Bearer ' + key },
        })
        const rawExperiments = (await resp3.json()) as {
          id: string
          event: string
          createdAt: string
        }[]

        // Womit fande ich denn am besten an? Karol-Umfrage wahrscheinlich.
        const karolSurveyData: KarolSurveyData = []
        const pythonSurveyData: PythonSurveyData = []
        const feedbackData: FeedbackData = []
        for (const entry of persistent_data) {
          if (entry.key == 'karol-survey') {
            const parts = entry.value.split('_')
            if (parts.length !== 6) {
              console.log('! Karol Umfrage fehlerhaft: ' + entry.value)
              continue
            }
            // Mich interessieren "eigentlich" erstmal nur die Wortmeldungen
            karolSurveyData.push({
              fun: parts[5],
              improve: parts[4],
              ts: new Date(entry.createdAt).getTime(),
            })
          } else if (entry.key == 'python-survey') {
            const parts = entry.value.split('_')
            if (parts.length !== 2) {
              console.log('! Python Umfrage fehlerhaft: ' + entry.value)
              continue
            }
            pythonSurveyData.push({
              fun: parts[1],
              improve: parts[0],
              ts: new Date(entry.createdAt).getTime(),
            })
          } else if (entry.key == 'landing-feedback') {
            feedbackData.push({
              feedback: entry.value,
              ts: new Date(entry.createdAt).getTime(),
            })
          } else {
            console.log('! Unbekannter Eintrag:')
            console.log(entry)
          }
        }
        karolSurveyData.sort((a, b) => b.ts - a.ts)
        setKarolSurvey(karolSurveyData)
        pythonSurveyData.sort((a, b) => b.ts - a.ts)
        setPythonSurvey(pythonSurveyData)
        feedbackData.sort((a, b) => b.ts - a.ts)
        setFeedback(feedbackData)

        const sharesData: SharesData = []
        for (const share of shares) {
          try {
            const quest = JSON.parse(
              share.content,
            ) as QuestSerialFormat_MUST_STAY_COMPATIBLE
            sharesData.push({
              title: quest.title,
              id: share.publicId,
              ts: new Date(share.createdAt).getTime(),
            })
          } catch (e) {}
        }
        sharesData.sort((a, b) => b.ts - a.ts)
        setShares(sharesData)

        const experimentCounts = new Map<
          number,
          { cStart: number; cEnd: number; tStart: number; tEnd: number }
        >()
        for (const entry of rawExperiments) {
          const parts = entry.event.split('-')
          if (parts.length !== 3) continue
          const id = parseInt(parts[0], 10)
          const group = parts[1]
          const type = parts[2]
          const counts = experimentCounts.get(id) ?? {
            cStart: 0,
            cEnd: 0,
            tStart: 0,
            tEnd: 0,
          }
          if (group == 'C' && type == 'START') counts.cStart++
          else if (group == 'C' && type == 'END') counts.cEnd++
          else if (group == 'T' && type == 'START') counts.tStart++
          else if (group == 'T' && type == 'END') counts.tEnd++
          experimentCounts.set(id, counts)
        }
        const experimentData: ExperimentData = []
        for (const exp of experimentDefs) {
          const counts = experimentCounts.get(exp.id)
          if (!counts) continue
          experimentData.push({
            id: exp.id,
            description: exp.description,
            startEvent: exp.startEvent,
            endEvent: exp.endEvent,
            ...counts,
          })
        }
        experimentData.sort((a, b) => a.id - b.id)
        setExperiments(experimentData)
      } catch (e) {
        alert('Fehler!')
        localStorage.removeItem(flightdeckAccessKey)
      }

      setLoading(false)
    })()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="bg-fuchsia-500 h-full w-full overflow-auto">
      <div className="mx-auto max-w-[1200px] p-4 bg-white">
        <h1>Welcome to the Flightdeck.</h1>
        <h2 className="mt-16 ml-4">Karol-Umfrage</h2>
        <p className="small text-gray-500 ml-12 mt-2">
          Welche Aufgabe/Feature hat dir am meisten Spaß gemacht – und warum?
        </p>
        <p className="small text-gray-500 ml-12 mb-4">
          Was würdest du an Robot Karol verbessern?
        </p>
        <IncrementalList
          items={karolSurvey.map((entry) => (
            <p className="ml-8 mb-2">
              <span className="text-gray-500">
                {new Date(entry.ts).toLocaleString()}
              </span>
              <span className="ml-3">{entry.fun}</span>
              <span className="mx-4">•</span>
              <span className="text-pink-400">{entry.improve}</span>
            </p>
          ))}
        />
        <h2 className="mt-16 ml-4">Python-Umfrage</h2>
        <p className="small text-gray-500 ml-12 mt-2">
          Was gefällt dir am Python-Lernpfad besonders?
        </p>
        <p className="small text-gray-500 ml-12 mb-4">
          Würdest du etwas am Python-Lernpfad verbessern?
        </p>
        <IncrementalList
          items={pythonSurvey.map((entry) => (
            <p className="ml-8 mb-2">
              <span className="text-gray-500">
                {new Date(entry.ts).toLocaleString()}
              </span>
              <span className="ml-3">{entry.fun}</span>
              <span className="mx-4">•</span>
              <span className="text-pink-400">{entry.improve}</span>
            </p>
          ))}
        />
        <h2 className="mt-16 ml-4">Feedback</h2>
        <p className="small text-gray-500 ml-12 mt-2 mb-4">
          Wie können wir Robot Karol Online für dich besser gestalten?
        </p>
        <IncrementalList
          items={feedback.map((entry) => (
            <p className="ml-8 mb-2">
              <span className="text-gray-500">
                {new Date(entry.ts).toLocaleString()}
              </span>
              <span className="ml-3">{entry.feedback}</span>
            </p>
          ))}
        />
        <h2 className="mt-16 ml-4 mb-4">Freigegebene Aufgaben</h2>
        <IncrementalList
          items={shares.map((entry) => (
            <p className="ml-8 mb-2">
              <span className="text-gray-500">
                {new Date(entry.ts).toLocaleString()}
              </span>
              <span className="ml-3">{entry.title}</span>
              <a className="link ml-4" target="_blank" href={'/#' + entry.id}>
                {entry.id}
              </a>
            </p>
          ))}
        />
        <h2 className="mt-16 ml-4 mb-4">A/B-Tests</h2>
        <div className="ml-8">
          <table className="text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pr-4">ID</th>
                <th className="pr-4">Beschreibung</th>
                <th className="pr-4">Start-Event</th>
                <th className="pr-4">End-Event</th>
                <th className="text-right pr-4">C-START</th>
                <th className="text-right pr-4">C-END</th>
                <th className="text-right pr-4">T-START</th>
                <th className="text-right pr-4">T-END</th>
                <th className="text-right pr-4">C-Rate</th>
                <th className="text-right pr-4">T-Rate</th>
                <th className="text-right pr-4">Uplift (95%-KI)</th>
                <th className="text-right pr-4">p-Wert</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((entry) => {
                const r = computeRates(
                  entry.cStart,
                  entry.cEnd,
                  entry.tStart,
                  entry.tEnd,
                )
                return (
                  <tr key={entry.id} className="border-t">
                    <td className="pr-4 py-1">{entry.id}</td>
                    <td className="pr-4 py-1">{entry.description}</td>
                    <td className="pr-4 py-1">{entry.startEvent}</td>
                    <td className="pr-4 py-1">{entry.endEvent}</td>
                    <td className="text-right pr-4 py-1">{entry.cStart}</td>
                    <td className="text-right pr-4 py-1">{entry.cEnd}</td>
                    <td className="text-right pr-4 py-1">{entry.tStart}</td>
                    <td className="text-right pr-4 py-1">{entry.tEnd}</td>
                    <td className="text-right pr-4 py-1">
                      {r ? formatPct(r.cRate) : '–'}
                    </td>
                    <td className="text-right pr-4 py-1">
                      {r ? formatPct(r.tRate) : '–'}
                    </td>
                    <td className="text-right pr-4 py-1">
                      {r
                        ? formatPct(r.uplift) +
                          ' [' +
                          formatPct(r.lo) +
                          ';' +
                          formatPct(r.hi) +
                          ']'
                        : '–'}
                    </td>
                    <td className="text-right pr-4 py-1">
                      {r ? formatP(r.p) : '–'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="h-[300px]"></div>
      </div>
    </div>
  )
}
