import { questData } from '../data/quests'
import { QuestSessionData } from '../state/types'

export function isQuestDone(id: number) {
  const data = getQuestSessionData(id)
  if (data) {
    if (data.completed.length == questData[id].tasks.length) {
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
    if (
      data.completed.length < questData[id].tasks.length &&
      (data.completed.length > 0 || data.code)
    ) {
      return true
    }
  }
  return false
}
