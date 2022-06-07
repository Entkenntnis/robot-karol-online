import { Puzzle } from '../state/types'
import { p10_wiederverwendung } from './p10_wiederverwendung'
import { p1_start } from './p1_start'
import { p2_smileys } from './p2_smileys'
import { p3_tippfehler } from './p3_tippfehler'
import { p4_hinlegen } from './p4_hinlegen'
import { p5_leerzeichen } from './p5_leerzeichen'
import { p6_wiederholexmal } from './p6_wiederholexmal'
import { p7_wiederholesolange } from './p7_wiederholesolange'
import { p8_123 } from './p8_123'
import { p9_linksundrechts } from './p9_linksundrechts'

export const puzzles: Puzzle[] = [
  p1_start,
  p2_smileys,
  p3_tippfehler,
  p4_hinlegen,
  p5_leerzeichen,
  p6_wiederholexmal,
  p7_wiederholesolange,
  p8_123,
  p9_linksundrechts,
  p10_wiederverwendung,
]
