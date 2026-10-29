// TanStack Query hooks. Query keys come from the `qk` factory; payload shaping lives in api/payloads.
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi, businessApi, customerApi, dashboardApi, healthApi, invoiceApi, productApi } from '../api/endpoints.js'
import { qk } from '../api/queryKeys.js'
import { normalizeError } from '../api/errors.js'

const retry = (count, error) => {
  const s = normalizeError(error).status
  return count < 2 && (s === 0 || s >= 500) && s !== 503
}

export const useBusiness = (options) => useQuery({ queryKey: qk.business(), queryFn: ({ signal }) => businessApi.get({ signal }), retry, ...options })
export const useCustomers = () => useQuery({ queryKey: qk.customers(), queryFn: ({ signal }) => customerApi.list({ signal }), retry })
export const useProducts = () => useQuery({ queryKey: qk.products(), queryFn: ({ signal }) => productApi.list({ signal }), retry })
export const useInvoice = (id) => useQuery({ queryKey: qk.invoice(id), queryFn: ({ signal }) => invoiceApi.get(id, { signal }), enabled: Boolean(id), retry })
export const useDashboard = (params) =>
  useQuery({ queryKey: qk.dashboard(params), queryFn: ({ signal }) => dashboardApi.get(params, { signal }), placeholderData: keepPreviousData, retry, staleTime: 15000 })
export const useAttention = () =>
  useQuery({ queryKey: qk.attention(), queryFn: ({ signal }) => dashboardApi.get({ status: 'Overdue', limit: 5, sort: 'dueDate', order: 'asc' }, { signal }), retry, staleTime: 15000 })
export const useHealth = (enabled = true) =>
  useQuery({ queryKey: qk.health(), queryFn: ({ signal }) => healthApi.get({ signal }), enabled, refetchInterval: 30000, retry: false, staleTime: 30000 })

function crud(api, listKey, itemKey) {
  const invalidate = (qc) => qc.invalidateQueries({ queryKey: qk.dashboardRoot() })
  return {
    useCreate: () => {
      const qc = useQueryClient()
      return useMutation({
        mutationFn: (v) => api.create(v),
        onSuccess: (item) => {
          // Only prepend when the list is already cached; otherwise the cache would hold just this one row.
          qc.setQueryData(listKey(), (old) => (old ? [item, ...old] : old))
          qc.invalidateQueries({ queryKey: listKey() })
          invalidate(qc)
        },
      })
    },
    useUpdate: () => {
      const qc = useQueryClient()
      return useMutation({
        mutationFn: ({ id, values }) => api.update(id, values),
        onSuccess: (item) => {
          qc.setQueryData(listKey(), (old = []) => old.map((x) => (x.id === item.id ? item : x)))
          qc.setQueryData(itemKey(item.id), item)
          invalidate(qc)
        },
      })
    },
    /** Command pattern: removal is optimistic and returns an `undo` the toast can call. */
    useRemove: () => {
      const qc = useQueryClient()
      return useMutation({
        mutationFn: (id) => api.remove(id),
        onMutate: async (id) => {
          await qc.cancelQueries({ queryKey: listKey() })
          const previous = qc.getQueryData(listKey())
          qc.setQueryData(listKey(), (old = []) => old.filter((x) => x.id !== id))
          return { previous }
        },
        onError: (_e, _id, ctx) => ctx?.previous && qc.setQueryData(listKey(), ctx.previous),
        onSettled: () => invalidate(qc),
      })
    },
  }
}

export const customerMutations = crud(customerApi, qk.customers, qk.customer)
export const productMutations = crud(productApi, qk.products, qk.product)

export function useSaveBusiness() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ exists, values }) => (exists ? businessApi.update(values) : businessApi.create(values)),
    onSuccess: (b) => qc.setQueryData(qk.business(), b),
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v) => invoiceApi.create(v),
    onSuccess: (inv) => {
      qc.setQueryData(qk.invoice(inv.id), inv)
      qc.invalidateQueries({ queryKey: qk.dashboardRoot() })
      qc.invalidateQueries({ queryKey: qk.business() })
    },
  })
}

export function useUpdateInvoice(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ values, original }) => invoiceApi.update(id, values, original),
    onSuccess: (inv) => {
      qc.setQueryData(qk.invoice(id), inv)
      qc.invalidateQueries({ queryKey: qk.dashboardRoot() })
    },
  })
}

/** Status change patches the cached invoice and every dashboard page optimistically, rolling back on error. */
export function useSetInvoiceStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => invoiceApi.setStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: qk.invoice(id) })
      const prevInvoice = qc.getQueryData(qk.invoice(id))
      const prevDash = qc.getQueriesData({ queryKey: qk.dashboardRoot() })
      if (prevInvoice) qc.setQueryData(qk.invoice(id), { ...prevInvoice, status })
      qc.setQueriesData({ queryKey: qk.dashboardRoot() }, (d) => (d?.invoices ? { ...d, invoices: d.invoices.map((i) => (i.id === id ? { ...i, status } : i)) } : d))
      return { prevInvoice, prevDash }
    },
    onError: (_e, { id }, ctx) => {
      if (ctx?.prevInvoice) qc.setQueryData(qk.invoice(id), ctx.prevInvoice)
      ctx?.prevDash?.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: (_d, _e, { id }) => {
      qc.invalidateQueries({ queryKey: qk.invoice(id) })
      qc.invalidateQueries({ queryKey: qk.dashboardRoot() })
    },
  })
}

export function useDuplicateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => invoiceApi.duplicate(id),
    onSuccess: (inv) => {
      qc.setQueryData(qk.invoice(inv.id), inv)
      qc.invalidateQueries({ queryKey: qk.dashboardRoot() })
      qc.invalidateQueries({ queryKey: qk.business() })
    },
  })
}

export function useDeleteInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => invoiceApi.remove(id),
    onSuccess: (_d, id) => {
      qc.removeQueries({ queryKey: qk.invoice(id) })
      qc.invalidateQueries({ queryKey: qk.dashboardRoot() })
    },
  })
}

export const useUpdateProfile = () => {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (v) => authApi.updateProfile(v), onSuccess: (u) => qc.setQueryData(qk.profile(), u) })
}
