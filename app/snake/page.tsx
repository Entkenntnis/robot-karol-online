import SnakeGame from './game'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Snake Karol Edition',
}

export default function Snake() {
  return <SnakeGame />
}
