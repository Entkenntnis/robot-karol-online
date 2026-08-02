import { faExternalLink, faMedal } from '@fortawesome/free-solid-svg-icons'
import { ____submitAnalyzeEvent } from '../../lib/helper/submit'
import { useCore } from '../../lib/state/core'
import { FaIcon } from './FaIcon'
import {
  setLearningPathScroll,
  setQuestReturnToMode,
} from '../../lib/storage/storage'
import { navigate } from '../../lib/commands/router'

// DE only
export function Discover() {
  const core = useCore()
  return (
    <div className="h-[240px] relative w-[760px] md:mx-auto border-slate-700 border rounded mx-3">
      <div className="absolute left-[4px] top-[-2px]">
        <h2 className="text-lg">Entdecke auch:</h2>
      </div>

      <a
        href={'/python'}
        className="absolute top-[23px] left-[170px] w-[150px] block hover:bg-gray-100/60 rounded-xl cursor-pointer"
        onClick={(e) => {
          navigate(core, 'python')
          setLearningPathScroll(
            document.getElementById('scroll-container')?.scrollTop ?? -1,
          )
          e.preventDefault()
        }}
      >
        <p className="text-center mb-2 text-lg">Python Lernpfad</p>
        <img
          src="/python-logo-only.png"
          alt="Python Logo"
          className="w-[50px] mx-auto"
        />
      </a>

      <a
        href={'/#DANCE'}
        className="absolute top-[13px] left-[380px] w-[120px] block z-10 hover:bg-gray-100/60 rounded-xl cursor-pointer"
        onClick={(e) => {
          ____submitAnalyzeEvent(core, 'ev_click_landing_dancedance')
          setQuestReturnToMode(core.ws.page == 'demo' ? '#DEMO' : '')
          setLearningPathScroll(
            document.getElementById('scroll-container')?.scrollTop ?? -1,
          )
          navigate(core, '#DANCE')
          e.preventDefault()
        }}
      >
        <p className="text-center">
          Dance, Dance
          <br />
          <span className="text-sm">(Rhythm Game)</span>
        </p>
        <img src="/dance.png" alt="" className="w-[40px] mx-auto mt-2" />
      </a>

      <a
        href="/#KAROLMANIA"
        className="absolute top-[15px] left-[580px] w-[120px] block z-10 hover:bg-gray-100/60 rounded-xl cursor-pointer text-center"
        onClick={(e) => {
          ____submitAnalyzeEvent(core, 'ev_click_landing_karolmania')
          setLearningPathScroll(
            document.getElementById('scroll-container')?.scrollTop ?? -1,
          )
          navigate(core, '#KAROLMANIA')
          e.preventDefault()
        }}
      >
        <p className="text-center">
          Karolmania
          <br />
          <span className="text-sm">(Mini Game)</span>
        </p>
        <FaIcon
          icon={faMedal}
          className="block text-3xl mx-auto mt-2 text-teal-600"
        />
      </a>

      <div className="absolute left-[275px] z-10 top-[140px]">
        <button
          className=" w-[120px] block hover:bg-gray-100/60 rounded-xl"
          onClick={() => {
            ____submitAnalyzeEvent(core, 'ev_click_landing_hacktheweb')
            window.open('https://hack.arrrg.de/', '_blank')
          }}
        >
          <p className="text-center mb-2">
            Hack The Web{' '}
            <FaIcon icon={faExternalLink} className="text-xs text-gray-600" />
          </p>
          <img src="/htw.png" alt="H" className="w-[37px] mx-auto mb-2" />
        </button>
      </div>

      <div className="absolute left-[490px] z-10 top-[125px]">
        <button
          className="w-[120px] hover:bg-gray-100/60 rounded-xl"
          onClick={() => {
            ____submitAnalyzeEvent(core, 'ev_click_landing_einhorn')
            window.open('https://einhorn.arrrg.de', '_blank')
          }}
        >
          <p className="text-center mb-2">
            Einhorn der Mathematik{' '}
            <FaIcon icon={faExternalLink} className="text-xs text-gray-600" />
          </p>
          <img src="/einhorn.png" alt="Einhorn" className="w-[50px] mx-auto" />
        </button>
      </div>
    </div>
  )
}
