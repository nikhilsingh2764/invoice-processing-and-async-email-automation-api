import { Component } from 'react';
import Button from '../common/Button';

export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="grid min-h-dvh place-items-center bg-canvas p-6 text-center">
        <div>
          <h1 className="text-xl font-semibold text-fg">Something went wrong</h1>
          <p className="mt-1 text-sm text-fg-muted">An unexpected error occurred. Reloading usually fixes it.</p>
          <Button className="mt-5" onClick={() => window.location.reload()}>Reload page</Button>
        </div>
      </div>
    );
  }
}
