import { Level } from '../state/types'

export const levels: Level[] = [
  {
    title: 'Inverter',
    target: 50,
    description: (
      <>
        <p>
          Lege rechts einen Ziegel oder nicht und aktiviere dann den Chip mit
          einer Marke:
        </p>
        <div className="flex flex-wrap justify-start mt-3">
          <img src="/levels/correct1.png" alt="Erfolgreiche Belegung" />
          <img
            src="/levels/correct2.png"
            alt="Erfolgreiche Belegung"
            className="ml-3 inline-block"
          />
        </div>
      </>
    ),
    previewImage: '/levels/preview_inverter.png',
  },
  {
    title: 'Start',
    target: 10,
    description: (
      <>
        <p>
          Herzlich Willkommen bei deinem ersten Forschungsprojekt. Wir brauchen
          dringend Software Ingeneure (aka Programmierer), die uns bei der
          Erforschung dieser Chips helfen! Als Hinweis haben wir folgendes Bild
          erhalten:
        </p>
        <img
          src="/levels/start_correct.png"
          alt="Erfolgreiche Belegung"
          className="ml-3 mt-3"
        />
      </>
    ),
    previewImage: '/levels/preview_start.png',
  },
  {
    title: 'Copy',
    target: 25,
    description: (
      <>
        <p>
          Links erscheint auf einem Feld ein Ziegel. Kopiere ihn nach rechts und
          aktiviere den Chip dann mit einer Marke:
        </p>
        <div className="flex flex-wrap justify-start mt-3">
          <img src="/levels/copy1.png" alt="Erfolgreiche Belegung" />
          <img
            src="/levels/copy2.png"
            alt="Erfolgreiche Belegung"
            className="ml-3 inline-block"
          />
        </div>
      </>
    ),
    previewImage: '/levels/copy_preview.png',
  },
  {
    title: 'Treppe',
    target: 30,
    description: (
      <>
        <p>Baue eine Treppe bis zur Markierung:</p>
        <div className="flex flex-wrap justify-start mt-3">
          <img src="/levels/treppe_done.png" alt="Erfolgreiche Belegung" />
        </div>
      </>
    ),
    previewImage: '/levels/treppe_preview.png',
  },
  {
    title: 'Aufräumer',
    target: 25,
    description: (
      <>
        <p>Entferne alle Ziegel und Marken:</p>
        <div className="flex flex-wrap justify-start mt-3">
          <img src="/levels/aufraumer_done.png" alt="Erfolgreiche Belegung" />
        </div>
      </>
    ),
    previewImage: '/levels/aufraumer_preview.png',
  },
  {
    title: 'Stapler',
    target: 30,
    description: (
      <>
        <p>Staple alle Ziegel auf einen Stapel:</p>
        <div className="flex flex-wrap justify-start mt-3">
          <img src="/levels/stapler_done.png" alt="Erfolgreiche Belegung" />
        </div>
      </>
    ),
    previewImage: '/levels/stapler_preview.png',
  },
  {
    title: 'Kopierer',
    target: 40,
    description: (
      <>
        <p>Kopiere die Ziegel und Marken nach rechts:</p>
        <div className="flex flex-wrap justify-start mt-3">
          <img src="/levels/kopierer_done.png" alt="Erfolgreiche Belegung" />
        </div>
      </>
    ),
    previewImage: '/levels/kopierer_preview.png',
  },
]

/*

wiederhole 3 mal Schritt endewiederhole
LinksDrehen
wiederhole 6 mal Schritt endewiederhole
RechtsDrehen
wiederhole 100 mal Durchlauf endewiederhole


Anweisung Durchlauf
  Schritt RechtsDrehen Schritt
  wenn IstZiegel dann
    RechtsDrehen RechtsDrehen
    Schritt Schritt
    wenn IstZiegel dann Aufheben endewenn
  sonst
    RechtsDrehen RechtsDrehen
    Schritt Schritt
    wenn NichtIstZiegel dann Hinlegen endewenn
  endewenn
  LinksDrehen LinksDrehen
  Schritt RechtsDrehen Schritt
  MarkeSetzen MarkeLöschen
  LinksDrehen LinksDrehen
endeAnweisung


*/
