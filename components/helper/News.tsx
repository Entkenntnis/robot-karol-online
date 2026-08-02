import { faMessage } from '@fortawesome/free-regular-svg-icons'
import { useCore } from '../../lib/state/core'
import { FaIcon } from './FaIcon'
import { showModal } from '../../lib/commands/modal'

export function News() {
  const core = useCore()
  return (
    <div className="w-[760px] md:mx-auto border-emerald-600 border rounded mx-3 mb-32 px-4 pt-2 [&_a]:text-blue-500 hover:[&_a]:underline">
      <h2 className="text-2xl">Neuigkeiten</h2>
      <p className="my-4">
        <b>31. Juli 2026</b>: Der Python Lernpfad erhält unter{' '}
        <a href="/python">karol.arrrg.de/python</a> ein neues Zuhause und damit
        mehr Platz, sich in Zukunft weiterzuentwickeln, auch unabhängig vom
        Hauptpfad hier. Die Gestaltung wurde so angepasst, dass beide Lernpfade
        leichter zu unterscheiden sind.
      </p>
      <div className="flex justify-center mb-4 mt-8">
        <button
          className="inline-block px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
          onClick={() => {
            showModal(core, 'survey')
          }}
        >
          <FaIcon icon={faMessage} /> <b>Feedback geben</b>
        </button>
      </div>
    </div>
  )
}
