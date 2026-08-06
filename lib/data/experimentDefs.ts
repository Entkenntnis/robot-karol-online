import type { Experiment } from '../state/types'

export const experimentDefs: Experiment[] = [
  {
    id: 1,
    description: 'Batch an A/A Tests',
    startTs: new Date('2026-08-08 00:01 GMT+0200').getTime(),
    endTs: new Date('2026-09-19 00:01 GMT+0200').getTime(),
    startEvent: 'visit-landing',
    endEvent: 'complete-quest-1',
  },
]
