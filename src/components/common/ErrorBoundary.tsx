import React from "react";

export type ErrorBoundaryProps = {
  children: React.ReactNode;
  onReset?: () => void;
  fallback?: (error: Error | null) => React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    try {
      this.props.onReset?.();
    } catch {}
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback(this.state.error);
      return (
        <div className="w-full p-6 border rounded-md bg-muted/30">
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mb-4">
            An unexpected error occurred while rendering this section.
          </p>
          <div className="flex gap-2">
            <button
              className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm"
              onClick={this.handleReset}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
