import type { Experiment } from '../state/types'

// A quick summary of events:
// visit-landing = opening landing page (karol Lernpfad)
// complete-quest-X = interaction with success modal
// start-quest-X = routing to #QUEST-X
// click-robot-gallery = click on the Lernpfad-Link
// load-robot-image = loading a robot via link
// apply-new-robot = load the robot image

export const experimentDefs: Experiment[] = [
  {
    id: 1,
    description: 'Batch of A/A Tests',
    startTs: new Date('2026-08-08 00:01 GMT+0200').getTime(),
    endTs: new Date('2026-09-19 00:01 GMT+0200').getTime(),
    startEvent: 'visit-landing',
    endEvent: 'complete-quest-1',
  },
  {
    id: 2,
    description: 'Batch of A/A Tests',
    startTs: new Date('2026-08-08 00:01 GMT+0200').getTime(),
    endTs: new Date('2026-09-19 00:01 GMT+0200').getTime(),
    startEvent: 'start-quest-1',
    endEvent: 'complete-quest-1',
  },
  {
    id: 3,
    description: 'Batch of A/A Tests',
    startTs: new Date('2026-08-08 00:01 GMT+0200').getTime(),
    endTs: new Date('2026-09-19 00:01 GMT+0200').getTime(),
    startEvent: 'visit-landing',
    endEvent: 'start-quest-1',
  },
  {
    id: 4,
    description: 'Batch of A/A Tests',
    startTs: new Date('2026-08-08 00:01 GMT+0200').getTime(),
    endTs: new Date('2026-09-19 00:01 GMT+0200').getTime(),
    startEvent: 'start-quest-48',
    endEvent: 'complete-quest-48',
  },
  {
    id: 5,
    description: 'Batch of A/A Tests',
    startTs: new Date('2026-08-08 00:01 GMT+0200').getTime(),
    endTs: new Date('2026-09-19 00:01 GMT+0200').getTime(),
    startEvent: 'start-quest-47',
    endEvent: 'complete-quest-47',
  },
  {
    id: 6,
    description: 'Batch of A/A Tests',
    startTs: new Date('2026-08-08 00:01 GMT+0200').getTime(),
    endTs: new Date('2026-09-19 00:01 GMT+0200').getTime(),
    startEvent: 'start-quest-39',
    endEvent: 'complete-quest-39',
  },
  {
    id: 7,
    description: 'Batch of A/A Tests',
    startTs: new Date('2026-08-08 00:01 GMT+0200').getTime(),
    endTs: new Date('2026-09-19 00:01 GMT+0200').getTime(),
    startEvent: 'start-quest-100',
    endEvent: 'complete-quest-100',
  },
  {
    id: 8,
    description: 'Batch of A/A Tests',
    startTs: new Date('2026-08-08 00:01 GMT+0200').getTime(),
    endTs: new Date('2026-09-19 00:01 GMT+0200').getTime(),
    startEvent: 'click-robot-gallery',
    endEvent: 'load-robot-image',
  },
  {
    id: 9,
    description: 'Batch of A/A Tests',
    startTs: new Date('2026-08-08 00:01 GMT+0200').getTime(),
    endTs: new Date('2026-09-19 00:01 GMT+0200').getTime(),
    startEvent: 'load-robot-image',
    endEvent: 'apply-new-robot',
  },
  {
    id: 10,
    description: 'Batch of A/A Tests',
    startTs: new Date('2026-08-08 00:01 GMT+0200').getTime(),
    endTs: new Date('2026-09-19 00:01 GMT+0200').getTime(),
    startEvent: 'click-robot-gallery',
    endEvent: 'apply-new-robot',
  },
]
