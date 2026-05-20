import { Component, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-surface-50 px-6 dark:bg-surface-950">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-error-500/10">
            <span className="text-3xl">&#x26A0;</span>
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">
            Bir sorun olustu
          </h2>
          <p className="text-center text-sm text-surface-500 dark:text-surface-400">
            Uygulama beklenmedik bir hatayla karsilasti.
          </p>
          <button
            onClick={this.handleRetry}
            aria-label="Uygulamayı tekrar dene"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 active:bg-primary-800"
          >
            <RefreshCw className="h-4 w-4" />
            Tekrar Dene
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
