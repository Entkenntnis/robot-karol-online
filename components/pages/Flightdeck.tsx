import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { flightdeckAccessKey } from '../../lib/storage/storage'
import { backend } from '../../backend'
import { LoadingScreen } from '../helper/LoadingScreen'
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
        void shares

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
        <div className="h-[300px]"></div>
      </div>
    </div>
  )
}
