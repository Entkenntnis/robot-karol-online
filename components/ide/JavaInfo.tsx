import { hideJavaInfo } from '../../lib/commands/language'
import { useCore } from '../../lib/state/core'

export function JavaInfo() {
  const core = useCore()
  return (
    <div className="relative flex flex-col h-full">
      <div className="absolute bottom-1.5 left-2">
        <button
          className="px-3 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
          onClick={() => {
            hideJavaInfo(core)
          }}
        >
          Schließen
        </button>
      </div>
      <div className="h-full w-full overflow-auto pb-12">
        <h1 className="ml-8 text-2xl pt-8">
          Programmiere Robot Karol mit Python oder Java
        </h1>
        <div className="mx-8 [&>p]:mt-4 [&>img]:my-4 mb-10">
          <p>
            Mache dich bereit für deine ersten Schritte in eine
            &quot;große&quot; Programmiersprache!
          </p>
          <p>
            Du kannst Karol wahlweise in Python oder Java programmieren. Das
            Wissen, dass du dir so aneignest, kannst du anschließend gleich in
            weiteren Projekten anwenden.
          </p>
          <p>
            Um den Einstieg überschaubar zu halten, wird nur jeweils eine
            ausgewählte Menge an Befehlen unterstützt. Ein Beispielprogramm für
            Python ist hier gezeigt.
          </p>
          <img src="/java/python.png" alt="Python Grundgerüst" />
          <p>
            Erzeuge als erstes ein Objekt der Klasse Robot und weise das Objekt
            einer Variable zu. Auf dieser Variable kannst du kann alle Befehle
            von Karol aufrufen.
          </p>
          <p>Das gleiche Programm in Java sieht so aus.</p>
          <img src="/java/java.png" alt="Grundgerüst" />
          <p>
            Wie in Java üblich besteht jede Datei aus einer Klasse. Innerhalb
            dieser Klasse existiert ein Attribut vom Typ Robot, dass auch gleich
            initialisiert wird. Dieses Attribut ist wie eine Fernbedienung für
            den Karol.
          </p>
          <p>
            Ein Wechsel zwischen den Sprachen ist jederzeit möglich. Entdecke
            damit auch den Syntax der Sprache.
          </p>
          <p>
            Es gibt auch den Java Profi-Modus. Dort können Variablen und weitere
            Funktionen verwendet werden. Schaue dir für Details{' '}
            <a
              href={
                window.location.hostname === 'localhost'
                  ? '/test-java?profi=1'
                  : '/test-java.html?profi=1'
              }
              target="_blank"
              className="text-blue-500 underline"
            >
              die Funktionsübersicht
            </a>{' '}
            an. Hier ist ein Beispielprogramm:
          </p>
          <img src="/java/variablen.png" alt="Beispielprogrmam mit Variablen" />
        </div>
      </div>
    </div>
  )
}
