import { chapterData } from '../data/chapters'
import { mapData } from '../data/map'

export function isChapter(id: number) {
  return chapterData[id] !== undefined
}

export function isPythonQuest(id: number) {
  return mapData[id]?.chapter !== undefined
}

export function isClassicQuest(id: number) {
  return id >= 1 && !isChapter(id) && !isPythonQuest(id)
}
