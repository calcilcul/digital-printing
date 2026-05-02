import React from 'react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="glass-card max-w-md w-full p-8 rounded-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Oops! Terjadi Kesalahan</h1>
            <p className="text-slate-600 text-sm">
              Kami mohon maaf, terjadi kesalahan pada sistem kami. Silakan coba muat ulang halaman.
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 bg-red-50 text-red-800 text-xs text-left rounded-lg overflow-auto max-h-32">
                <code>{this.state.error.toString()}</code>
              </div>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
