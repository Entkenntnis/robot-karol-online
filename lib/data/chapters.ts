import { Heading, QuestData } from '../state/types'

export const chaptersMap: {
  [key: number]: { x: number; y: number; deps: number[]; dir?: Heading }
} = {
  10001: { x: 600, y: 1750, deps: [61] },
  10002: { x: 600, y: 1750, deps: [61] },

  100: { x: 200, y: 2000, deps: [10001] },
  101: { x: 500, y: 2000, deps: [10002] },

  // end of part1
}

export const chapterQuests: { [key: number]: QuestData } = {
  100: require('./quests/1.json'),
  101: require('./quests/1.json'),
}

export const chapterData: { [key: number]: { title: string } } = {
  10001: {
    title: 'Chapter 1',
  },
  10002: { title: 'Chapter 2' },
}
