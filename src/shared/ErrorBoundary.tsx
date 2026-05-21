import { Component } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error | null, retry: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleRetry = (event?: React.MouseEvent<HTMLElement>) => {
    event?.preventDefault();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return (
        <div className="eb-shell">
          <div className="eb-card">
            <div className="eb-wordmark">flodesk</div>

            <h1 className="eb-title">Oops!</h1>
            <p className="eb-body">
              It looks like something went wrong on our side.
              <br />
              Please{" "}
              <button
                type="button"
                onClick={this.handleRetry}
                className="eb-link-button"
              >
                try again
              </button>{" "}
              or <a href="/">go back home</a>.
            </p>

            <div className="paper-airplane" aria-hidden="true">
              <div className="paper-airplane__line">
                <div className="paper-airplane__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 12 L22 2 L18 12 L22 22 Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
