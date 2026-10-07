import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PublicOnly, RequireAuth } from './components/auth/Guards';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import { PageSpinner } from './components/feedback/Spinner';
import NotFoundPage from './pages/NotFoundPage';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const VerifyOtpPage = lazy(() => import('./pages/auth/VerifyOtpPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const InvoicesPage = lazy(() => import('./pages/invoices/InvoicesPage'));
const NewInvoicePage = lazy(() => import('./pages/invoices/NewInvoicePage'));
const EditInvoicePage = lazy(() => import('./pages/invoices/EditInvoicePage'));
const InvoiceDetailPage = lazy(() => import('./pages/invoices/InvoiceDetailPage'));
const CustomersPage = lazy(() => import('./pages/customers/CustomersPage'));
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'));
const BusinessPage = lazy(() => import('./pages/business/BusinessPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));

export default function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route element={<PublicOnly />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/new" element={<NewInvoicePage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="/invoices/:id/edit" element={<EditInvoicePage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/business" element={<BusinessPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
