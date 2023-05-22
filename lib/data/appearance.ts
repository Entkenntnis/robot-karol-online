import { AppearanceData } from '../state/types'

export const appearanceRegistry: { [key: number]: AppearanceData } = {
  0: { type: 'cap', title: 'schwarz', position: 0 },
  1: { type: 'skin', title: 'gelb', position: 0 },
  2: { type: 'shirt', title: 'rot', position: 0 },
  3: { type: 'legs', title: 'blau', position: 0 },
  4: { type: 'skin', title: 'hell', position: 2 },
  5: { type: 'skin', title: 'dunkel', position: -1 },
  6: { type: 'shirt', title: 'orange', position: 1 },
  7: { type: 'legs', title: 'grün', position: 1 },
  8: { type: 'cap', title: 'weiß', position: 1 },
  9: { type: 'shirt', title: 'Regenbogen', position: 0.5 },
  10: { type: 'legs', title: 'dunkelblau', position: 0.2 },
  11: { type: 'legs', title: 'orange', position: 0.3 },
}
