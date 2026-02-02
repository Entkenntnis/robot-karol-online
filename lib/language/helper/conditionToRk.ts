import type { Condition } from '../../state/types'

export function conditionToRK(condition: Condition) {
  const part1 = condition.negated ? 'NichtIst' : 'Ist'
  const part2 = ((type) => {
    if (type == 'brick') return 'Ziegel'
    if (type == 'wall') return 'Wand'
    if (type == 'mark') return 'Marke'
    if (type == 'north') return 'Norden'
    if (type == 'south') return 'Süden'
    if (type == 'east') return 'Osten'
    if (type == 'west') return 'Westen'
    return 'Ziegel'
  })(condition.type)
  const part3 = condition.type == 'brick_count' ? `(${condition.count})` : ''

  // this was only for me
  condition.count = undefined

  return `${part1}${part2}${part3}`
}
