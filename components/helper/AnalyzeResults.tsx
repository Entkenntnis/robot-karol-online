import { appearanceRegistry } from '../../lib/data/appearance'
import { useCore } from '../../lib/state/core'

export function AnalyzeResults() {
  const core = useCore()
  const customQuests = Object.entries(core.ws.analyze.customQuests)
  customQuests.sort((a, b) => b[1].start - a[1].start)

  const stats = Object.entries(core.ws.analyze.newEventStats.stats)
  stats.sort((a, b) => b[1].sessions - a[1].sessions)
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
            <th className="p-2 text-left border border-gray-300">Nutzungen</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(([key, data]) => (
            <tr key={key} className="hover:bg-gray-50">
              <td className="p-2 border border-gray-300">{key}</td>
              <td className="p-2 border border-gray-300">{data.sessions}</td>
              <td className="p-2 border border-gray-300">-</td>
            </tr>
          ))}
        </tbody>
      </table>
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
      {/*<p className="mt-6 mb-4">
        {core.ws.analyze.showEditor} mal Editor angezeigt,{' '}
        {core.ws.analyze.showPlayground} mal Spielwiese,{' '}
        {core.ws.analyze.showHighscore} mal Highscore,{' '}
        {core.ws.analyze.showDemo} mal Demo, {core.ws.analyze.showStructogram}{' '}
        mal Struktogramm, {core.ws.analyze.usePersist} mal Fortschritt
        gespeichert, {core.ws.analyze.useJava} mal Java verwendet,{' '}
        {core.ws.analyze.usePython} mal Python verwendet,{' '}
        {core.ws.analyze.playSnake} mal Snake gespielt, {core.ws.analyze.lngEn}{' '}
        mal Englisch ausgewählt, {core.ws.analyze.proMode} mal Profi-Modus
        aktiviert, {core.ws.analyze.limitEditOptions} mal Eingabeoptionen
        eingeschränkt, {core.ws.analyze.showQuestList} mal Liste aller Aufgaben
        angezeigt, {core.ws.analyze.showMaterials} mal Material für Lehrkräfte
        geöffnet, {core.ws.analyze.showInspiration} mal inspiriert
      </p>*/}
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
      <h2 className="mt-6 mb-4 text-lg">Aussehen</h2>
      <p>
        {(() => {
          const appearance = Object.entries(core.ws.analyze.appearance)
          appearance.sort((a, b) => b[1].count - a[1].count)

          return appearance.map((entry) => (
            <span key={entry[0]} className="inline-block mr-3">
              {entry[0]}:{appearanceRegistry[parseInt(entry[0])].type}-
              {appearanceRegistry[parseInt(entry[0])].title} (x
              {entry[1].count})
            </span>
          ))
        })()}
      </p>
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
      <h2 className="mt-6 mb-4 text-lg">Zeiten</h2>
      <p className="mb-2">
        Median: {format(median(core.ws.analyze.userTimes))}
      </p>
      {/*<p>{core.ws.analyze.userTimes.map(format).join(', ')}</p>*/}
      {/*<h2 className="mt-6 mb-4 text-lg">Anzahl gelöste Aufgaben</h2>
                <p className="mb-2">
                  Median: {median(core.ws.analyze.solvedCount)}
                </p>
                <p>{core.ws.analyze.solvedCount.join(', ')}</p>*/}
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
