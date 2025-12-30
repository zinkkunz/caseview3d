
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
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

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] bg-slate-50 text-slate-800 p-6 rounded-lg border border-slate-200 shadow-sm">
                    <div className="bg-red-100 p-4 rounded-full mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                    <p className="text-slate-600 text-center mb-6 max-w-md">
                        The 3D Viewer encountered an unexpected error.
                        <br />
                        <span className="text-xs text-slate-400 mt-2 block font-mono bg-slate-100 p-2 rounded">
                            {this.state.error?.message}
                        </span>
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                        <RefreshCcw size={16} />
                        Reload Viewer
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
