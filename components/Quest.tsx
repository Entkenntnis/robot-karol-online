import {
  faDiagramProject,
  faBook,
  faCode,
  faShare,
  faExternalLinkAlt,
  faInfoCircle,
  faInfo,
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'
import { useCore } from '../lib/state/core'
import { EditArea } from './EditArea'
import { FaIcon } from './FaIcon'
import { Player } from './Player'
import { Worlds } from './Worlds'

export function Quest() {
  const core = useCore()

  return (
    <div className="h-[calc(100vh-40px)]">
      <ReflexContainer orientation="vertical" windowResizeAware>
        <ReflexElement
          className="h-full"
          minSize={500}
          onResize={() => {
            if (core.blockyResize) {
              core.blockyResize()
            }
          }}
        >
          <EditArea />
        </ReflexElement>

        <ReflexSplitter style={{ width: 3 }} />

        <ReflexElement minSize={200}>
          <Worlds />
        </ReflexElement>
      </ReflexContainer>
      <div className="flex border-t h-[40px] flex-shrink-0">
        <div className="w-full overflow-auto my-auto flex justify-between">
          <div className="ml-1 my-1">
            <button
              className="hover:bg-gray-100 rounded px-2"
              onClick={() => {
                //openModal(core, 'diagram')
              }}
            >
              Umschalter zwischen Code und Blöcke
            </button>
            <span className="border-l border-gray-300 mx-1"></span>

            <button
              className="hover:bg-gray-100 rounded px-2"
              onClick={() => {
                //openModal(core, 'reference')
              }}
            >
              <FaIcon
                icon={faBook}
                className="text-xs"
                style={{ verticalAlign: 0 }}
              />{' '}
              Sowas wie Hilfe
            </button>
            <span className="border-l border-gray-300 mx-1"></span>
            <button
              className="hover:bg-gray-100 rounded px-2"
              onClick={() => {
                //openModal(core, 'examples')
              }}
            >
              <FaIcon
                icon={faCode}
                className="text-xs"
                style={{ verticalAlign: 0 }}
              />{' '}
              Weitere Quests finden
            </button>
            <span className="border-l border-gray-300 mx-1"></span>
            <button
              className="px-2 rounded bg-yellow-100 hover:bg-yellow-200"
              onClick={() => {
                //openModal(core, 'share')
              }}
            >
              <FaIcon
                icon={faShare}
                className="text-sm"
                style={{ verticalAlign: 0 }}
              />{' '}
              Wechseln in den Editor-Modus
            </button>
            <span className="border-l border-gray-300 mx-1"></span>
          </div>
          <div className="mr-2 my-1">
            <button
              className="hover:bg-gray-100 rounded px-2 py-0.5"
              onClick={() => {
                //openModal(core, 'examples')
              }}
            >
              Impressum / Datenschutz
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
