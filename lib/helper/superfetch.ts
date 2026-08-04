import { wait } from './wait'

const MAX_ATTEMPTS = 7
const RETRY_DELAYS = [100, 200, 400, 800, 1600, 3200]

export async function superfetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  let lastError: unknown = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, options)
      if (response.ok || response.status < 500 || attempt === MAX_ATTEMPTS) {
        return response
      }
    } catch (error) {
      lastError = error
    }

    if (attempt < MAX_ATTEMPTS) {
      await wait(RETRY_DELAYS[attempt - 1])
    }
  }

  throw lastError
}
