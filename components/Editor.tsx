import { useEffect, useRef } from 'react'
import {
  indentSelection,
  simplifySelection,
  cursorLineUp,
  cursorLineEnd,
  cursorCharLeft,
  insertNewlineAndIndent,
} from '@codemirror/commands'
import { EditorState, Transaction } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

import { basicSetup } from '../lib/basicSetup'
import { useWorkspace } from '../lib/workspace'

export const Editor = () => {
  const editorDiv = useRef(null)
  const workspace = useWorkspace()

  useEffect(() => {
    const currentEditor = editorDiv.current

    if (currentEditor) {
      const view = new EditorView({
        state: EditorState.create({
          doc: workspace.state.code,
          extensions: [
            basicSetup(() => {
              console.log('trigger lint')
              return workspace.lint(view)
            }),
            EditorView.updateListener.of((e) => {
              if (e.docChanged) {
                if (!e.state.doc.sliceString(0).endsWith('\n')) {
                  view.dispatch({
                    changes: { from: e.state.doc.length, insert: '\n' },
                  })
                }
              }
              //onUpdate(e.state.doc.sliceString(0))
              console.log('update listener')
              if (e.transactions.length > 0) {
                console.log('contains transactions')
                const t = e.transactions[0]
                const userEvent = t.annotation(Transaction.userEvent)

                if (t.docChanged) {
                  console.log('transaction changes doc')
                  //if (workspace.state.ui.state == 'ready') {
                  console.log('set loading')
                  workspace.setLoading()
                  //}
                }

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
                  } else {
                    t.changes.iterChanges((from, to, fromB, toB, inserted) => {
                      if (
                        [
                          'Schritt',
                          'LinksDrehen',
                          'RechtsDrehen',
                          'Hinlegen',
                          'Aufheben',
                          'MarkeSetzen',
                          'MarkeLöschen',
                        ].includes(inserted.toString())
                      ) {
                        const line = t.newDoc.lineAt(fromB)
                        const col = fromB - line.from
                        if (col == 0) {
                          insertNewlineAndIndent(view)
                        }
                      }
                    })
                  }
                }
              }
            }),
          ],
        }),
        parent: currentEditor,
      })

      workspace.injectEditorView(view)

      return () => view.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorDiv])

  return <div ref={editorDiv} />
}
