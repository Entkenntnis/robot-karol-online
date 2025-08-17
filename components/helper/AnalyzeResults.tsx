import { useCore } from '../../lib/state/core'
import { questData } from '../../lib/data/quests'
import { levels as karolmaniaLevels } from '../../lib/data/karolmaniaLevels' // Import level data
import clsx from 'clsx'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { FaIcon } from './FaIcon'
import { faCopy } from '@fortawesome/free-solid-svg-icons'

// Helper function to format time in seconds to MM:SS:hh
function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const hundredths = Math.floor((seconds * 100) % 100)

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(
    2,
    '0'
  )}:${String(hundredths).padStart(2, '0')}`
}

// Helper function to calculate median
function calculateMedian(arr: number[]) {
  if (!arr || arr.length === 0) return 0
  const sortedArr = [...arr].sort((a, b) => a - b)
  const middle = Math.floor(sortedArr.length / 2)
  if (sortedArr.length % 2 === 0) {
    return (sortedArr[middle - 1] + sortedArr[middle]) / 2
  } else {
    return sortedArr[middle]
  }
}

// Helper function to calculate average
function calculateAverage(arr: number[]) {
  if (!arr || arr.length === 0) return 0
  const sum = arr.reduce((acc, val) => acc + val, 0)
  return sum / arr.length
}

// Create a map for quick lookup of level metadata by ID
const levelMap = new Map(karolmaniaLevels.map((level) => [level.id, level]))

export function AnalyzeResults() {
  const core = useCore()
  const customQuests = Object.entries(core.ws.analyze.customQuests)
  customQuests.sort((a, b) => b[1].start - a[1].start)

  const stats = Object.entries(core.ws.analyze.newEventStats.stats)
  stats.sort(
    (a, b) => b[1].sessions * b[1].average - a[1].sessions * a[1].average
  )
  const survey = core.ws.analyze.survey.slice(0)
  survey.sort((a, b) => b.ts - a.ts)

  // Process Karolmania data
  const karolmaniaData = Object.entries(core.ws.analyze.karolmania)
    .map(([levelIdStr, data]) => {
      const levelId = parseInt(levelIdStr, 10)
      const levelInfo = levelMap.get(levelId)
      const times = data.times || []
      const bestTime = times.length > 0 ? Math.min(...times) : null

      return {
        id: levelId,
        title: levelInfo?.quest.title || `Level ${levelId}`,
        count: data.times.length || 0,
        times: times,
        medianTime: calculateMedian(times),
        averageTime: calculateAverage(times),
        bestTime: bestTime,
        medalTimes: levelInfo
          ? {
              at: levelInfo.at,
              gold: levelInfo.gold,
              silver: levelInfo.silver,
              bronze: levelInfo.bronze,
            }
          : null,
      }
    })
    .sort((a, b) => b.count - a.count) // Sort by play count descending

  function ppStat(name: string) {
    const data = core.ws.analyze.newEventStats.stats[name]
    if (!data) return <>--</>
    return (
      <>
        <strong>{data.sessions}</strong> (x
        {data.average.toLocaleString('de-DE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        )
      </>
    )
  }

  return (
    <div className="bg-white px-16 pb-8 mt-4">
      <p className="my-6">
        Daten ab {core.ws.analyze.cutoff}, insgesamt {core.ws.analyze.count}{' '}
        Einträge
      </p>
      <h2 className="mt-6 mb-4 text-lg">Nutzungshäufigkeit</h2>
      <p>{core.ws.analyze.newEventStats.uniqueUsers} Sessions analysiert</p>
      <table className="w-full my-4 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left border border-gray-300">Funktion</th>
            <th className="p-2 text-left border border-gray-300">Sessions</th>
            <th className="p-2 text-left border border-gray-300">
              Nutzungen pro Session
            </th>
          </tr>
        </thead>
        <tbody>
          {stats.map(([key, data]) => (
            <tr key={key} className="hover:bg-gray-50">
              <td className="p-2 border border-gray-300">{key}</td>
              <td className="p-2 border border-gray-300">{data.sessions}</td>
              <td className="p-2 border border-gray-300">
                {data.average.toLocaleString('de-DE', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="mt-6 mb-4 text-lg">Landing-Page Heatmap</h2>
      <p>Aufrufe: {ppStat('ev_show_hash_')}</p>
      <p className="mt-2">(Login): {ppStat('ev_click_landing_login')}</p>
      <p>Spenden: {ppStat('ev_click_landing_donate')}</p>
      <p className="mt-2">
        Spielwiese: {ppStat('ev_click_landing_playground')}
      </p>
      <p>Editor: {ppStat('ev_click_landing_editor')}</p>
      <p>-- Liste aller Aufgaben: {ppStat('ev_click_landing_listOfAll')}</p>
      <p>
        -- Fortschritt speichern: {ppStat('ev_click_landing_exportProgress')}
      </p>
      <p>-- Fortschritt laden: {ppStat('ev_click_landing_importProgress')}</p>
      <p>-- Python-Lernpfad: {ppStat('ev_click_landing_promotePython')}</p>
      <p>-- Profil: {ppStat('ev_click_landing_profile')}</p>
      <p className="mt-2">Name gesetzt: {ppStat('set_name_*')}</p>
      <p>^---- Schild: {ppStat('ev_click_landing_tourStart')}</p>
      <p>Figur zeichnen: {ppStat('ev_click_landing_appearance')}</p>
      <p className="mt-2">
        Figuren-Galerie: {ppStat('ev_click_landing_robotGallery')}
      </p>
      <p>Aufgaben-Galerie: {ppStat('ev_click_landing_gallery')}</p>
      <p>Karolmania: {ppStat('ev_click_landing_karolmania')}</p>
      <p>Material für Lehrkräfte: {ppStat('ev_click_landing_material')}</p>
      <p>Video-Erklärungen: {ppStat('ev_click_landing_video')}</p>
      <p>Dokumentation: {ppStat('ev_click_landing_docs')}</p>
      <p>Englisch: {ppStat('ev_click_landing_english')}</p>
      <p>Deutsch: {ppStat('ev_click_landing_german')}</p>
      <p>Herz: {ppStat('ev_click_landing_spawnHeart')}</p>
      <p>Dance, Dance: {ppStat('ev_click_landing_dancedance')}</p>
      <p className="mt-2">
        Alles ist scheiße:{' '}
        <strong>{core.ws.analyze.chapters[10001].explanation}</strong>
      </p>
      <p>Python-Teaser: {ppStat('ev_click_landing_pythonIntro')}</p>
      <p>Python-Übersicht: {ppStat('ev_click_landing_pythonListing')}</p>
      <p className="mt-2">
        Toggle Mini-Projekte: {ppStat('ev_click_landing_toggleMiniProjects')}
      </p>
      <p>rko-Dokumentation: {ppStat('ev_click_landing_moduleDocs')}</p>
      <p className="mt-2">
        Hack The Web: {ppStat('ev_click_landing_hacktheweb')}
      </p>
      <p>Einhorn der Mathematik: {ppStat('ev_click_landing_einhorn')}</p>
      <p>Impressum: {ppStat('ev_click_landing_impressum')}</p>
      <p>Datenschutz: {ppStat('ev_click_landing_privacy')}</p>
      <p>Blog: {ppStat('ev_click_landing_blog')}</p>
      <h2 className="mt-6 mb-4 text-lg">Freigegebene Aufgaben</h2>
      {core.ws.analyze.published.map((entry, i) => (
        <span key={i} className="inline-block mr-6">
          <a
            href={`/#${entry.id}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 hover:underline"
          >
            {entry.id}
          </a>{' '}
          - {entry.date}
        </span>
      ))}
      <h2 className="mt-6 mb-4 text-lg">Umfrage</h2>
      <div className="text-xs text-gray-500 mb-4">
        Das Ziel jeder Aufgabe war für mich klar verständlich._Es war einfach,
        Fehler in meinem Code zu finden._Ich würde Robot Karol einer FreundIn
        empfehlen._Dürfen wir deine Antworten in einer öffentlichen Statistik
        zeigen?_Was würdest du an Robot Karol verbessern?_Welche Aufgabe/Feature
        hat dir am meisten Spaß gemacht – und warum?
      </div>
      <div>
        {survey.map((entry, i) => (
          <p key={i} className="mb-1 break-all">
            <span className="text-gray-400 mr-3">
              {new Date(entry.ts).toLocaleString('de-DE')}
            </span>{' '}
            {entry.value}
          </p>
        ))}
      </div>
      <h2 className="mt-6 mb-4 text-lg">Fragen</h2>
      {Object.entries(core.ws.analyze.questions)
        .sort((a, b) => b[1].questions.length - a[1].questions.length)
        .map(([id, data]) => {
          const questTitle = questData[parseInt(id)]?.title || id
          return (
            <div key={id} className="mb-4">
              <h3 className="font-medium">
                {questTitle} ({data.questions.length} Fragen)
              </h3>
              <div className="pl-4">
                {data.questions
                  .slice(0)
                  .sort((a, b) => b.ts - a.ts)
                  .map((q, i) => (
                    <p
                      key={i}
                      className={clsx(
                        'text-sm text-gray-600 mb-1',
                        core.ws.analyze.markedQuestions.includes(
                          `${id}-${q.ts}`
                        ) && 'line-through opacity-40'
                      )}
                    >
                      <input
                        type="checkbox"
                        className={clsx(
                          'mr-3',
                          core.ws.analyze.markedQuestions.includes(
                            `${id}-${q.ts}`
                          ) && 'hidden'
                        )}
                        disabled={window.location.host !== 'karol.arrrg.de'}
                        onChange={(e) => {
                          if (e.target.checked) {
                            core.mutateWs((ws) => {
                              ws.analyze.markedQuestions.push(`${id}-${q.ts}`)
                            })
                            submitAnalyzeEvent(
                              core,
                              `ev_markQuestion_${id}-${q.ts}`
                            )
                          }
                        }}
                      />
                      <span className="text-gray-400 mr-3">
                        {new Date(q.ts).toLocaleString('de-DE')}
                      </span>
                      {JSON.parse(q.text)}{' '}
                      {(() => {
                        const input = JSON.parse(q.text)
                        // (Sprache: blocks, Programm: ... )
                        // use regex to extract the program
                        const match = input.match(
                          /\(Sprache: .+?, Programm: ([\s\S]+)\)$/
                        )

                        if (match && match[1]) {
                          return (
                            <button
                              className="text-gray-300"
                              onClick={() => {
                                // Copy the program to clipboard
                                navigator.clipboard.writeText(match[1])
                              }}
                            >
                              <FaIcon icon={faCopy} />
                            </button>
                          )
                        }
                      })()}
                    </p>
                  ))}
              </div>
            </div>
          )
        })}
      <h2 className="mt-6 mb-4 text-lg">Python Example Levenshtein</h2>
      <table className="w-full my-4 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left border border-gray-300">Name</th>
            <th className="p-2 text-left border border-gray-300">
              Count / Sessions
            </th>
            <th className="p-2 text-left border border-gray-300">
              Distances (distance×count)
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(core.ws.analyze.pythonExampleLevenshtein)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([name, data]) => {
              // Group and count distances
              const freqMap = new Map<number, number>()
              for (const d of data.distances) {
                freqMap.set(d, (freqMap.get(d) || 0) + 1)
              }
              const grouped = Array.from(freqMap.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([distance, count]) => `${distance} (×${count})`)
                .join(', ')
              return (
                <tr key={name} className="hover:bg-gray-50">
                  <td className="p-2 border border-gray-300">{name}</td>
                  <td className="p-2 border border-gray-300">
                    {data.count} / {data.sessions.length}
                  </td>
                  <td className="p-2 border border-gray-300">{grouped}</td>
                </tr>
              )
            })}
        </tbody>
      </table>
      <h2 className="mt-6 mb-4 text-lg">Geladene Figur</h2>
      <p>
        {(() => {
          const loadedRobotImages = Object.entries(
            core.ws.analyze.loadedRobotImages
          )
          loadedRobotImages.sort((a, b) => b[1].count - a[1].count)

          return loadedRobotImages.map((entry) => (
            <span key={entry[0]} className="inline-block mr-3">
              {entry[0]} (x
              {entry[1].count})
            </span>
          ))
        })()}
      </p>
      <h2 className="mt-6 mb-4 text-lg">Bearbeitungen</h2>
      {customQuests.map((entry, i) => (
        <span key={i} className="inline-block mr-6">
          <a
            href={`/#${entry[0]}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 hover:underline"
          >
            {entry[0]}
          </a>{' '}
          - {entry[1].start} mal gestartet, {entry[1].complete} mal
          abgeschlossen
        </span>
      ))}
      <h2 className="mt-6 mb-4 text-lg">Karolmania Results</h2>
      {karolmaniaData.length > 0 ? (
        <table className="w-full my-4 border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left border border-gray-300">Level</th>
              <th className="p-2 text-left border border-gray-300">
                Play Count
              </th>
              <th className="p-2 text-left border border-gray-300">
                Median Time
              </th>
              <th className="p-2 text-left border border-gray-300">
                Average Time
              </th>
              <th className="p-2 text-left border border-gray-300">
                Best Time
              </th>
              <th className="p-2 text-left border border-gray-300">
                Medals (AT/G/S/B)
              </th>
            </tr>
          </thead>
          <tbody>
            {karolmaniaData.map((levelData) => (
              <tr key={levelData.id} className="hover:bg-gray-50">
                <td className="p-2 border border-gray-300">
                  {levelData.title}
                </td>
                <td className="p-2 border border-gray-300">
                  {levelData.count}
                </td>
                <td className="p-2 border border-gray-300">
                  {levelData.times.length > 0
                    ? formatTime(levelData.medianTime)
                    : '-'}
                </td>
                <td className="p-2 border border-gray-300">
                  {levelData.times.length > 0
                    ? formatTime(levelData.averageTime)
                    : '-'}
                </td>
                <td className="p-2 border border-gray-300">
                  {levelData.bestTime !== null
                    ? formatTime(levelData.bestTime)
                    : '-'}
                </td>
                <td className="p-2 border border-gray-300">
                  {levelData.medalTimes
                    ? `${formatTime(levelData.medalTimes.at)} / ${formatTime(
                        levelData.medalTimes.gold
                      )} / ${formatTime(
                        levelData.medalTimes.silver
                      )} / ${formatTime(levelData.medalTimes.bronze)}`
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No Karolmania data available.</p>
      )}
      <h2 className="mt-6 mb-4 text-lg">Legacy</h2>{' '}
      {Object.entries(core.ws.analyze.legacy).map((entry, i) => (
        <span key={i} className="inline-block mr-6">
          <a
            href={`/?id=${entry[0]}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 hover:underline"
          >
            {entry[0]}
          </a>{' '}
          - {entry[1].count} mal gestartet
        </span>
      ))}
      <table className="w-full my-4 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left border border-gray-300">Song</th>
            <th className="p-2 text-left border border-gray-300">Scores</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(core.ws.analyze.danceScores)
            .sort((a, b) => b[1].scores.length - a[1].scores.length)
            .map(([songName, data]) => {
              const scores = data.scores.slice(0)
              scores.sort((a, b) => b - a) // Sort scores descending

              return (
                <tr key={songName} className="hover:bg-gray-50">
                  <td className="p-2 border border-gray-300">{songName}</td>
                  <td className="p-2 border border-gray-300">
                    {scores.join(', ')}
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
      <h2 className="mt-6 mb-4 text-lg">Zeiten</h2>
      <p className="mb-2">
        Median: {format(median(core.ws.analyze.userTimes))}
      </p>
    </div>
  )
}

function median(arr: number[]) {
  const middle = Math.floor(arr.length / 2)
  if (arr.length % 2 === 0) {
    return (arr[middle - 1] + arr[middle]) / 2
  } else {
    return arr[middle]
  }
}

function format(t: number) {
  const s = Math.round(t / 1000)
  if (s < 60) {
    return `${s} s`
  }
  const m = Math.round(s / 60)
  if (m < 120) {
    return `${m} min`
  }
  const h = Math.round(m / 60)
  if (h < 48) {
    return `${h} h`
  }
  const d = Math.round(h / 24)
  return `${d} Tage`
}
