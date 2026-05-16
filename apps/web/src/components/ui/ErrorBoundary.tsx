import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './index';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          textAlign: 'center',
          background: '#12121a',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
          margin: 24,
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ color: '#64748b', fontSize: 13, maxWidth: 400, marginBottom: 20, lineHeight: 1.6 }}>
            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary" onClick={this.handleReset}>
              Try Again
            </Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
