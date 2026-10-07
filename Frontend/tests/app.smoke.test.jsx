import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { client } from '../src/api/client';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { ToastProvider } from '../src/components/feedback/ToastProvider';
import { AuthProvider } from '../src/components/auth/AuthProvider';
import App from '../src/App';

const user = { id: 'u1', username: 'nikhil', email: 'n@x.co', isVerified: true, isActive: true, createdAt: '2026-01-01' };
const business = { currency: 'INR', businessName: 'Acme', invoicePrefix: 'INV', invoiceStartNumber: 3 };
const customer = { customerName: 'Very Long Customer Name Pvt Ltd '.repeat(3), email: 'long.email.address@example-company.com', phone: '9876543210' };
const invoice = {
  _id: 'i1', invoiceNumber: 'INV-2', status: 'Pending', grandTotal: 1180, dueDate: '2000-01-01T00:00:00.000Z', createdAt: '2026-02-01T00:00:00.000Z',
  invoiceDate: '2026-02-01T00:00:00.000Z', subTotal: 1000, totalTax: 180, totalDiscount: 0, paymentMethod: 'UPI', notes: 'n', termsAndConditions: 't',
  business: { ...business, businessName: 'Acme', address: { addressLine1: 'x', city: 'Pune', state: 'Maharashtra', postalCode: '411001', country: 'India' } },
  customer: { ...customer, billingAddress: { addressLine1: 'x', city: 'Pune', state: 'Maharashtra', postalCode: '411001', country: 'India' } },
  items: [{ productId: 'p1', productName: 'Widget', unit: 'piece', price: 1000, quantity: 1, taxRate: 18, discount: 0, lineTotal: 1180 }],
};
const dashboard = {
  stats: { totalCustomers: 1, totalProducts: 1, totalInvoices: 1, paidInvoices: 0, pendingInvoices: 1, overdueInvoices: 1, totalRevenue: 0, totalDueAmount: 1180 },
  invoices: { invoices: [{ ...invoice, totalAmount: 1180, paymentStatus: 'Pending' }], pagination: { totalInvoices: 1, currentPage: 1, totalPages: 1, limit: 10 } },
  revenueChart: [], invoiceStatusChart: [{ _id: 'Pending', totalInvoices: 1 }], topCustomers: [], topProducts: [],
  recentInvoices: [{ ...invoice, totalAmount: 1180, paymentStatus: 'Pending' }],
};

let authed = true;
let overrides = {};
const ok = (data) => ({ status: 200, data: { success: true, data } });
const fail = (status, message) => ({ status, data: { success: false, message } });

beforeAll(() => {
  window.matchMedia ??= (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
  client.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url}`;
    const table = {
      'GET /profile': authed ? ok(user) : fail(401, 'Authentication token is required'),
      'POST /refresh-token': fail(401, 'Authentication token is required'),
      'GET /business': ok(business),
      'GET /dashboard': ok(dashboard),
      'GET /customer': ok([{ _id: 'c1', ...customer }]),
      'GET /product': ok([{ _id: 'p1', productName: 'Widget', price: 1000, unit: 'piece', taxRate: 18, discount: 0 }]),
      'GET /invoice/i1': ok(invoice),
      ...overrides,
    };
    const res = table[key] ?? fail(404, `unmocked ${key}`);
    if (res.status < 300) return { ...res, headers: {}, config, request: {} };
    const err = new Error('x'); err.isAxiosError = true; err.config = config; err.response = { ...res, headers: {}, config }; throw err;
  };
});
afterEach(() => { cleanup(); authed = true; overrides = {}; });

function renderAt(path) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <ThemeProvider><QueryClientProvider client={qc}><ToastProvider><MemoryRouter initialEntries={[path]}>
      <AuthProvider><App /></AuthProvider>
    </MemoryRouter></ToastProvider></QueryClientProvider></ThemeProvider>,
  );
}

describe('app smoke (mocked backend, jsdom)', () => {
  it('redirects signed-out users to the login form', async () => {
    authed = false;
    renderAt('/invoices');
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeTruthy();
  });
  it('renders dashboard stats from /dashboard', async () => {
    renderAt('/');
    expect(await screen.findByText('Outstanding')).toBeTruthy();
    expect((await screen.findAllByText('INV-2')).length).toBeGreaterThan(0);
  });
  it('shows an error state with retry when the dashboard fails', async () => {
    overrides = { 'GET /dashboard': fail(500, 'boom: stack trace') };
    renderAt('/');
    expect(await screen.findByText(/couldn’t load your dashboard/i)).toBeTruthy();
    expect(screen.queryByText(/stack trace/)).toBeNull();
  });
  it('renders the invoice list with a past-due marker', async () => {
    renderAt('/invoices');
    await waitFor(() => expect(screen.getAllByText('Past due').length).toBeGreaterThan(0));
  });
  it('shows the empty state for an empty list', async () => {
    overrides = { 'GET /dashboard': ok({ ...dashboard, invoices: { invoices: [], pagination: { totalInvoices: 0, currentPage: 1, totalPages: 0, limit: 10 } } }) };
    renderAt('/invoices');
    expect(await screen.findByText('No invoices yet')).toBeTruthy();
  });
  it('renders the invoice detail page', async () => {
    renderAt('/invoices/i1');
    expect((await screen.findAllByText('Widget')).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /email/i })).toBeTruthy();
  });
  it('renders the new-invoice form with customers and products', async () => {
    renderAt('/invoices/new');
    expect(await screen.findByRole('button', { name: /create invoice/i })).toBeTruthy();
  });
  it('renders the edit form pre-filled', async () => {
    renderAt('/invoices/i1/edit');
    expect(await screen.findByRole('button', { name: /save changes/i })).toBeTruthy();
  });
  it('renders customers, products, business and account pages', async () => {
    for (const [path, text] of [['/customers', /add customer/i], ['/products', /add product/i], ['/business', /save changes/i], ['/profile', /change password/i]]) {
      const { unmount } = renderAt(path);
      expect((await screen.findAllByText(text)).length).toBeGreaterThan(0);
      unmount();
    }
  });
  it('shows 404 inside the app shell', async () => {
    renderAt('/nope');
    expect(await screen.findByText('Page not found')).toBeTruthy();
  });
});
