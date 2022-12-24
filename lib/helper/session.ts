import { questData } from '../data/quests'
import { QuestSessionData } from '../state/types'

export function isQuestDone(id: number) {
  const data = getQuestSessionData(id)
  if (data) {
    if (data.completed) {
      return true
    }
  }
  return false
}

export function getQuestSessionData(id: number) {
  const raw = sessionStorage.getItem(`karol_quest_beta_${id}`)
  if (raw) {
    return JSON.parse(raw) as QuestSessionData
  }
  return null
}

export function isQuestStarted(id: number) {
  const data = getQuestSessionData(id)
  if (data) {
    if (!data.completed && data.code) {
      return true
    }
  }
  return false
}
