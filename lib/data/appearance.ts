import { AppearanceData } from '../state/types'

export const appearanceRegistry: { [key: number]: AppearanceData } = {
  0: { type: 'cap', title: 'schwarz', titleEn: 'black', position: 0 },
  1: { type: 'skin', title: 'gelb', titleEn: 'yellow', position: 0 },
  2: { type: 'shirt', title: 'rot', titleEn: 'red', position: 0 },
  3: { type: 'legs', title: 'blau', titleEn: 'blue', position: 0 },
  4: { type: 'skin', title: 'hell', titleEn: 'light', position: 2 },
  5: { type: 'skin', title: 'dunkel', titleEn: 'dark', position: -1 },
  6: { type: 'shirt', title: 'orange', titleEn: 'orange', position: 1 },
  7: { type: 'legs', title: 'grün', titleEn: 'green', position: 1 },
  8: { type: 'cap', title: 'weiß', titleEn: 'white', position: 1 },
  9: { type: 'shirt', title: 'Regenbogen', titleEn: 'Rainbow', position: 0.5 },
  10: {
    type: 'legs',
    title: 'dunkelblau',
    titleEn: 'dark blue',
    position: 0.2,
  },
  11: { type: 'legs', title: 'orange', titleEn: 'orange', position: 0.3 },
  12: { type: 'cap', title: 'Punk', titleEn: 'Punk', position: 2 },
  13: { type: 'cap', title: 'violett', titleEn: 'purple', position: 1.5 },
  14: { type: 'shirt', title: 'pink', titleEn: 'pink', position: 1.5 },
  15: { type: 'shirt', title: 'schwarz', titleEn: 'black', position: 1.7 },
  16: { type: 'legs', title: 'schwarz', titleEn: 'black', position: 1.5 },
  17: { type: 'shirt', title: 'weiß', titleEn: 'white', position: 1.6 },
  18: {
    type: 'legs',
    title: 'schwarzer Rock',
    titleEn: 'black skirt',
    position: 1.8,
  },
  19: {
    type: 'cap',
    title: 'langes schwarzes Haar',
    titleEn: 'long black hair',
    position: 1.6,
  },
}
