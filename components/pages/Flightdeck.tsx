import { useEffect, useState } from 'react'
import { flightdeckAccessKey } from '../../lib/storage/storage'
import { backend } from '../../backend'
import { LoadingScreen } from '../helper/LoadingScreen'
import { experimentDefs } from '../../lib/data/experimentDefs'
import type { QuestSerialFormat_MUST_STAY_COMPATIBLE } from '../../lib/state/types'
import clsx from 'clsx'
import { flightdeckTabs } from '../../lib/data/flightdeckTabs'
import { navigate } from '../../lib/commands/router'
import { useCore } from '../../lib/state/core'
import { formatEvent } from '../../lib/commands/experiment'

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
  title: string
  startTs: number
  endTs: number
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

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

type ExperimentStatus = 'preparation' | 'active' | 'completed'

function getExperimentStatus(startTs: number, endTs: number): ExperimentStatus {
  const now = Date.now()
  if (now < startTs) return 'preparation'
  if (now <= endTs) return 'active'
  return 'completed'
}

function formatPeriodTitle(startTs: number, endTs: number) {
  const fmt = (ts: number) =>
    new Date(ts).toLocaleDateString('de-DE') +
    ' ' +
    new Date(ts).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    })
  return fmt(startTs) + ' – ' + fmt(endTs)
}

export function Flightdeck() {
  const [karolSurvey, setKarolSurvey] = useState<KarolSurveyData>([])
  const [pythonSurvey, setPythonSurvey] = useState<PythonSurveyData>([])
  const [feedback, setFeedback] = useState<FeedbackData>([])
  const [shares, setShares] = useState<SharesData>([])
  const [experiments, setExperiments] = useState<ExperimentData>([])
  const [loading, setLoading] = useState(true)

  const core = useCore()
  const tab = core.ws.ui.flightdeckTab

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
          let counts = experimentCounts.get(exp.id)
          if (!counts) {
            counts = { cStart: 0, cEnd: 0, tStart: 0, tEnd: 0 }
          }
          experimentData.push({
            id: exp.id,
            title: exp.title,
            startTs: exp.startTs,
            endTs: exp.endTs,
            startEvent: formatEvent(exp.startEvent),
            endEvent: formatEvent(exp.endEvent),
            ...counts,
          })
        }
        experimentData.sort((a, b) => {
          const order = { preparation: 0, active: 1, completed: 2 } as const
          const statusA = getExperimentStatus(a.startTs, a.endTs)
          const statusB = getExperimentStatus(b.startTs, b.endTs)
          if (order[statusA] !== order[statusB]) {
            return order[statusA] - order[statusB]
          }
          if (statusA == 'active') {
            return a.endTs - b.endTs
          }
          if (statusA == 'completed') {
            return b.endTs - a.endTs
          }
          return a.id - b.id
        })
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
        <h1 className="mb-8">Welcome to the Flightdeck.</h1>
        {flightdeckTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              navigate(core, 'flightdeck#' + t.id)
            }}
            className={clsx(
              'px-3 pb-1 transition-colors',
              tab == t.id
                ? 'text-gray-800 border-b-2 border-fuchsia-500 -mb-px'
                : 'text-gray-400 hover:text-gray-600',
            )}
          >
            {t.label}
          </button>
        ))}
        {tab == 'karol' && (
          <>
            <p className="small text-gray-500 ml-12 mt-8">
              Welche Aufgabe/Feature hat dir am meisten Spaß gemacht – und
              warum?
            </p>
            <p className="small text-gray-500 ml-12 mb-8">
              Was würdest du an Robot Karol verbessern?
            </p>
            {karolSurvey.map((entry) => (
              <p className="ml-8 mb-2">
                <span className="text-gray-500">
                  {new Date(entry.ts).toLocaleString()}
                </span>
                <span className="ml-3">{entry.fun}</span>
                <span className="mx-4">•</span>
                <span className="text-pink-400">{entry.improve}</span>
              </p>
            ))}
          </>
        )}
        {tab == 'python' && (
          <>
            <p className="small text-gray-500 ml-12 mt-8">
              Was gefällt dir am Python-Lernpfad besonders?
            </p>
            <p className="small text-gray-500 ml-12 mb-8">
              Würdest du etwas am Python-Lernpfad verbessern?
            </p>
            {pythonSurvey.map((entry) => (
              <p className="ml-8 mb-2">
                <span className="text-gray-500">
                  {new Date(entry.ts).toLocaleString()}
                </span>
                <span className="ml-3">{entry.fun}</span>
                <span className="mx-4">•</span>
                <span className="text-pink-400">{entry.improve}</span>
              </p>
            ))}
          </>
        )}
        {tab == 'feedback' && (
          <>
            <p className="small text-gray-500 ml-12 mt-8 mb-8">
              Wie können wir Robot Karol Online für dich besser gestalten?
            </p>
            {feedback.map((entry) => (
              <p className="ml-8 mb-2">
                <span className="text-gray-500">
                  {new Date(entry.ts).toLocaleString()}
                </span>
                <span className="ml-3">{entry.feedback}</span>
              </p>
            ))}
          </>
        )}
        {tab == 'freigaben' && (
          <div className="mt-8">
            {shares.map((entry) => (
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
          </div>
        )}
        {tab == 'ab' && (
          <>
            <div className="ml-8 mt-8">
              <table className="text-sm w-full">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pr-4">ID</th>
                    <th className="pr-4">Status</th>
                    <th className="pr-4">Titel</th>
                    <th className="pr-4">Events</th>
                    <th className="pr-4">START/END/RATE</th>
                    <th className="pr-4">Uplift (95%-KI)</th>
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
                    const status = getExperimentStatus(
                      entry.startTs,
                      entry.endTs,
                    )
                    return (
                      <tr key={entry.id} className="border-t align-top">
                        <td className="pr-4 py-1">{entry.id}</td>
                        <td
                          className="pr-4 py-1 whitespace-nowrap"
                          title={formatPeriodTitle(entry.startTs, entry.endTs)}
                        >
                          {status == 'preparation' && (
                            <>
                              <span className="text-yellow-600">
                                in Vorbereitung
                              </span>
                              <br />
                              startet am{' '}
                              {new Date(entry.startTs).toLocaleDateString(
                                'de-DE',
                              )}
                            </>
                          )}
                          {status == 'active' && (
                            <>
                              <span className="text-green-600">aktiv</span>
                              <br />
                              Woche{' '}
                              {Math.floor(
                                (Date.now() - entry.startTs) / WEEK_MS,
                              ) + 1}{' '}
                              /{' '}
                              {Math.round(
                                (entry.endTs - entry.startTs) / WEEK_MS,
                              )}
                            </>
                          )}
                          {status == 'completed' && (
                            <>
                              <span className="text-blue-600">
                                abgeschlossen
                              </span>
                              <br />
                              {Math.round(
                                (entry.endTs - entry.startTs) / WEEK_MS,
                              )}{' '}
                              Wochen
                            </>
                          )}
                        </td>
                        <td className="pr-4 py-1">{entry.title}</td>
                        <td className="pr-4 py-1 whitespace-nowrap">
                          <span className="text-gray-500">START:</span>{' '}
                          {entry.startEvent}
                          <br />
                          <span className="text-gray-500">END:</span>{' '}
                          {entry.endEvent}
                        </td>
                        <td className="pr-4 py-1 whitespace-nowrap">
                          C: {entry.cStart} / {entry.cEnd} /{' '}
                          {r ? formatPct(r.cRate) : '–'}
                          <br />
                          T: {entry.tStart} / {entry.tEnd} /{' '}
                          {r ? formatPct(r.tRate) : '–'}
                        </td>
                        <td className="pr-4 py-1 whitespace-nowrap">
                          {r ? (
                            <>
                              {formatPct(r.uplift)}
                              <br />
                              <span className="text-gray-500">
                                {'(' +
                                  formatPct(r.lo) +
                                  ' | ' +
                                  formatPct(r.hi) +
                                  ')'}
                              </span>
                            </>
                          ) : (
                            '–'
                          )}
                        </td>
                        <td className="text-right pr-4 py-1">
                          {r ? formatP(r.p) : '–'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p className="mt-[300px]">
                TODO: Nachvollziehbare Dokumentation der Experimente
              </p>
            </div>
          </>
        )}
        <div className="h-[300px]"></div>
      </div>
    </div>
  )
}
