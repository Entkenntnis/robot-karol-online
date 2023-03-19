import { getQuestData } from '../storage/storage'

export function isQuestDone(id: number) {
  const data = getQuestData(id)
  if (data) {
    if (data.completed || data.completedOnce) {
      return true
    }
  }
  return false
}

export function isQuestStarted(id: number) {
  const data = getQuestData(id)
  if (data) {
    if (!data.completed && data.code) {
      return true
    }
  }
  return false
}
