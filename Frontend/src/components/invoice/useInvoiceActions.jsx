import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Copy, Download, Mail, Pencil, Trash2, Eye } from 'lucide-react';
import ConfirmDialog from '../modals/ConfirmDialog';
import { useToast } from '../feedback/toast-context';
import { deleteInvoice, downloadInvoicePdf, duplicateInvoice, emailInvoice } from '../../api/invoice.api';
import { getErrorMessage } from '../../lib/errors';
import { keys } from '../../lib/queryKeys';
import { markListsStale } from '../../lib/staleNotice';
import { saveBlob } from '../../lib/download';

/**
 * Shared invoice operations (delete, duplicate, PDF, email) used by the list rows and the detail page.
 * Returns handlers, a `menuItems(invoice)` helper for <Dropdown>, and the confirmation dialogs to render.
 */
export function useInvoiceActions({ onDeleted } = {}) {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState(null); // { type: 'delete' | 'email', invoice }
  const [pdfInvoiceId, setPdfInvoiceId] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const duplicateMutation = useMutation({
    mutationFn: (id) => duplicateInvoice(id),
    onSuccess: (invoice) => {
      markListsStale();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Draft ${invoice.invoiceNumber} created from the original.`);
      navigate(`/invoices/${invoice._id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteInvoice(id),
    onSuccess: (_data, id) => {
      markListsStale();
      queryClient.removeQueries({ queryKey: keys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Invoice deleted.');
      setConfirm(null);
      onDeleted?.(id);
    },
    onError: (error) => { toast.error(getErrorMessage(error)); setConfirm(null); },
  });

  const emailMutation = useMutation({
    mutationFn: (id) => emailInvoice(id),
    onSuccess: (res) => {
      toast.success(res?.message || 'Invoice email queued.');
      setConfirm(null);
    },
    onError: (error) => { toast.error(getErrorMessage(error)); setConfirm(null); },
  });

  const downloadPdf = async (invoice) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setPdfInvoiceId(invoice._id);
    try {
      const blob = await downloadInvoicePdf(invoice._id, {
        signal: controller.signal,
        onQueued: () => toast.info('Generating your PDF…'),
      });
      saveBlob(blob, `${invoice.invoiceNumber || invoice._id}.pdf`);
    } catch (error) {
      if (axios.isCancel(error) || error?.name === 'AbortError') return;
      toast.error(error?.code === 'PDF_TIMEOUT' ? error.message : getErrorMessage(error));
    } finally {
      if (abortRef.current === controller) setPdfInvoiceId(null);
    }
  };

  const menuItems = (invoice, { includeView = true, includeEdit = true } = {}) => [
    ...(includeView ? [{ label: 'View', icon: Eye, onClick: () => navigate(`/invoices/${invoice._id}`) }] : []),
    ...(includeEdit ? [{ label: 'Edit', icon: Pencil, onClick: () => navigate(`/invoices/${invoice._id}/edit`) }] : []),
    { label: 'Download PDF', icon: Download, onClick: () => downloadPdf(invoice), disabled: pdfInvoiceId === invoice._id },
    { label: 'Email to customer', icon: Mail, onClick: () => setConfirm({ type: 'email', invoice }) },
    { label: 'Duplicate', icon: Copy, onClick: () => duplicateMutation.mutate(invoice._id), disabled: duplicateMutation.isPending },
    { divider: true },
    { label: 'Delete', icon: Trash2, danger: true, onClick: () => setConfirm({ type: 'delete', invoice }) },
  ];

  const invoice = confirm?.invoice;
  const dialogs = (
    <>
      <ConfirmDialog
        open={confirm?.type === 'delete'}
        title="Delete this invoice?"
        message={`Invoice ${invoice?.invoiceNumber ?? ''} will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete invoice"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(invoice._id)}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.type === 'email'}
        title="Email this invoice?"
        message={`Invoice ${invoice?.invoiceNumber ?? ''} will be sent as a PDF attachment to ${invoice?.customer?.email ?? 'the customer'}.`}
        confirmLabel="Send email"
        tone="primary"
        loading={emailMutation.isPending}
        onConfirm={() => emailMutation.mutate(invoice._id)}
        onCancel={() => setConfirm(null)}
      />
    </>
  );

  return {
    dialogs,
    menuItems,
    downloadPdf,
    isDownloadingPdf: (id) => pdfInvoiceId === id,
    requestDelete: (inv) => setConfirm({ type: 'delete', invoice: inv }),
    requestEmail: (inv) => setConfirm({ type: 'email', invoice: inv }),
    duplicate: (inv) => duplicateMutation.mutate(inv._id),
    isDuplicating: duplicateMutation.isPending,
  };
}
