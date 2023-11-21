import { backend } from '../../backend'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'

export function GoodLuckModal() {
  const core = useCore()
  return (
    <div
      className="bg-black/20 fixed inset-0 flex justify-center items-center z-[150]"
      onClick={() => {
        closeModal(core)
      }}
    >
      <div
        className="min-h-[310px] w-[500px] bg-white z-[200] rounded-xl relative flex justify-between flex-col px-3"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <h2 className="text-center text-2xl mt-4">Auf gut Glück!</h2>
        <div className="flex flex-row ">
          <img src="/kleeblatt.png" alt="" className="w-[200px] basis-1/2" />
          <div className="basis-1/2">
            <p className="mt-6">Öffne eine zufällig freigegebene Aufgabe.</p>
            <p className="mt-6">
              <button
                className="px-2 py-1 bg-green-300 hover:bg-green-400 rounded"
                onClick={() => {
                  async function handler() {
                    try {
                      const res = await fetch(`${backend.randomEndpoint}`)
                      const text = await res.text()
                      if (text.length == 4) {
                        window.open('/#' + text, '_blank')
                      }
                    } catch (e) {
                      alert(e)
                    }
                  }

                  void handler()
                }}
              >
                Zufällige Aufgabe öffnen
              </button>
            </p>
          </div>
        </div>
        <small className="text-sm text-gray-600 ml-4 mb-2">
          Die Inhalte sind von NutzerInnen erstellt und lizenzfrei verwendbar.
        </small>
        <hr />
        <p className="text-center mb-5 mt-3">
          <button
            className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() => {
              closeModal(core)
            }}
          >
            Schließen
          </button>
        </p>
      </div>
    </div>
  )
}
