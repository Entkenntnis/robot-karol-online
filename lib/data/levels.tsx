/* eslint-disable @next/next/no-img-element */
import { Level } from '../state/types'

export const levels: Level[] = [
  {
    title: 'Inverter',
    target: 50,
    description: (
      <div className="flex flex-wrap justify-around">
        <img src="/levels/correct1.png" alt="Erfolgreiche Belegung" />
        <img
          src="/levels/correct2.png"
          alt="Erfolgreiche Belegung"
          className="ml-3 inline-block"
        />
      </div>
    ),
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
