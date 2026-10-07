import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { keys } from '../lib/queryKeys';
import { getBusiness } from '../api/business.api';
import { listCustomers } from '../api/customer.api';
import { listProducts } from '../api/product.api';
import { getInvoice } from '../api/invoice.api';
import { getDashboard } from '../api/dashboard.api';

/** Resolves to null (not an error) when the user has not created a business profile yet (backend: 404). */
export const useBusiness = () =>
  useQuery({
    queryKey: keys.business,
    queryFn: async () => {
      try {
        return await getBusiness();
      } catch (error) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    },
    staleTime: 5 * 60_000,
  });

export const useCustomers = () => useQuery({ queryKey: keys.customers, queryFn: listCustomers });
export const useProducts = () => useQuery({ queryKey: keys.products, queryFn: listProducts });

export const useInvoice = (id) =>
  useQuery({ queryKey: keys.invoice(id), queryFn: () => getInvoice(id), enabled: Boolean(id) });

/** GET /dashboard also serves the invoice list (`data.invoices`) — the backend has no other list endpoint. */
export const useDashboard = (params = {}) =>
  useQuery({
    queryKey: keys.dashboard(params),
    queryFn: ({ signal }) => getDashboard(params, { signal }),
    placeholderData: keepPreviousData,
  });
