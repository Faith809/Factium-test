
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { IconRefresh } from './Icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-12 bg-surface/40 border border-primary/20 rounded-[3rem] backdrop-blur-xl text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <IconRefresh className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-text italic font-serif">Neural Link Interrupted</h2>
          <p className="text-text-muted max-w-md mx-auto font-serif italic">
            The connection to the intelligence core was lost. This can happen in high-security environments.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            RETRY CONNECTION
          </button>
          {this.state.error && (
            <p className="text-[10px] font-mono text-text-muted opacity-40 mt-8">
              Error Code: {this.state.error.message}
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
