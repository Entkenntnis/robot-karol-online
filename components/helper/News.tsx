import { useCore } from '../../lib/state/core'

export function News() {
  const core = useCore()
  return (
    <div className="w-[760px] md:mx-auto border-orange-700 border rounded mx-3 mb-24 px-4 pt-2">
      <h2 className="text-2xl">Neuigkeiten</h2>
      <p className="h-[100px] bg-white"></p>
    </div>
    // <div className="justify-center mt-12 mb-20 flex">
    //   <div className="w-[600px] bg-pink-200">
    //     Neuigkeiten (TODO: Move to component)
    //     <details>
    //       <summary>Neue Aufteilung in zwei Bereiche, yuhei.</summary>
    //       <div className="h-[300px]">
    //         Der Python-Lernpfad erhält nun eine eigene Seite und kann über eine
    //         URL auch direkt erreicht werden. Und so lala, also es ist schon eine
    //         schöne Bescherung, was wir hier haben.
    //       </div>
    //     </details>
    //   </div>
    // </div>
  )
}
