import { EditorState, EditorView } from '@codemirror/basic-setup'
import { useEffect, useRef } from 'react'
import { basicSetup } from '../lib/basicSetup'
import {
  indentSelection,
  simplifySelection,
  cursorLineUp,
  cursorLineEnd,
  cursorCharLeft,
} from '@codemirror/commands'
import { Transaction } from '@codemirror/state'
import { Diagnostic } from '@codemirror/lint'
import { useCore } from '../lib/core'

export const Editor = ({
  setRef,
  onLint,
  onUpdate,
}: {
  setRef: any
  onLint: (view: EditorView) => Diagnostic[]
  onUpdate: (event?: string) => void
}) => {
  const editor = useRef(null)
  const core = useCore()

  useEffect(() => {
    const currentEditor = editor.current

    if (currentEditor) {
      const view = new EditorView({
        state: EditorState.create({
          doc: core.current.code,
          extensions: [
            basicSetup(onLint),
            EditorView.updateListener.of((e) => {
              //onUpdate(e.state.doc.sliceString(0))
              if (e.transactions.length > 0) {
                const t = e.transactions[0]
                const userEvent = t.annotation(Transaction.userEvent)

                onUpdate(userEvent)
                const annotations = (t as any).annotations as {
                  value: string
                }[]
                //console.log(t)
                if (annotations.some((a) => a.value == 'drop')) {
                  //console.log((t as any).changes.inserted[0])

                  indentSelection(view)
                  simplifySelection(view)
                  indentSelection(view)
                  //console.log((t as any).changes.inserted[0])
                  if (
                    (t as any).changes.inserted.some((x: any) =>
                      x.text.some((x: any) => x.includes('wiederhole solange'))
                    )
                  ) {
                    cursorLineUp(view)
                    cursorLineUp(view)
                    cursorLineEnd(view)
                  } else if (
                    (t as any).changes.inserted.some((x: any) =>
                      x.text.some((x: any) => x.includes('wiederhole immer'))
                    )
                  ) {
                    cursorLineUp(view)
                  } else if (
                    (t as any).changes.inserted.some(
                      (x: any) =>
                        x.text?.some((x: any) => x.includes('wenn  dann')) &&
                        x.text.length == 3
                    )
                  ) {
                    cursorLineUp(view)
                    cursorLineUp(view)
                    cursorCharLeft(view)
                    cursorCharLeft(view)
                    cursorCharLeft(view)
                  } else if (
                    (t as any).changes.inserted.some(
                      (x: any) =>
                        x.text?.some((x: any) => x.includes('wenn  dann')) &&
                        x.text.length == 5
                    )
                  ) {
                    cursorLineUp(view)
                    cursorLineUp(view)
                    cursorLineUp(view)
                    cursorLineUp(view)
                    cursorCharLeft(view)
                    cursorCharLeft(view)
                    cursorCharLeft(view)
                  }
                }
              }
            }),
          ],
        }),
        parent: currentEditor,
      })

      setRef(view)

      return () => view.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  return <div ref={editor} />
}
