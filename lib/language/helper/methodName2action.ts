export function methodName2action(name: string) {
  switch (name) {
    case 'schritt':
      return 'forward'
    case 'linksDrehen':
      return 'left'
    case 'rechtsDrehen':
      return 'right'
    case 'hinlegen':
      return 'brick'
    case 'aufheben':
      return 'unbrick'
    case 'markeSetzen':
      return 'setMark'
    case 'markeLöschen':
      return 'resetMark'
    case 'beenden':
      return '--exit--'
  }
}
