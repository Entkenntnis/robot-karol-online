import { deserializeQuestToData } from '../commands/json'
import type { QuestData } from '../state/types'
import { chapterQuests } from './chapters'

// 1. Load all JSON files in the ./quests directory synchronously
const questFiles = import.meta.glob('./quests/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, any>

// 2. Transform the file paths into your desired object structure
const loadedQuests: { [key: number]: QuestData } = {}

for (const path in questFiles) {
  // Extract the ID from the filename (e.g., "./quests/12.json" -> 12)
  const match = path.match(/\/(\d+)\.json$/)
  if (match) {
    const id = parseInt(match[1], 10)
    const jsonContent = questFiles[path]
    loadedQuests[id] = deserializeQuestToData(jsonContent)
  }
}

// 3. Export the combined object
export const questData: { [key: number]: QuestData } = {
  ...loadedQuests,
  ...chapterQuests,
}
