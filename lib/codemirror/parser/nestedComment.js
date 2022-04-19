import { ExternalTokenizer } from '@lezer/lr'

import { Comment } from './parser.terms.js'

export const nestedComment = new ExternalTokenizer((input) => {
  let { next } = input
  if (next == 123) {
    let depth = 1
    while (next > 0 && depth > 0) {
      next = input.advance(1)
      if (next == 123) depth++
      if (next == 125) depth--
    }
    next = input.advance(1)
    input.acceptToken(Comment)
  }
})
