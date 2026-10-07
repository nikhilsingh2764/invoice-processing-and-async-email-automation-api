import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { ThemeProvider } from './theme/ThemeProvider';
import { ToastProvider } from './components/feedback/ToastProvider';
import { AuthProvider } from './components/auth/AuthProvider';
import ErrorBoundary from './components/feedback/ErrorBoundary';
import { queryClient } from './lib/queryClient';
import { GOOGLE_CLIENT_ID } from './config/env';
import './styles/index.css';

const tree = (
  <ErrorBoundary>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* The Google script is initialised once, and only when a client ID is configured. */}
    {GOOGLE_CLIENT_ID ? <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{tree}</GoogleOAuthProvider> : tree}
  </StrictMode>,
);
