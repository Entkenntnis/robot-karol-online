import { Component, ErrorInfo, ReactNode } from 'react'
import { CoreContext } from '../lib/state/core'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  static contextType = CoreContext

  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {}

  public render() {
    if (this.state.hasError) {
      return (
        <div className="mt-12 text-center text-lg">
          There was an internal error in Robot Karol Online.
          <br />
          <br />
          <button
            className="px-2 py-0.5 bg-green-200 hover:br-green-300 rounded"
            onClick={() => {
              this.setState(() => ({ hasError: false }))
            }}
          >
            Restart application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
