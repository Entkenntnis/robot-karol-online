import { questList } from './overview'

export const questDeps: { [key: number]: number[] } = {}

questList.forEach((id, position) => {
  questDeps[id] = generateAdjacentPositions(position).map((x) => questList[x])
})

function generateAdjacentPositions(position: number): number[] {
  const row = Math.floor(position / 4)
  const col = position % 4
  const offsetOfCurrentRow = [0.5, 0, 0.5, 1][row % 4]

  const offsetOfPreviousRow = [0.5, 0, 0.5, 1][(row + 3) % 4]
  const offsetOfNextRow = [0.5, 0, 0.5, 1][(row + 1) % 4]

  const output: number[] = []

  // case 1: in same row
  if (col > 0) {
    output.push(position - 1)
  }
  if (col < 3) {
    output.push(position + 1)
  }

  // case 2: previous row
  if (row > 0) {
    output.push(position - 4)
    // r offset
    if (offsetOfPreviousRow > offsetOfCurrentRow) {
      if (col > 0) {
        output.push(position - 5)
      }
    } else {
      // l offset
      if (col < 3) {
        output.push(position - 3)
      }
    }
  }

  // case 3: next row
  output.push(position + 4)
  if (offsetOfNextRow > offsetOfCurrentRow) {
    // r offset to next
    if (col > 0) {
      output.push(position + 3)
    }
  } else {
    if (col < 3) {
      output.push(position + 5)
    }
  }

  return output.filter((p) => p < questList.length)
}
