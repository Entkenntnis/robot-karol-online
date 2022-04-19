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
