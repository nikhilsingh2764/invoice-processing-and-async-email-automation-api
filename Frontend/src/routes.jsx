import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { AuthProvider } from './hooks/useAuth.jsx'
import Root from './layouts/Root.jsx'
import { RequireAuth, PublicOnly } from './layouts/Guards.jsx'
import PublicLayout from './layouts/PublicLayout.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import { RouteError, NotFoundScreen } from './components/layout/ErrorScreens.jsx'
import { Splash } from './components/layout/Splash.jsx'

const page = (loader) => {
  const C = lazy(loader)
  return (
    <Suspense fallback={<Splash label="Loading page" />}>
      <C />
    </Suspense>
  )
}

const publicRoutes = [
  { index: true, element: page(() => import('./pages/public/Home.jsx')) },
  { path: 'features', element: page(() => import('./pages/public/Features.jsx')) },
  { path: 'pricing', element: page(() => import('./pages/public/Pricing.jsx')) },
  { path: 'faq', element: page(() => import('./pages/public/Faq.jsx')) },
  { path: 'support', element: page(() => import('./pages/public/Support.jsx')) },
  { path: 'about', element: page(() => import('./pages/public/About.jsx')) },
  { path: 'security', element: page(() => import('./pages/public/SecurityPage.jsx')) },
  { path: 'accessibility', element: page(() => import('./pages/public/Accessibility.jsx')) },
  { path: 'status', element: page(() => import('./pages/public/Status.jsx')) },
  { path: 'privacy', element: page(() => import('./pages/legal/Privacy.jsx')) },
  { path: 'terms', element: page(() => import('./pages/legal/Terms.jsx')) },
  { path: 'cookies', element: page(() => import('./pages/legal/Cookies.jsx')) },
  { path: 'data-rights', element: page(() => import('./pages/legal/DataRights.jsx')) },
  { path: 'grievance', element: page(() => import('./pages/legal/Grievance.jsx')) },
]

const authRoutes = [
  { path: 'login', element: page(() => import('./pages/auth/Login.jsx')) },
  { path: 'signup', element: page(() => import('./pages/auth/Signup.jsx')) },
  { path: 'verify-otp', element: page(() => import('./pages/auth/VerifyOtp.jsx')) },
  { path: 'forgot-password', element: page(() => import('./pages/auth/ForgotPassword.jsx')) },
  { path: 'reset-password', element: page(() => import('./pages/auth/ResetPassword.jsx')) },
]

const appRoutes = [
  { path: 'dashboard', element: page(() => import('./pages/app/Dashboard.jsx')) },
  { path: 'invoices', element: page(() => import('./pages/app/InvoiceList.jsx')) },
  { path: 'invoices/new', element: page(() => import('./pages/app/InvoiceForm.jsx')) },
  { path: 'invoices/:id', element: page(() => import('./pages/app/InvoiceDetail.jsx')) },
  { path: 'invoices/:id/edit', element: page(() => import('./pages/app/InvoiceForm.jsx')) },
  { path: 'customers', element: page(() => import('./pages/app/Customers.jsx')) },
  { path: 'products', element: page(() => import('./pages/app/Products.jsx')) },
  { path: 'business', element: page(() => import('./pages/app/Business.jsx')) },
  { path: 'account', element: page(() => import('./pages/app/Account.jsx')) },
]

// The style guide is dev/mock only; the condition is a compile-time constant so it is removed from production builds.
const devRoutes = import.meta.env.DEV || import.meta.env.VITE_MOCK === 'true' ? [{ path: '__styleguide', element: page(() => import('./pages/dev/Styleguide.jsx')) }] : []

export const routes = [
  {
    element: (
      <AuthProvider>
        <Root />
      </AuthProvider>
    ),
    errorElement: <RouteError />,
    children: [
      { element: <PublicOnly />, children: [{ element: <PublicLayout />, children: publicRoutes.slice(0, 1) }] },
      { element: <PublicLayout />, children: publicRoutes.slice(1) },
      { element: <PublicOnly />, children: [{ element: <AuthLayout />, children: authRoutes }] },
      { element: <RequireAuth />, children: [{ element: <AppLayout />, children: appRoutes }] },
      ...devRoutes,
      { path: 'app', element: <Navigate to="/dashboard" replace /> },
      { path: '*', element: <NotFoundScreen /> },
    ],
  },
]

export const createRouter = () => createBrowserRouter(routes)
