'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-line bg-bg-elevated">
            <p className="text-sm text-text-faint">
              Chart failed to render.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
