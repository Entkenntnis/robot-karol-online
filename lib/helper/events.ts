export function isSetName(event: string) {
  return event.startsWith('set_name_')
}

export function getName(event: string) {
  return event.substring(9)
}
