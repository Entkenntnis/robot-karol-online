import { AppProps } from 'next/app'

import 'tailwindcss/tailwind.css'
import '../public/fonts/hack.css'
import 'react-reflex/styles.css'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
