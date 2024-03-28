import { keywords as keywordsDe } from './keywords'
import { keywords as keywordsEn } from './keywords-en'
import { parser } from './parser'

export function getParserWithLng(lng: 'de' | 'en') {
  const p = parser
  if (lng == 'en') {
    return parser.configure({
      specializers: [{ from: keywordsDe, to: keywordsEn }],
    })
  }
  return p
}
