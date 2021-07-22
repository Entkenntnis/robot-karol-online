interface WordToken {
  type: 'word'
  value: string
}

interface NumberToken {
  type: 'number'
  value: number
}

interface ErrorToken {
  type: 'error'
}

export type Token = WordToken | NumberToken | ErrorToken

export function tokenize(str: string): Token[] {
  //console.log('tokenize', str)

  const whitespace = str.match(/^[\s]+/)

  if (whitespace) {
    return tokenize(str.substring(whitespace[0].length))
  }

  const comment = str.match(/^\{[^\}]*\}/)

  if (comment) {
    return tokenize(str.substring(comment[0].length))
  }

  const word = str.match(/^[a-zA-Z]+/)
  if (word) {
    return [
      { type: 'word', value: word[0] },
      ...tokenize(str.substring(word[0].length)),
    ]
  }

  const number = str.match(/^[\d]+/)

  if (number) {
    return [
      { type: 'number', value: parseInt(number[0]) },
      ...tokenize(str.substring(number[0].length)),
    ]
  }

  if (!str) {
    return []
  }

  //console.log('error', str)

  return [{ type: 'error' }]
}
