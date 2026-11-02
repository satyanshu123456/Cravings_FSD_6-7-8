import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-(--color-base-200) border border-(--color-base-300) rounded-2xl p-8 max-w-lg w-full shadow-sm">
            <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
            <p className="text-xs text-(--color-neutral) mb-6">
              An unexpected error occurred while rendering this page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-(--color-primary) text-(--color-primary-content) font-bold rounded-xl text-xs hover:opacity-90 transition shadow-xs"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

