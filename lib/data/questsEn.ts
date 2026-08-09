import { deserializeQuestToData } from '../commands/json'
import type { QuestData } from '../state/types'
import { chapterQuests } from './chapters'

// 1. Glob the English quests folder synchronously
const enFiles = import.meta.glob('./questsEn/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, any>

const loadedQuests: { [key: number]: QuestData } = {}

// 2. Helper function to extract the number from the filename
const getQuestId = (path: string) => {
  const match = path.match(/\/(\d+)\.json$/)
  return match ? parseInt(match[1], 10) : null
}

// 3. Process English Quests
for (const path in enFiles) {
  const id = getQuestId(path)
  if (id !== null) {
    loadedQuests[id] = deserializeQuestToData(enFiles[path])
  }
}

export const questDataEn: { [key: number]: QuestData } = {
  ...loadedQuests,
  ...chapterQuests,
}
