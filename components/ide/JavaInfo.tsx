import { hideJavaInfo } from '../../lib/commands/language'
import { useCore } from '../../lib/state/core'

export function JavaInfo() {
  const core = useCore()
  return (
    <div className="relative flex flex-col h-full">
      <div className="absolute right-4 top-4">
        <button
          className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
          onClick={() => {
            hideJavaInfo(core)
          }}
        >
          Schließen
        </button>
      </div>
      <h1 className="ml-8 text-2xl pt-8">Programmiere Robot Karol mit Java</h1>
      <div className="mx-8 [&>p]:mt-4 [&>img]:my-4">
        <p>
          Mache dich bereit für deine ersten Schritte in der &quot;großen&quot;
          Programmiersprache Java! Das Wissen, das du hier lernst, kannst du
          später direkt auf andere Java-Projekte übertragen.
        </p>
        <p>
          Um den Einstieg überschaubar zu halten, wird nur eine ausgewählte
          Menge von Java-Befehlen unterstützt. Ein Grundgerüst hat immer eine
          feste Struktur.
        </p>
        <img src="/java/basics.png" alt="Grundgerüst" />
        <p>
          Wie in Java üblich besteht jede Datei aus einer Klasse. Innerhalb
          dieser Klasse existiert ein Attribut vom Typ Robot, dass auch gleich
          initialisiert wird. Dieses Attribut ist wie eine Fernbedienung für den
          Karol.
        </p>
        <p>
          Das Programm an sich schreibst du in der Methode main (seit Java 21
          ist das eine erlaubte Vereinfachung). Solange du nicht über den
          Grundumfang hinausgehst kannst du jederzeit zwischen Code und Blöcken
          wechseln. Hier siehst ein kleines Beispielprogramm.
        </p>
        <img src="/java/commands.png" alt="Ein paar Befehle" />
      </div>
    </div>
  )
}
