import { closeMenu, setMode } from '../lib/commands/mode'
import { useCore } from '../lib/state/core'

export function Menu() {
  const core = useCore()
  return (
    <div className="bg-black/20 absolute inset-0 flex justify-center items-center z-[150]">
      <div className="h-[300px] w-[300px] bg-white z-[200] rounded-xl relative">
        <div className="absolute right-1 top-1">
          <button
            className="px-2 py-1 bg-gray-100 rounded"
            onClick={() => {
              closeMenu(core)
            }}
          >
            Schließen
          </button>
        </div>
        <p className="ml-4 font-bold text-lg mt-2">Menü</p>
        <p className="ml-4 mt-3 underline">Quests</p>
        <p className="ml-4 mt-1">Wähle eine Quest aus: TODO</p>
        <p className="ml-4 mt-3 underline">Einstellungen</p>
        <p className="ml-4 mt-1">
          Eingabemethode:
          <select
            className="ml-2 p-1"
            value={core.ws.settings.mode}
            onChange={(e) => {
              setMode(core, e.target.value as 'blocks' | 'code')
              closeMenu(core)
            }}
          >
            <option value="blocks">block-basiert</option>
            <option value="code">text-basiert</option>
          </select>
        </p>
        <p className="ml-4 mt-1">
          Editor-Modus aktivieren: <input type="checkbox" />
        </p>
        <p className="ml-4 mt-3 underline">Informationen</p>
        <p className="ml-4 mt-1">Dokumentation | Kontakt / Datenschutz</p>
      </div>
    </div>
  )
}
