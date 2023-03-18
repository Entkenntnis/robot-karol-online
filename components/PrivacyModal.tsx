import { setShowPrivacy } from '../lib/commands/mode'
import { useCore } from '../lib/state/core'

export function PrivacyModal() {
  const core = useCore()
  return (
    <div
      className="bg-black/20 fixed inset-0 flex justify-center items-center z-[150]"
      onClick={() => {
        setShowPrivacy(core, false)
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
            Datenschutzerklärung
          </h1>
          <div className="m-3 ml-4 mb-6">
            <h2 className="font-bold my-3">Allgemein</h2>
            <p>
              Als werbefreie Plattform benötigt Robot Karol Online kein Tracking
              und teilt deine Daten nicht mit Drittanbietern. Alle erhobenen
              Daten dienen zu 100% der Bereitstellung der Funktionalität oder
              der Verbesserung der Plattform. Daten werden nicht an Dritte
              weitergegeben und werden ausschließlich in Deutschland
              verarbeitet.
            </p>
            <h2 className="font-bold my-3">Gast-Profil</h2>
            <p>
              Beim Besuch von Robot Karol Online wird ein temporäres Gast-Profil
              angelegt. Mithilfe dieses Profils wird dein Fortschritt und dein
              Code gespeichert und erlaubt es, dich in der Highscore zu
              platzieren. Beim Schließen des Browser-Tabs wird das Gast-Profil
              endgültig gelöscht und es kann nicht mehr darauf zugegriffen
              werden. Ein erneuter Besuch der Seite legt wieder ein neues
              Gast-Profil an. Dadurch kann kein Tracking stattfinden.
            </p>
            <h2 className="font-bold my-3">Protokolle</h2>
            <p>
              Zur Verbesserung der Plattform werden Protokolle geführt und
              ausgewertet. Dabei werden keine personenbezogenen Daten
              gespeichert (außer du speicherst deinen Fortschritt, siehe
              nächsten Abschnitt). Diese Protokolle umfassen
              Nutzungshäufigkeiten verschiedener Funktionen und Lösungen zu
              Aufgaben. Diese Informationen helfen bei der Weiterentwicklung der
              Plattform und stellen sicher, dass bei Problemen schnell reagiert
              werden kann.
            </p>
            <h2 className="font-bold my-3">Fortschritt speichern</h2>
            <p>
              Du hast die Option, deinen Fortschritt dauerhaft auf deinem
              aktuellen Gerät zu speichern. Dabei wird das Gast-Profil in ein
              dauerhaftes Profil umgewandelt. Das Profil enthält eine eindeutige
              ID, dadurch wird dein Gerät für Robot Karol Online
              identifizierbar. Diese ID ist technisch notwendig, um dir ein
              Weiterarbeiten an den Aufgaben zu ermöglichen.
            </p>
            <h2 className="font-bold my-3">Hosting</h2>
            <p>
              Robot Karol Online wird auf einem uberspace (https://uberspace.de)
              gehostet. Der Hoster führt Protokolle zu Fehlern, dabei wird die
              IP-Adresse maskiert. Daneben werden keine Drittanbieter zur
              Darstellung der Webseite benötigt.
            </p>
          </div>
        </div>
        <p className="text-center mb-5 mt-3">
          <button
            className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() => {
              setShowPrivacy(core, false)
            }}
          >
            Schließen
          </button>
        </p>
      </div>
    </div>
  )
}
