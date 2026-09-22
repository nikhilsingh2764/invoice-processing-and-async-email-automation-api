import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

import {
    createInvoice,
    deleteInvoice,
    downloadInvoicePDF,
    duplicateInvoice,
    getInvoiceById,
    sendInvoiceEmail,
    updateInvoice,
} from "../api/invoice.service";

import { getDashboard } from "../api/dashboard.service";

import { getErrorMessage } from "../utils/format";

// ==========================
// Invoice list
//
// There is no dedicated GET /invoice list endpoint on the backend, so the
// list page is powered by the dashboard endpoint, which accepts the same
// search / filter / sort / pagination query params. See api/dashboard.service.js.
// ==========================
export const useInvoiceList = (params = {}) => {

    return useQuery({
        queryKey: ["invoices", params],
        queryFn: async () => {
            const res = await getDashboard(params);
            return res.data.invoices; // { invoices: [...], pagination: {...} }
        },
        placeholderData: (previous) => previous,
    });
};

export const useInvoice = (id) => {

    return useQuery({
        queryKey: ["invoice", id],
        queryFn: async () => {
            const res = await getInvoiceById(id);
            return res.data;
        },
        enabled: Boolean(id),
    });
};

const invalidateInvoiceLists = (queryClient) => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
};

export const useSaveInvoice = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) =>
            id ? updateInvoice(id, data) : createInvoice(data),

        onSuccess: (_res, variables) => {
            invalidateInvoiceLists(queryClient);
            if (variables.id) {
                queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] });
            }
            toast.success(variables.id ? "Invoice updated" : "Invoice created");
        },

        onError: (error) => {
            toast.error(getErrorMessage(error, "Could not save invoice"));
        },
    });
};

export const useDeleteInvoice = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteInvoice(id),

        onSuccess: () => {
            invalidateInvoiceLists(queryClient);
            toast.success("Invoice deleted");
        },

        onError: (error) => {
            toast.error(getErrorMessage(error, "Could not delete invoice"));
        },
    });
};

export const useDuplicateInvoice = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => duplicateInvoice(id),

        onSuccess: () => {
            invalidateInvoiceLists(queryClient);
            toast.success("Invoice duplicated as a new draft");
        },

        onError: (error) => {
            toast.error(getErrorMessage(error, "Could not duplicate invoice"));
        },
    });
};

// ==========================
// PDF download with retry.
//
// The backend queues PDF generation in BullMQ and exposes no status/polling
// route, so the honest approach is: call the download endpoint, and if the
// backend says the job was only just queued (202), wait and try the exact
// same endpoint again — once the worker finishes, Redis will have the PDF
// cached and the next call returns the binary. We surface real "generating"
// state to the user throughout instead of ever claiming a false success.
// ==========================
export const useInvoicePDF = () => {

    const [status, setStatus] = useState("idle"); // idle | generating | done | error

    const download = async (id, invoiceNumber = "invoice") => {

        setStatus("generating");

        const maxAttempts = 8;
        const delayMs = 2500;

        try {

            for (let attempt = 0; attempt < maxAttempts; attempt += 1) {

                const result = await downloadInvoicePDF(id);

                if (!result.queued) {

                    const url = window.URL.createObjectURL(result.blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `${invoiceNumber}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);

                    setStatus("done");
                    toast.success("Invoice PDF downloaded");
                    return;
                }

                if (attempt === 0) {
                    toast("Generating your PDF — this usually takes a few seconds…", { icon: "⏳" });
                }

                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }

            setStatus("error");
            toast.error("The PDF is still generating. Please try downloading again in a moment.");

        } catch (error) {
            setStatus("error");
            toast.error(getErrorMessage(error, "Could not generate invoice PDF"));
        }
    };

    return { download, status };
};

// The backend only confirms the email was *queued*, not delivered — the
// toast intentionally says "queued", never "sent" or "delivered".
export const useSendInvoiceEmail = () => {

    return useMutation({
        mutationFn: (id) => sendInvoiceEmail(id),

        onSuccess: () => {
            toast.success("Invoice email has been queued for delivery");
        },

        onError: (error) => {
            toast.error(getErrorMessage(error, "Could not queue invoice email"));
        },
    });
};
