import { useState } from 'react'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'
import { getPreviewParticipation, setPreviewParticipation } from '../../lib/storage/storage'

export function PrivacyModal() {
  const core = useCore()
  const [previewParticipation, setPreviewParticipationState] = useState(() =>
    getPreviewParticipation(),
  )
  return (
    <div
      className="bg-black/20 fixed inset-0 flex justify-center items-center z-[150]"
      onClick={() => {
        closeModal(core)
      }}
    >
      <div
        className="h-[400px] overflow-y-auto w-[620px] bg-white z-[200] rounded-xl relative flex justify-between flex-col"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div>
          <h1 className="ml-4 font-bold text-lg mt-2 mb-4">
            {core.strings.overview.privacy}
          </h1>
          {core.ws.settings.lng == 'de' && (
            <div className="m-3 ml-4 mb-6">
              <h2 className="font-bold my-3">Allgemein</h2>
              <p>
                Als werbefreie Plattform benötigt Robot Karol Online kein
                Tracking und teilt deine Daten nicht mit Drittanbietern. Alle
                erhobenen Daten dienen zu 100% der Bereitstellung der
                Funktionalität oder der Verbesserung der Plattform. Daten werden
                nicht an Dritte weitergegeben und werden ausschließlich in
                Deutschland verarbeitet.
              </p>
              <h2 className="font-bold my-3">Fortschritt</h2>
              <p>
                Bei der Nutzung von Robot Karol Online wird dein Fortschritt
                lokal auf deinem Gerät gespeichert. Du kannst den Fortschritt
                jederzeit speichern und laden. Der Fortschritt selbst bleibt auf
                deinem Gerät und wird nicht an den Server übertragen. Ausnahmen:
                Zur Anzeige der Anzahl online aktiver Nutzer*innen wird eine
                zufällige ID an den Server übertragen. Wenn du eine Aufgabe
                freigibst, wird diese auf dem Server gespeichert. Zudem werden
                anonymisierte Nutzungsdaten übertragen (siehe Abschnitt
                „Protokolle“). Achtung: Der Browser kann entscheiden, diese
                Daten jederzeit zu löschen. Es wird empfohlen, sich den
                Fortschritt regelmäßig herunterzuladen.
              </p>
              <h2 className="font-bold my-3">Protokolle</h2>
              <p>
                Zur Verbesserung der Plattform werden Protokolle geführt und
                ausgewertet. Diese Protokolle umfassen Nutzungshäufigkeiten
                verschiedener Funktionen und sind nicht an dein Profil geknüpft.
                Diese Informationen helfen bei der Weiterentwicklung der
                Plattform und stellen sicher, dass bei Problemen schnell
                reagiert werden kann.
              </p>
              <h2 className="font-bold my-3">Vorschau neuer Funktionen</h2>
              <p>
                Neue Funktionen werden teilweise als Vorschau einer ausgewählten
                Nutzergruppe zur Verfügung gestellt, um die Wirkung besser zu
                verstehen. Du kannst hier einstellen, ob du an der Vorschau
                neuer Funktionen teilnehmen möchtest:
              </p>
              <label className="block my-1">
                <input
                  type="radio"
                  name="preview-participation"
                  checked={previewParticipation}
                  onChange={() => {
                    setPreviewParticipation(true)
                    setPreviewParticipationState(true)
                  }}
                />{' '}
                An Vorschau teilnehmen
              </label>
              <label className="block my-1">
                <input
                  type="radio"
                  name="preview-participation"
                  checked={!previewParticipation}
                  onChange={() => {
                    setPreviewParticipation(false)
                    setPreviewParticipationState(false)
                  }}
                />{' '}
                Nicht an Vorschau teilnehmen
              </label>
              <h2 className="font-bold my-3">Hosting</h2>
              <p>
                Robot Karol Online wird auf einem uberspace
                (https://uberspace.de) gehostet. Der Hoster führt Protokolle zu
                Fehlern, dabei wird die IP-Adresse maskiert. Daneben werden
                keine Drittanbieter zur Darstellung der Webseite benötigt.
              </p>
            </div>
          )}
          {core.ws.settings.lng == 'en' && (
            <div className="m-3 ml-4 mb-6">
              <h2 className="font-bold my-3">General</h2>
              <p>
                As an ad-free platform, Robot Karol Online does not require
                tracking and does not share your data with third parties. All
                collected data is used 100% for providing functionality or
                improving the platform. Data is not shared with third parties
                and is processed exclusively in Germany.
              </p>
              <h2 className="font-bold my-3">Progress</h2>
              <p>
                When using Robot Karol Online, your progress is stored locally
                on your device. You can save and load your progress at any time.
                The progress itself stays on your device and is not transferred
                to the server. Exceptions: A random ID is sent to the server to
                display the number of online users. If you share a task, it is
                stored on the server. In addition, anonymized usage data is
                transmitted (see the &quot;Logs&quot; section). Please note:
                Your browser may decide to delete this data at any time. It is
                recommended to download your progress regularly.
              </p>
              <h2 className="font-bold my-3">Logs</h2>
              <p>
                To improve the platform, logs are kept and evaluated. These logs
                include the frequency of use of different features and are not
                linked to your profile. This information helps in the further
                development of the platform and ensures quick response to
                problems.
              </p>
              <h2 className="font-bold my-3">Preview of New Features</h2>
              <p>
                New features are sometimes provided as a preview to a selected
                group of users to better understand their impact. You can choose
                here whether you want to participate in the preview of new
                features:
              </p>
              <label className="block my-1">
                <input
                  type="radio"
                  name="preview-participation"
                  checked={previewParticipation}
                  onChange={() => {
                    setPreviewParticipation(true)
                    setPreviewParticipationState(true)
                  }}
                />{' '}
                Participate in preview
              </label>
              <label className="block my-1">
                <input
                  type="radio"
                  name="preview-participation"
                  checked={!previewParticipation}
                  onChange={() => {
                    setPreviewParticipation(false)
                    setPreviewParticipationState(false)
                  }}
                />{' '}
                Do not participate in preview
              </label>
              <h2 className="font-bold my-3">Hosting</h2>
              <p>
                Robot Karol Online is hosted on uberspace
                (https://uberspace.de). The host keeps logs for errors, with the
                IP address being masked. Additionally, no third-party services
                are required for displaying the website.
              </p>
            </div>
          )}
        </div>
        <p className="text-center mb-5 mt-3">
          <button
            className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() => {
              closeModal(core)
            }}
          >
            {core.strings.imprint.close}
          </button>
        </p>
      </div>
    </div>
  )
}
