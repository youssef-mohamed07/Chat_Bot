// ===================================
// ERROR BOUNDARY
// React error boundary component
// ===================================

import React, { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Error caught:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              عذراً، حدث خطأ
            </h2>
            <p className="text-gray-600 mb-6">
              حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left mb-4 p-4 bg-gray-100 rounded">
                <summary className="cursor-pointer font-semibold text-sm">
                  تفاصيل الخطأ (Dev Mode)
                </summary>
<pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <button
              onClick={this.handleReset}
              className="px-6 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
