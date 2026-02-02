import { deserializeQuestToData } from '../commands/json'
import type { QuestData } from '../state/types'
import { chapterQuests } from './chapters'

// 1. Glob both folders synchronously
// This finds all JSONs in questsEn and the specific ones in quests
const enFiles = import.meta.glob('./questsEn/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, any>
const baseFiles = import.meta.glob('./quests/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, any>

const loadedQuests: { [key: number]: QuestData } = {}

// 2. Helper function to extract the number from the filename
const getQuestId = (path: string) => {
  const match = path.match(/\/(\d+)\.json$/)
  return match ? parseInt(match[1], 10) : null
}

// 3. Process English Quests (1-59)
for (const path in enFiles) {
  const id = getQuestId(path)
  if (id !== null) {
    loadedQuests[id] = deserializeQuestToData(enFiles[path])
  }
}

// 4. Specifically override/add the ones from the base folder (60, 61, 64, 65)
// based on your original requirement
const baseIdsToInclude = [60, 61, 64, 65]
for (const path in baseFiles) {
  const id = getQuestId(path)
  if (id !== null && baseIdsToInclude.includes(id)) {
    loadedQuests[id] = deserializeQuestToData(baseFiles[path])
  }
}

export const questDataEn: { [key: number]: QuestData } = {
  ...loadedQuests,
  ...chapterQuests,
}
