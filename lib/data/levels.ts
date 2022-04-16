import { Level } from '../state/types'

export const levels: Level[] = [
  {
    title: 'Inverter',
    target: 50,
    description:
      'Ein Inverter dreht seine Eingabe um. Liegt links ein Ziegel,' +
      ' dann soll rechts leer sein. Ist links leer, dann soll rechts' +
      ' ein Ziegel liegen. Du kannst den Inverter aktivieren, in dem' +
      ' du auf das gelbe Feld eine Marke setzt. Damit kannst du den Fortschritt erhöhen.',
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
