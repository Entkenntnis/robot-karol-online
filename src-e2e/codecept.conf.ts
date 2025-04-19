import { setHeadlessWhen, setCommonPlugins } from '@codeceptjs/configure'
// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS)

// enable all common plugins https://github.com/codeceptjs/configure#setcommonplugins
setCommonPlugins()

export const config: CodeceptJS.MainConfig = {
  tests: 'tests/*.ts',
  output: './output',
  helpers: {
    Playwright: {
      browser: 'firefox',
      url: 'http://localhost:3000',
      show: true,
      // restart: 'session',
      // keepBrowserState: true,
    },
  },
  include: {
    I: './steps_file',
  },
  name: 'src-e2e',
}
