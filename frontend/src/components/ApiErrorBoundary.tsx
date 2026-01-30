import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary for catching API and rendering errors
 */
class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('ApiErrorBoundary caught an error:', error, errorInfo);

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Optional: Send to error tracking service (Sentry, LogRocket, etc.)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                      <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-red-900 dark:text-red-100">
                      Something went wrong
                    </h1>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      The application encountered an unexpected error
                    </p>
                  </div>
                </div>
              </div>

              {/* Error details */}
              <div className="px-6 py-6">
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Error Details:
                  </h2>
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <code className="text-sm text-red-600 dark:text-red-400 font-mono break-words">
                      {this.state.error?.message || 'Unknown error'}
                    </code>
                  </div>
                </div>

                {/* Stack trace (development only) */}
                {import.meta.env.DEV && this.state.errorInfo && (
                  <div className="mb-6">
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 hover:text-gray-900 dark:hover:text-gray-100">
                        Stack Trace (Click to expand)
                      </summary>
                      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mt-2 overflow-auto max-h-64">
                        <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={this.handleReset}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <FiHome className="w-4 h-4" />
                    Go Home
                  </button>
                </div>

                {/* Help text */}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                  If this problem persists, please contact support with the error details above.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ApiErrorBoundary;

/**
 * Hook-based error boundary wrapper for functional components
 */
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
  fallback,
}) => {
  return (
    <ApiErrorBoundary fallback={fallback}>
      {children}
    </ApiErrorBoundary>
  );
};
